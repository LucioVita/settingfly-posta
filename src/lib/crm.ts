// web/src/lib/crm.ts
// Autenticación del CRM interno (/crm).
// Credenciales por variable de entorno CRM_USERS_JSON (JSON con usuario -> clave),
// configurada en el panel de Hostinger. Sesión via JWT firmado en cookie HttpOnly.

import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const CRM_COOKIE_NAME = "crm_session";
export const CRM_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 días en segundos

// Estados del pipeline de ventas (valores guardados en ContactRequest.status)
export const CRM_STATUSES = ["pending", "contactado", "agendado", "ganado", "descartado"] as const;
export type CrmStatus = (typeof CRM_STATUSES)[number];

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  pending: "Nuevo",
  contactado: "Contactado",
  agendado: "Agendado",
  ganado: "Ganado",
  descartado: "Descartado",
};

const CRM_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "autosetter_super_secret_jwt_key_2026_dev_fallback"
);

export function verifyCrmCredentials(username: string, password: string): boolean {
  const usersRaw = process.env.CRM_USERS_JSON;
  
  if (usersRaw) {
    try {
      const users: Record<string, string> = JSON.parse(usersRaw);
      const expectedPass = users[username];
      if (expectedPass) {
        return safeCompare(password, expectedPass);
      }
    } catch {
      // JSON inválido, seguimos al fallback
    }
  }

  // Fallback a CRM_USERNAME y CRM_PASSWORD (un solo usuario)
  const expectedUser = process.env.CRM_USERNAME;
  const expectedPass = process.env.CRM_PASSWORD;

  if (expectedUser && expectedPass && username === expectedUser) {
    return safeCompare(password, expectedPass);
  }

  return false;
}

function safeCompare(password: string, expected: string): boolean {
  const c = Buffer.from(normalize(password));
  const d = Buffer.from(normalize(expected));
  return c.length === d.length && crypto.timingSafeEqual(c, d);
}

function normalize(value: string): string {
  return value.trim();
}

export async function signCrmSession(username: string): Promise<string> {
  return new SignJWT({ scope: "crm", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(CRM_SECRET);
}

export async function verifyCrmSessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, CRM_SECRET);
    if (payload.scope !== "crm" || typeof payload.username !== "string") return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getCrmSession(): Promise<{ username: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CRM_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyCrmSessionToken(token);
  } catch {
    return null;
  }
}

export async function setCrmSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CRM_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CRM_SESSION_MAX_AGE,
  });
}

export async function clearCrmSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CRM_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
