// web/src/lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const AUTH_COOKIE_NAME = "autosetter_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "autosetter_super_secret_jwt_key_2026_dev_fallback"
);

export interface SessionPayload {
  userId: number;
  email: string;
  name?: string | null;
}

/**
 * Hashea una contraseña usando bcryptjs con salt rounds = 10
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara una contraseña en texto plano con un hash almacenado
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Firma y genera un token JWT de sesión válido por 7 días
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un token JWT de sesión
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.email) {
      return null;
    }
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Establece la cookie de autenticación HttpOnly en la sesión
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  });
}

/**
 * Elimina la cookie de sesión (cierre de sesión)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Obtiene el usuario autenticado actual a partir de las cookies de la petición
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        setterConfig: true,
        igAccounts: {
          select: {
            id: true,
            instagramId: true,
            username: true,
            pageId: true,
            expiresAt: true,
          },
        },
      },
    });

    return user;
  } catch (error: any) {
    if (error?.digest === "HANGING_PROMISE_REJECTION" || error?.message?.includes("prerender")) {
      return null;
    }
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}
