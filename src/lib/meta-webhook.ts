// web/src/lib/meta-webhook.ts
// Endurecimiento del webhook de Meta (Instagram / Facebook):
// 1. Verificación de firma X-Hub-Signature-256 (HMAC-SHA256 con META_APP_SECRET).
// 2. Deduplicación de eventos: Meta reintenta cualquier webhook que no reciba un 200 en < 5s,
//    y sin dedupe eso termina en DMs duplicados.
// 3. Regla de la ventana de mensajería de 24 horas (solo se puede escribir libremente dentro
//    de las 24h posteriores al último mensaje del usuario).

import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Ventana de mensajería estándar de Meta. */
export const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Cuánto tiempo guardamos ids de eventos para deduplicar (Meta reintenta por horas, no por días). */
const EVENT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export type SignatureResult =
  | { ok: true }
  | { ok: false; reason: string; status: number };

/**
 * Valida el header `X-Hub-Signature-256` contra el body crudo de la request.
 * Importante: hay que pasar el body tal cual llegó (string), nunca el JSON re-serializado.
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null
): SignatureResult {
  const secret = process.env.META_APP_SECRET;

  if (!secret) {
    // Sin secreto no hay forma de verificar. En producción es un error de configuración:
    // preferimos fallar cerrado antes que aceptar eventos de cualquiera.
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        reason: "META_APP_SECRET no configurado en el servidor",
        status: 503,
      };
    }
    console.warn(
      "[Meta Webhook] META_APP_SECRET ausente: se omite la verificación de firma (solo desarrollo)."
    );
    return { ok: true };
  }

  if (!signatureHeader) {
    return { ok: false, reason: "Falta el header X-Hub-Signature-256", status: 401 };
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")}`;

  const received = signatureHeader.trim();
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(received, "utf8");

  if (expectedBuf.length !== receivedBuf.length) {
    return { ok: false, reason: "Firma inválida", status: 401 };
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ? { ok: true }
    : { ok: false, reason: "Firma inválida", status: 401 };
}

/** Clave estable por evento. Prefijada por tipo para evitar colisiones entre mids y comment ids. */
export function eventKey(kind: "message" | "comment", id: string): string {
  return `ig:${kind}:${id}`.slice(0, 160);
}

/**
 * Intenta registrar el evento. Devuelve `duplicate: true` si ya lo habíamos visto.
 *
 * Fail-open a propósito: si la tabla de dedupe falla (DB caída, migración pendiente),
 * preferimos contestar de más antes que perder un lead.
 */
export async function markWebhookEventOnce(
  key: string
): Promise<{ duplicate: boolean }> {
  try {
    await prisma.webhookEvent.create({ data: { id: key } });
    return { duplicate: false };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { duplicate: true };
    }
    console.error("[Meta Webhook] No se pudo registrar el evento para deduplicar:", error);
    return { duplicate: false };
  }
}

/** Limpieza oportunista (2% de las llamadas) para que la tabla no crezca sin límite. */
export async function pruneOldWebhookEvents(probability = 0.02): Promise<void> {
  if (Math.random() > probability) return;
  try {
    await prisma.webhookEvent.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - EVENT_RETENTION_MS) } },
    });
  } catch (error) {
    console.warn("[Meta Webhook] No se pudieron limpiar eventos antiguos:", error);
  }
}

/**
 * Meta documenta `messaging[].timestamp` en milisegundos, pero normalizamos por las dudas:
 * un timestamp en segundos (≈1.7e9) interpretado como ms haría que TODO evento parezca
 * viejo y el bot dejaría de responder. Cualquier valor menor a 1e12 se asume en segundos.
 */
export function normalizeEventTimestamp(eventTimestampMs?: number | null): number | null {
  if (
    typeof eventTimestampMs !== "number" ||
    !Number.isFinite(eventTimestampMs) ||
    eventTimestampMs <= 0
  ) {
    return null;
  }
  return eventTimestampMs < 1e12 ? eventTimestampMs * 1000 : eventTimestampMs;
}

/**
 * Un DM más viejo que la ventana de 24h no se puede contestar libremente: descartamos el evento.
 * Protege contra reintentos de Meta con eventos viejos.
 */
export function isStaleEvent(
  eventTimestampMs?: number | null,
  now = Date.now()
): boolean {
  const normalized = normalizeEventTimestamp(eventTimestampMs);
  if (normalized === null) return false;
  return now - normalized > MESSAGING_WINDOW_MS;
}

/** ¿Sigue abierta la ventana de 24h desde el último mensaje del usuario? */
export function isWithinMessagingWindow(
  lastInboundAt?: Date | null,
  now = new Date()
): boolean {
  if (!lastInboundAt) return false;
  return now.getTime() - lastInboundAt.getTime() <= MESSAGING_WINDOW_MS;
}

/** Convierte el timestamp (epoch ms) del webhook en Date, con fallback a ahora. */
export function eventTimestampToDate(eventTimestampMs?: number | null): Date {
  const normalized = normalizeEventTimestamp(eventTimestampMs);
  return normalized !== null ? new Date(normalized) : new Date();
}

/**
 * Decodifica el `signed_request` que envía Meta en callbacks de deauthorize y data deletion.
 * Documentación: https://developers.facebook.com/docs/facebook-login/web/signed-request/
 */
export function decodeSignedRequest(signedRequest: string): any {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return null;

  const [encodedSig, payload] = signedRequest.split(".");
  if (!encodedSig || !payload) return null;

  // 1. Validar la firma
  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    console.error("[Meta SignedRequest] Firma inválida");
    return null;
  }

  // 2. Decodificar el payload
  try {
    return JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
  } catch (err) {
    console.error("[Meta SignedRequest] Error al parsear JSON:", err);
    return null;
  }
}
