// web/src/app/api/webhooks/instagram/route.ts
import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";
import { generateSetterReply, ConversationHistoryItem } from "@/lib/setter-ai";
import {
  eventKey,
  eventTimestampToDate,
  isStaleEvent,
  isWithinMessagingWindow,
  markWebhookEventOnce,
  pruneOldWebhookEvents,
  verifyMetaSignature,
} from "@/lib/meta-webhook";
import {
  replyToInstagramComment,
  sendInstagramPrivateReply,
  sendInstagramText,
} from "@/lib/instagram-api";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "autosetter_secure_verify_2026";

interface InstagramCommentEvent {
  id: string;
  text?: string;
  from?: { id: string; username: string };
  media?: { id: string };
}

interface InstagramMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp?: number;
  message: { mid?: string; text?: string; is_echo?: boolean; app_id?: string };
}

interface MetaWebhookBody {
  object?: string;
  entry?: Array<{
    id: string | number;
    changes?: Array<{ field?: string; value?: InstagramCommentEvent }>;
    messaging?: InstagramMessagingEvent[];
  }>;
}

// El trabajo real corre dentro de after(), que incluye delays humanizados de hasta 60s.
export const maxDuration = 60;

/**
 * GET: Verificación de Webhook por parte de Meta (hub.challenge)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta Webhook] Verificación exitosa.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[Meta Webhook] Token de verificación inválido:", token);
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST: Recepción de eventos en tiempo real (Multi-tenant)
 *
 * Endurecido contra los dos problemas clásicos de Meta:
 *  - Verificamos X-Hub-Signature-256 sobre el body crudo antes de procesar nada.
 *  - Deduplicamos por mid / comment id: Meta reintenta entregas y sin esto se duplican DMs.
 */
