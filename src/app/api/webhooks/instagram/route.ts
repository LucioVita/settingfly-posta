// web/src/app/api/webhooks/instagram/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSetterReply, ConversationHistoryItem } from "@/lib/setter-ai";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "autosetter_secure_verify_2026";

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
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "instagram") {
      // Procesamiento asíncrono para responder a Meta antes de los 5 segundos reglamentarios
      for (const entry of body.entry) {
        const instagramBusinessId = String(entry.id);

        // 1. Comentarios en Publicaciones / Reels
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "comments") {
              // Disparamos sin bloquear el return 200 OK
              void handleInstagramComment(change.value, instagramBusinessId);
            }
          }
        }

        // 2. Mensajes Directos (DMs)
        if (entry.messaging) {
          for (const messageEvent of entry.messaging) {
            // Ignorar los echos (mensajes enviados por el propio bot)
            if (messageEvent.message && !messageEvent.message.is_echo) {
              // Disparamos sin bloquear el return 200 OK
              void handleInstagramDirectMessage(messageEvent);
            }
          }
        }
      }

      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return NextResponse.json({ status: "NOT_SUPPORTED" }, { status: 404 });
  } catch (error) {
    console.error("[Meta Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * Envía una respuesta pública a un comentario a través de Meta Graph API
 */
async function sendCommentReplyMeta(commentId: string, message: string, accessToken: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errData = await res.text();
      console.error(`[Meta API Error al responder comentario ${commentId}]:`, errData);
    } else {
      console.log(`[Meta API Éxito] Respuesta enviada al comentario ${commentId}`);
    }
  } catch (err) {
    console.error(`[Meta API Error de conexión al responder comentario]:`, err);
  }
}

/**
 * Envía un mensaje directo (DM) a través de Meta Graph API
 */
async function sendDirectMessageMeta(recipientId: string, text: string, accessToken: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });

    if (!res.ok) {
      const errData = await res.text();
      console.error(`[Meta API Error al enviar DM a ${recipientId}]:`, errData);
    } else {
      console.log(`[Meta API Éxito] DM enviado a ${recipientId}`);
    }
  } catch (err) {
    console.error(`[Meta API Error de conexión al enviar DM]:`, err);
  }
}

/**
 * Retardo humanizado (delay simulado para evitar detecciones de spam)
 */
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Procesa comentarios entrantes en Posts o Reels (Multi-tenant)
 */
async function handleInstagramComment(
  comment: {
    id: string;
    text: string;
    from: { id: string; username: string };
    media?: { id: string };
  },
  instagramBusinessId: string
) {
  try {
    const commentId = comment.id;
    const commentText = (comment.text || "").toUpperCase().trim();
    const leadUsername = comment.from?.username || "Usuario";

    console.log(`[Comentario] @${leadUsername} comentó: "${comment.text}" en cuenta IG ${instagramBusinessId}`);

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
      `¡Hola @${leadUsername}! Te envié todos los detalles de ${businessName} por mensaje privado 📥`,
      `¡Listo @${leadUsername}! Revisa tus DMs, te dejé toda la información 📥`,
      `¡Te escribí al privado @${leadUsername}! Cualquier consulta avisame 📤`,
      `¡Hola @${leadUsername}! Acabo de enviarte un DM con toda la info 🚀`,
    ];
    const replyText = publicReplies[Math.floor(Math.random() * publicReplies.length)];

    // Delay humanizado (10 a 20 segundos)
    const delaySec = Math.floor(Math.random() * 10) + 10;
    console.log(`[Comentario] Esperando ${delaySec}s antes de responder...`);
    await wait(delaySec * 1000);

    // 1. Responder públicamente al comentario en Instagram
    await sendCommentReplyMeta(commentId, replyText, igAccount.accessToken);

    // 2. Si el evento trae el ID del usuario, iniciar el DM de prospección
    if (comment.from?.id) {
      const initialDmText = `¡Hola @${leadUsername}! Vi tu comentario en nuestra publicación. ¿Actualmente ya cuentas con un negocio en marcha o estás por comenzar?`;
      await wait(3000); // 3 segundos adicionales
      await sendDirectMessageMeta(comment.from.id, initialDmText, igAccount.accessToken);
    }
  } catch (error) {
    console.error("[Error en handleInstagramComment]:", error);
  }
}

/**
 * Procesa mensajes directos (DMs) en curso con el AutoSetter IA (Multi-tenant)
 */
async function handleInstagramDirectMessage(messagingEvent: {
  sender: { id: string };
  recipient: { id: string };
  message: { mid: string; text?: string };
}) {
  try {
    const senderId = messagingEvent.sender.id; // ID del prospecto
    const recipientId = messagingEvent.recipient.id; // ID de nuestra cuenta
    const userText = messagingEvent.message.text || "";

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

    // Buscar o inicializar la conversación en la tabla Conversation de MySQL
    let conversation = await prisma.conversation.findFirst({
      where: {
        igAccountId: igAccount.id,
        instagramUserId: senderId,
      },
    });

    let history: ConversationHistoryItem[] = [];

    if (conversation && Array.isArray(conversation.history)) {
      history = conversation.history as unknown as ConversationHistoryItem[];
    }

    // Si la conversación está en modo manual (Human Takeover), la IA no interviene
    if (conversation?.status === "human_takeover") {
      console.log(`[DM] Conversación en Human Takeover para ${senderId}. La IA no responderá.`);
      // Solo registramos el mensaje del usuario en el historial
      history.push({
        role: "user",
        content: userText,
        timestamp: new Date().toISOString(),
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { history: history as any },
      });
      return;
    }

    // Registrar mensaje del usuario en el historial
    history.push({
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
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
    let newStatus = conversation?.status || "qualifying";
    if (config?.bookingUrl && aiResponse.includes(config.bookingUrl)) {
      newStatus = "ready_for_call";
    }

    // Guardar / Actualizar en MySQL
    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          history: history as any,
          status: newStatus,
        },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          igAccountId: igAccount.id,
          userId: igAccount.userId,
          instagramUserId: senderId,
          instagramUsername: `lead_${senderId.slice(-4)}`,
          status: newStatus,
          history: history as any,
        },
      });
    }

    // Retardo humanizador configurado por el usuario (o por defecto 10-18 segundos)
    const minDelay = config?.delayMin || 10;
    const maxDelay = config?.delayMax || 20;
    const delaySec = Math.min(Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay, 25);

    console.log(`[DM] Esperando ${delaySec}s de retardo humanizado antes de enviar a Instagram...`);
    await wait(delaySec * 1000);

    // Enviar mensaje real a Instagram mediante Meta Graph API
    await sendDirectMessageMeta(senderId, aiResponse, igAccount.accessToken);
    console.log(`[DM Completado] Conversación #${conversation.id} actualizada.`);
  } catch (error) {
    console.error("[Error en handleInstagramDirectMessage]:", error);
  }
}
