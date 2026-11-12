// web/src/app/api/crm/session/route.ts
// Login y logout del CRM interno (/crm).
// POST  -> validacontra CRM_USERNAME / CRM_PASSWORD y emite cookie de sesión
// DELETE -> cierra la sesión del CRM

import { NextResponse } from "next/server";
import {
  clearCrmSessionCookie,
  setCrmSessionCookie,
  signCrmSession,
  verifyCrmCredentials,
} from "@/lib/crm";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const hasCredentials = !!(process.env.CRM_USERS_JSON || (process.env.CRM_USERNAME && process.env.CRM_PASSWORD));

    if (!hasCredentials) {
      console.error("CRM: faltan credenciales en el entorno (CRM_USERS_JSON o CRM_USERNAME/CRM_PASSWORD).");
      return NextResponse.json(
        { error: "El CRM no está configurado en el servidor. Falta definir las credenciales." },
        { status: 500 }
      );
    }

    if (!verifyCrmCredentials(username, password)) {
      // Pequeño delay para frenar ataques de fuerza bruta
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
    }

    const token = await signCrmSession(username);
    await setCrmSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/crm/session POST:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearCrmSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/crm/session DELETE:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
