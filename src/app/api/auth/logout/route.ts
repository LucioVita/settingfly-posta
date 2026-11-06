// web/src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("Error en /api/auth/logout:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión." },
      { status: 500 }
    );
  }
}