export async function POST(req: NextRequest) {
  // La firma se calcula sobre el body crudo, así que hay que leerlo como texto.
  const rawBody = await req.text();

  const signature = verifyMetaSignature(
    rawBody,
    req.headers.get("x-hub-signature-256")
  );

  if (!signature.ok) {
    console.warn(`[Meta Webhook] Evento rechazado: ${signature.reason}`);
    return NextResponse.json({ error: signature.reason }, { status: signature.status });
  }

  let body: MetaWebhookBody;
  try {
    body = JSON.parse(rawBody) as MetaWebhookBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body?.object !== "instagram") {
    return NextResponse.json({ status: "NOT_SUPPORTED" }, { status: 404 });
  }

  try {
    for (const entry of body.entry ?? []) {
      const instagramBusinessId = String(entry.id);

      // 1. Comentarios en Publicaciones / Reels
      for (const change of entry.changes ?? []) {
        const comment = change.value;
        if (change.field !== "comments" || !comment?.id) continue;
        // after() garantiza que Meta reciba el 200 al instante y el trabajo siga en background.
        after(async () => {
          await handleInstagramComment(comment, instagramBusinessId);
          await pruneOldWebhookEvents();
        });
      }

      // 2. Mensajes Directos (DMs)
      for (const messageEvent of entry.messaging ?? []) {
        if (!messageEvent.message) continue;

        // Echo = mensaje saliente. Si trae app_id lo envió nuestra app (ya lo registramos).
        // Si NO trae app_id, lo escribió una persona desde el celular: pausamos la IA.
        if (messageEvent.message.is_echo) {
          if (!messageEvent.message.app_id) {
            after(async () => {
              await handleHumanEcho(messageEvent);
              await pruneOldWebhookEvents();
            });
          }
          continue;
        }

        after(async () => {
          await handleInstagramDirectMessage(messageEvent);
          await pruneOldWebhookEvents();
        });
      }
    }
  } catch (error) {
    console.error("[Meta Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }

  return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
}

/* -------------------------------------------------------------------------- */
/*                           Utilidades del webhook                           */
/* -------------------------------------------------------------------------- */

/** Retardo humanizado (anti-spam). */
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** El historial se guarda como texto JSON (compatible con columnas JSON y LONGTEXT). */
function parseHistory(raw: unknown): ConversationHistoryItem[] {
  if (Array.isArray(raw)) return raw as ConversationHistoryItem[];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ConversationHistoryItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* -------------------------------------------------------------------------- */
/*                              Flujo de comentarios                          */
/* -------------------------------------------------------------------------- */

/**
 * Procesa comentarios entrantes en Posts o Reels (Multi-tenant).
 */
async function handleInstagramComment(
  comment: {
    id: string;
    text?: string;
    from?: { id: string; username: string };
    media?: { id: string };
  },
  instagramBusinessId: string
) {
  try {
    const commentId = comment.id;
    const commentText = (comment.text || "").toUpperCase().trim();
    const leadUsername = comment.from?.username || "Usuario";

    // Dedupe: Meta reintenta el webhook y sin esto respondemos dos veces en público.
    const dedupe = await markWebhookEventOnce(eventKey("comment", commentId));
    if (dedupe.duplicate) {
      console.log(`[Comentario] Evento duplicado ${commentId}; ignorado.`);
      return;
    }

    console.log(
      `[Comentario] @${leadUsername} comentó: "${comment.text}" en cuenta IG ${instagramBusinessId}`
    );

    // Buscar la cuenta vinculada al usuario
    const igAccount = await prisma.igAccount.findUnique({
      where: { instagramId: instagramBusinessId },
      include: {
        user: {
          include: { setterConfig: true },
        },
      },
    });

    if (!igAccount) {
      console.warn(`[Comentario] No hay ninguna cuenta registrada con ID: ${instagramBusinessId}`);
      return;
    }

    const config = igAccount.user?.setterConfig;

    // Verificar si el Setter está activo para comentarios
    if (config?.aiEnabled === false || config?.triggerComments === false) {
      console.log(`[Comentario] IA desactivada o triggerComments apagado para @${igAccount.username}.`);
      return;
    }

    const keywords: string[] = Array.isArray(config?.keywords)
      ? (config.keywords as string[])
      : ["INFO", "QUIERO", "PRECIO", "ASESORIA", "AGENDA"];

    const matchesKeyword = keywords.some((kw) => commentText.includes(kw.toUpperCase()));

    if (!matchesKeyword) {
      console.log(`[Comentario] No coincide con palabras clave de @${igAccount.username}. Ignorando.`);
      return;
    }

    // Variantes de respuesta pública para rotación anti-spam
    const businessName = config?.businessName || "Settingfly";
    const publicReplies = [
      `¡Hola @${leadUsername}! Te envié todos los detalles de ${businessName} por mensaje privado.`,
      `¡Listo @${leadUsername}! Revisa tus DMs, te dejé toda la información.`,
      `¡Te escribí al privado @${leadUsername}! Cualquier consulta avisame.`,
      `¡Hola @${leadUsername}! Acabo de enviarte un DM con toda la info.`,
    ];
    const replyText = publicReplies[Math.floor(Math.random() * publicReplies.length)];

    // Delay humanizado (10 a 20 segundos)
    const delaySec = Math.floor(Math.random() * 10) + 10;
    console.log(`[Comentario] Esperando ${delaySec}s antes de responder...`);
    await wait(delaySec * 1000);

    // 1. Responder públicamente al comentario en Instagram
    const publicReply = await replyToInstagramComment({
      account: igAccount,
      commentId,
      message: replyText,
    });

    if (!publicReply.ok) {
      console.warn(
        `[Comentario] No se pudo responder públicamente (${publicReply.error.kind}).`
      );
    }

    // 2. Abrir el DM privado. Instagram exige referenciar el comentario (comment_id),
    //    no el IGSID, y solo lo permite dentro de los 7 días posteriores.
    const initialDmText = `¡Hola @${leadUsername}! Vi tu comentario en nuestra publicación. ¿Actualmente ya cuentas con un negocio en marcha o estás por comenzar?`;
    await wait(3000);

    const privateReply = await sendInstagramPrivateReply({
      account: igAccount,
      commentId,
      text: initialDmText,
    });

    if (!privateReply.ok) {
      console.warn(
        `[Comentario] No se pudo abrir el DM privado de ${commentId} (${privateReply.error.kind}${
          privateReply.error.code ? `/${privateReply.error.code}` : ""
        }).`
      );
      return;
    }

    // El DM quedó abierto: dejamos la conversación creada para que el CRM la muestre
    // y para que el primer mensaje del lead continúe este hilo con la info del comentario.
    const leadId = comment.from?.id;
    if (leadId) {
      const openedAt = new Date();
      const seedHistory: ConversationHistoryItem[] = [
        { role: "assistant", content: initialDmText, timestamp: openedAt.toISOString() },
      ];
      const existing = await prisma.conversation.findFirst({
        where: { igAccountId: igAccount.id, instagramUserId: leadId },
        select: { id: true },
      });

      if (existing) {
        await prisma.conversation.update({
          where: { id: existing.id },
          data: {
            lastOutboundAt: openedAt,
            lastOutboundMid: privateReply.messageId ?? null,
          },
        });
      } else {
        await prisma.conversation.create({
          data: {
            igAccountId: igAccount.id,
            userId: igAccount.userId,
            instagramUserId: leadId,
            instagramUsername: leadUsername,
            status: "qualifying",
            history: JSON.stringify(seedHistory),
            lastOutboundAt: openedAt,
            lastOutboundMid: privateReply.messageId ?? null,
          },
        });
      }
    }
  } catch (error) {
    console.error("[Error en handleInstagramComment]:", error);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Flujo DM                                  */
/* -------------------------------------------------------------------------- */

/**
 * Procesa mensajes directos (DMs) en curso con el AutoSetter IA (Multi-tenant).
 */
async function handleInstagramDirectMessage(messagingEvent: {
  sender: { id: string };
  recipient: { id: string };
  timestamp?: number;
  message: { mid?: string; text?: string; is_echo?: boolean };
}) {
  try {
    const senderId = messagingEvent.sender.id; // ID del prospecto
    const recipientId = messagingEvent.recipient.id; // ID de nuestra cuenta
    const userText = messagingEvent.message.text || "";
    const mid = messagingEvent.message.mid;

    // Un evento más viejo que 24h no se puede contestar libremente: Meta lo rechaza y
    // reintentar solo expone la cuenta. Lo descartamos.
    if (isStaleEvent(messagingEvent.timestamp)) {
      console.warn(
        `[DM] Evento de ${senderId} fuera de la ventana de 24h (timestamp ${messagingEvent.timestamp}); se descarta.`
      );
      return;
    }

    if (mid) {
      const dedupe = await markWebhookEventOnce(eventKey("message", mid));
      if (dedupe.duplicate) {
        console.log(`[DM] Mensaje duplicado ${mid}; ignorado.`);
        return;
      }
    }

    if (!userText.trim()) {
      return; // Mensaje multimedia o sin texto
    }

    console.log(`[DM Entrante] Negocio ID: ${recipientId} | Prospecto: ${senderId} -> "${userText}"`);

    // Buscar cuenta en la base de datos
    const igAccount = await prisma.igAccount.findUnique({
      where: { instagramId: recipientId },
      include: {
        user: {
          include: { setterConfig: true },
        },
      },
    });

    if (!igAccount) {
      console.warn(`[DM] Cuenta de negocio ${recipientId} no registrada.`);
      return;
    }

    const config = igAccount.user?.setterConfig;

    // Verificar si la IA está activa para DMs
    if (config?.aiEnabled === false || config?.triggerDms === false) {
      console.log(`[DM] IA apagada para @${igAccount.username}.`);
      return;
    }

    const inboundAt = eventTimestampToDate(messagingEvent.timestamp);

    // Buscar o inicializar la conversación
    let conversation = await prisma.conversation.findFirst({
      where: {
        igAccountId: igAccount.id,
        instagramUserId: senderId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          igAccountId: igAccount.id,
          userId: igAccount.userId,
          instagramUserId: senderId,
          instagramUsername: `lead_${senderId.slice(-4)}`,
          status: "qualifying",
          history: JSON.stringify([]),
          lastUserMessageAt: inboundAt,
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastUserMessageAt: inboundAt },
      });
    }

    const history = parseHistory(conversation.history);

    // Si la conversación está en modo manual (Human Takeover), la IA no interviene.
    if (conversation.status === "human_takeover") {
      console.log(`[DM] Conversación en Human Takeover para ${senderId}. La IA no responderá.`);
      history.push({
        role: "user",
        content: userText,
        timestamp: inboundAt.toISOString(),
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          history: JSON.stringify(history),
          lastUserMessageAt: inboundAt,
        },
      });
      return;
    }

    // Registrar mensaje del usuario en el historial
    history.push({
      role: "user",
      content: userText,
      timestamp: inboundAt.toISOString(),
    });

    // Generar respuesta con el motor DeepSeek usando el SetterConfig del usuario
    console.log(`[DeepSeek] Generando respuesta de setter para @${igAccount.username}...`);
    const aiResponse = await generateSetterReply(config, history, userText);
    console.log(`[DeepSeek Respuesta]: "${aiResponse}"`);

    // Registrar respuesta del asistente en el historial
    history.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // Evaluar si se envió el link de agenda para actualizar el estado del CRM
    let newStatus = conversation.status || "qualifying";
    if (config?.bookingUrl && aiResponse.includes(config.bookingUrl)) {
      newStatus = "ready_for_call";
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        history: JSON.stringify(history),
        status: newStatus,
      },
    });

    // Retardo humanizador configurado por el usuario (o por defecto 10-18 segundos)
    const minDelay = config?.delayMin || 10;
    const maxDelay = config?.delayMax || 20;
    const delaySec = Math.min(Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay, 25);

    console.log(`[DM] Esperando ${delaySec}s de retardo humanizado antes de enviar a Instagram...`);
    await wait(delaySec * 1000);

    // Re-chequear la ventana justo antes de enviar: si por cualquier motivo se venció,
    // no mandamos nada (evita errores de Meta y posibles sanciones).
    if (!isWithinMessagingWindow(inboundAt)) {
      console.warn(
        `[DM] Ventana de 24h vencida para ${senderId} antes de enviar. Mensaje no enviado.`
      );
      return;
    }

    const send = await sendInstagramText({
      account: igAccount,
      recipientId: senderId,
      text: aiResponse,
    });

    if (send.ok) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastOutboundAt: new Date(),
          lastOutboundMid: send.messageId ?? null,
        },
      });
      console.log(`[DM Completado] Conversación #${conversation.id} actualizada.`);
      return;
    }

    // El envío falló: dejamos registro accionable (y no reintentamos a ciegas).
    const { kind, code, subcode, fbtraceId, message } = send.error;
    console.error(
      `[DM] Falló el envío a ${senderId} (@${igAccount.username}) | kind=${kind} code=${code ?? "-"} subcode=${
        subcode ?? "-"
      } fbtrace=${fbtraceId ?? "-"} | ${message}`
    );

    if (kind === "policy") {
      // Fuera de la ventana de 24h o sin permiso para iniciar la conversación.
      console.warn(
        `[DM] Meta rechazó el mensaje por política (ventana de 24h cerrada o permiso faltante) para la conversación #${conversation.id}.`
      );
    } else if (kind === "auth") {
      console.error(
        `[DM] Token inválido o revocado para @${igAccount.username} (cuenta #${igAccount.id}). Hay que reconectar Instagram en el dashboard.`
      );
    }
  } catch (error) {
    console.error("[Error en handleInstagramDirectMessage]:", error);
  }
}

