// web/src/lib/instagram-api.ts
// Capa única de salida hacia Meta Graph API (Instagram Messaging).
//
// Objetivo: que un error de Meta nunca se pierda en un console.error.
// Cada respuesta se clasifica en:
//   - retryable  -> rate limit / 5xx: se reintenta con backoff exponencial + jitter
//   - auth       -> token vencido o revocado: hay que reconectar la cuenta
//   - policy     -> fuera de la ventana de 24h o sin permiso: NO se reintenta
//   - invalid    -> destinatario inexistente o payload inválido
//   - transient  -> error de red ambiguo (no se reintenta para no duplicar envíos)
//
// Los envíos son POST: reintentar a ciegas un timeout puede duplicar un mensaje,
// por eso solo reintentamos cuando Meta respondió con un error explícito.

import type { IgAccount } from "@prisma/client";

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/** Límite de texto de un mensaje de Instagram. */
export const MAX_DM_TEXT_LENGTH = 1000;

const MAX_ATTEMPTS = 3;

export type MetaErrorKind =
  | "rate_limit"
  | "auth"
  | "policy"
  | "invalid"
  | "transient"
  | "unknown";

export interface MetaApiErrorInfo {
  message: string;
  kind: MetaErrorKind;
  retryable: boolean;
  httpStatus: number;
  code?: number;
  subcode?: number;
  /** Id de traza de Meta: es lo que pide soporte para investigar un caso. */
  fbtraceId?: string;
}

export type MetaSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: MetaApiErrorInfo };

/** Códigos de Meta que significan "esperá y reintentá". */
const RETRYABLE_CODES = new Set<number>([
  1, // API Unknown (temporal)
  2, // API Service temporarily unavailable
  4, // Application request limit reached
  17, // User request limit reached
  32, // Page request limit reached
  613, // Calls to this API exceeded the rate limit
  80004, // Demasiadas llamadas a esta cuenta de Instagram
]);

/** Errores de autorización: el token ya no sirve, no hay reintento posible. */
const AUTH_CODES = new Set<number>([102, 190, 463, 467]);

