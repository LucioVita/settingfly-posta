// web/src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const instagram = String(body?.instagram || "").trim();
    const businessName = String(body?.businessName || "").trim();
    const monthlyBudget = String(body?.monthlyBudget || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y correo electrónico son obligatorios." },
        { status: 400 }
      );
    }

    // Email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Buscar usuario logueo (opcional, para vincular la solicitud)
    let userId: number | undefined;
    try {
      const user = await getCurrentUser();
      if (user) userId = user.id;
    } catch {
      // No autenticado: continuar como visitante anónimo
    }

    const contact = await prisma.contactRequest.create({
      data: {
        userId,
        name,
        email,
        instagram: instagram || null,
        businessName: businessName || null,
        monthlyBudget: monthlyBudget || null,
        message: message || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      id: contact.id,
      message: "Solicitud recibida. Te contactamos a la brevedad.",
    });
  } catch (error) {
    console.error("Error en /api/contact:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la solicitud." },
      { status: 500 }
    );
  }
}