/* -------------------------------------------------------------------------- */
/*                            Echo de operador humano                         */
/* -------------------------------------------------------------------------- */

/**
 * Echo sin `app_id`: alguien respondió desde la app de Instagram (no nuestra app).
 *
 * Contexto importante: en un echo los roles están invertidos.
 *   sender.id    = nuestra cuenta de Instagram
 *   recipient.id = el prospecto (IGSID)
 *
 * Si lo ignoramos, la IA sigue contestando después de que un humano tomó la
 * conversación (peor experiencia posible para el lead). Por eso marcamos
 * `human_takeover`, y la IA queda en pausa hasta que alguien lo reactive.
 */
async function handleHumanEcho(messagingEvent: InstagramMessagingEvent) {
  try {
    const mid = messagingEvent.message.mid;
    const text = messagingEvent.message.text?.trim() || "";
    const businessId = messagingEvent.sender.id;
    const leadId = messagingEvent.recipient.id;

    if (mid) {
      const dedupe = await markWebhookEventOnce(eventKey("message", mid));
      if (dedupe.duplicate) return;
    }

    const igAccount = await prisma.igAccount.findUnique({
      where: { instagramId: businessId },
      select: { id: true, userId: true, username: true },
    });

    if (!igAccount) {
      // Cuenta no registrada: no hay nada que pausar.
      return;
    }

    const sentAt = eventTimestampToDate(messagingEvent.timestamp);
    const conversation = await prisma.conversation.findFirst({
      where: { igAccountId: igAccount.id, instagramUserId: leadId },
    });

    if (!conversation) {
      // El operador escribió primero (o la conversación se creó antes de instalar
      // Settingfly). La registramos ya en modo manual para no pisarla con la IA.
      await prisma.conversation.create({
        data: {
          igAccountId: igAccount.id,
          userId: igAccount.userId,
          instagramUserId: leadId,
          instagramUsername: `lead_${leadId.slice(-4)}`,
          status: "human_takeover",
          history: JSON.stringify(
            text ? [{ role: "assistant", content: text, timestamp: sentAt.toISOString() }] : []
          ),
          lastOutboundAt: sentAt,
        },
      });
      console.log(
        `[Echo Humano] Nueva conversación para ${leadId} (@${igAccount.username}) en modo manual.`
      );
      return;
    }

    const history = parseHistory(conversation.history);

    // Red de seguridad principal: si el `mid` es el del último mensaje que enviamos
    // por API, este echo es nuestro (aunque Meta no haya mandado `app_id`).
    // Sin esto, un echo sin `app_id` apagaría la IA después del primer mensaje.
    if (mid && conversation.lastOutboundMid === mid) {
      return;
    }

    if (text) {
      history.push({ role: "assistant", content: text, timestamp: sentAt.toISOString() });
    }

    const wasAlreadyManual = conversation.status === "human_takeover";

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        history: JSON.stringify(history),
        lastOutboundAt: sentAt,
        status: "human_takeover",
      },
    });

    if (!wasAlreadyManual) {
      console.log(
        `[Echo Humano] Conversación #${conversation.id} (@${igAccount.username}) pasada a human_takeover: la IA queda en pausa.`
      );
    }
  } catch (error) {
    console.error("[Error en handleHumanEcho]:", error);
  }
}