function parseMetaError(httpStatus: number, rawBody: string): MetaApiErrorInfo {
  let code: number | undefined;
  let subcode: number | undefined;
  let fbtraceId: string | undefined;
  let message = rawBody.slice(0, 500) || `HTTP ${httpStatus}`;

  try {
    const parsed = JSON.parse(rawBody) as {
      error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
      };
    };
    const err = parsed?.error;
    if (err) {
      if (typeof err.message === "string") message = err.message;
      if (typeof err.code === "number") code = err.code;
      if (typeof err.error_subcode === "number") subcode = err.error_subcode;
      if (typeof err.fbtrace_id === "string") fbtraceId = err.fbtrace_id;
    }
  } catch {
    // Body no-JSON: nos quedamos con el texto crudo.
  }

  const isRateLimit =
    httpStatus === 429 ||
    (code !== undefined && RETRYABLE_CODES.has(code));

  const isAuth =
    httpStatus === 401 ||
    (code !== undefined && AUTH_CODES.has(code));

  const isTransient = httpStatus >= 500;

  let kind: MetaErrorKind = "unknown";
  if (isRateLimit) kind = "rate_limit";
  else if (isAuth) kind = "auth";
  else if (isTransient) kind = "transient";
  else if (code === 10 || code === 200 || subcode === 2018108) kind = "policy";
  else if (code === 100 || httpStatus === 400 || httpStatus === 404) kind = "invalid";

  return {
    message,
    kind,
    // No reintentamos auth/policy/invalid: reintentar no cambia el resultado.
    retryable: kind === "rate_limit" || kind === "transient",
    httpStatus,
    code,
    subcode,
    fbtraceId,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Backoff exponencial con jitter. Los rate limits de IG necesitan esperas más largas. */
function backoffMs(attempt: number, code?: number): number {
  const base = code === 80004 ? 5000 : 1000;
  const ceiling = base * 2 ** attempt;
  return Math.floor(ceiling / 2 + Math.random() * (ceiling / 2));
}

async function callGraph(
  path: string,
  accessToken: string,
  payload: unknown,
  attempt = 0
): Promise<MetaSendResult> {
  let res: Response;
  try {
    res = await fetch(`${GRAPH_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Error de red: no sabemos si Meta procesó el mensaje. Reintentar podría duplicarlo.
    console.error(`[Meta API] Error de red en ${path}:`, err);
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Error de red",
        kind: "transient",
        retryable: false,
        httpStatus: 0,
      },
    };
  }

  if (res.ok) {
    // Meta devuelve { recipient_id, message_id }. Guardamos el id para poder
    // distinguir el echo de nuestros propios envíos de los de un humano.
    let messageId: string | undefined;
    try {
      const data = (await res.json()) as { message_id?: unknown };
      if (typeof data?.message_id === "string") messageId = data.message_id;
    } catch {
      // Respuesta vacía o no-JSON: el envío igual fue exitoso.
    }
    return { ok: true, messageId };
  }

  const error = parseMetaError(res.status, await res.text());

  console.error("[Meta API] Envío fallido", {
    path,
    httpStatus: error.httpStatus,
    code: error.code,
    subcode: error.subcode,
    kind: error.kind,
    fbtraceId: error.fbtraceId,
    message: error.message,
  });

  if (error.retryable && attempt < MAX_ATTEMPTS - 1) {
    await sleep(backoffMs(attempt, error.code));
    return callGraph(path, accessToken, payload, attempt + 1);
  }

  return { ok: false, error };
}

/**
 * Trunca sin partir emojis ni pares surrogados, y avisa si hubo que recortar.
 */
export function truncateGraphemeSafe(
  text: string,
  maxLength = MAX_DM_TEXT_LENGTH
): { text: string; truncated: boolean } {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const graphemes = [...segmenter.segment(text)].map((s) => s.segment);
    if (graphemes.length <= maxLength) return { text, truncated: false };
    return {
      text: graphemes.slice(0, Math.max(maxLength - 1, 0)).join("") + "…",
      truncated: true,
    };
  }
  // Fallback sin Intl.Segmenter.
  return text.length <= maxLength
    ? { text, truncated: false }
    : { text: text.slice(0, maxLength - 1) + "…", truncated: true };
}

/** Envía un DM de texto a un usuario por su IGSID. */
export async function sendInstagramText(params: {
  account: Pick<IgAccount, "id" | "instagramId" | "accessToken" | "username">;
  recipientId: string;
  text: string;
}): Promise<MetaSendResult> {
  const { text, truncated } = truncateGraphemeSafe(params.text);
  if (truncated) {
    console.warn(
      `[Meta API] Texto truncado a ${MAX_DM_TEXT_LENGTH} caracteres para @${params.account.username}.`
    );
  }

  // En la API moderna de Instagram Graph, el endpoint es /{instagram_business_id}/messages
  const endpoint = params.account.instagramId
    ? `/${params.account.instagramId}/messages`
    : "/me/messages";

  const result = await callGraph(endpoint, params.account.accessToken, {
    recipient: { id: params.recipientId },
    message: { text },
  });

  if (!result.ok) {
    await persistAccountError(params.account.id, result.error);
  }

  return result;
}

/** Private reply: abre un DM a partir de un comentario (válido hasta 7 días después). */
export async function sendInstagramPrivateReply(params: {
  account: Pick<IgAccount, "id" | "instagramId" | "accessToken" | "username">;
  commentId: string;
  text: string;
}): Promise<MetaSendResult> {
  const { text } = truncateGraphemeSafe(params.text);

  const endpoint = params.account.instagramId
    ? `/${params.account.instagramId}/messages`
    : "/me/messages";

  const result = await callGraph(endpoint, params.account.accessToken, {
    recipient: { comment_id: params.commentId },
    message: { text },
  });

  if (!result.ok) {
    await persistAccountError(params.account.id, result.error);
  }

  return result;
}

/** Responde públicamente a un comentario. */
export async function replyToInstagramComment(params: {
  account: Pick<IgAccount, "id" | "accessToken" | "username">;
  commentId: string;
  message: string;
}): Promise<MetaSendResult> {
  const { text } = truncateGraphemeSafe(params.message);

  const result = await callGraph(`/${params.commentId}/replies`, params.account.accessToken, {
    message: text,
  });

  if (!result.ok) {
    await persistAccountError(params.account.id, result.error);
  }

  return result;
}

/**
 * Persiste el error de la cuenta en la DB para visibilidad en el dashboard.
 */
async function persistAccountError(accountId: number, error: MetaApiErrorInfo) {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.igAccount.update({
      where: { id: accountId },
      data: {
        lastErrorAt: new Date(),
        lastErrorKind: error.kind,
      },
    });
  } catch (err) {
    console.warn("[Meta API] No se pudo persistir el error de la cuenta en la DB:", err);
  }
}
