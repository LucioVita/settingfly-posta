// web/src/app/api/instagram/accounts/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET: Obtener las cuentas de Instagram vinculadas al usuario autenticado
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const accounts = await prisma.igAccount.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        instagramId: true,
        username: true,
        pageId: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Error al obtener cuentas de Instagram:", error);
    return NextResponse.json(
      { error: "Error interno al obtener las cuentas." },
      { status: 500 }
    );
  }
}

/**
 * POST: Conectar o vincular una nueva cuenta de Instagram
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { username, instagramId, accessToken, pageId, expiresAt } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "El nombre de usuario de Instagram es requerido (ej: @minegocio)." },
        { status: 400 }
      );
    }

    if (!instagramId || typeof instagramId !== "string") {
      return NextResponse.json(
        { error: "El Instagram Account ID de Meta es requerido." },
        { status: 400 }
      );
    }

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "El Access Token de Meta es requerido." },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
    const cleanIgId = instagramId.trim();

    // Expiración por defecto: 60 días si no se especifica
    const tokenExpiresAt = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Upsert: si la cuenta ya existe para este ID, actualizamos el token y usuario
    const account = await prisma.igAccount.upsert({
      where: { instagramId: cleanIgId },
      update: {
        userId: user.id,
        username: cleanUsername,
        accessToken: accessToken.trim(),
        pageId: pageId ? String(pageId).trim() : "default_page",
        expiresAt: tokenExpiresAt,
      },
      create: {
        userId: user.id,
        instagramId: cleanIgId,
        username: cleanUsername,
        accessToken: accessToken.trim(),
        pageId: pageId ? String(pageId).trim() : "default_page",
        expiresAt: tokenExpiresAt,
      },
      select: {
        id: true,
        instagramId: true,
        username: true,
        pageId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cuenta @${cleanUsername} conectada exitosamente.`,
      account,
    });
  } catch (error) {
    console.error("Error al conectar cuenta de Instagram:", error);
    return NextResponse.json(
      { error: "Error interno al conectar la cuenta de Instagram." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Desconectar / eliminar una cuenta de Instagram del usuario
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountIdParam = searchParams.get("id");

    if (!accountIdParam) {
      return NextResponse.json(
        { error: "Se requiere el ID de la cuenta a desconectar." },
        { status: 400 }
      );
    }

    const accountId = parseInt(accountIdParam, 10);
    if (isNaN(accountId)) {
      return NextResponse.json({ error: "ID de cuenta inválido." }, { status: 400 });
    }

    // Verificar que la cuenta le pertenezca al usuario autenticado
    const existing = await prisma.igAccount.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cuenta no encontrada o no tienes permisos sobre ella." },
        { status: 404 }
      );
    }

    await prisma.igAccount.delete({
      where: { id: accountId },
    });

    return NextResponse.json({
      success: true,
      message: `Cuenta @${existing.username} desconectada exitosamente.`,
    });
  } catch (error) {
    console.error("Error al desconectar cuenta de Instagram:", error);
    return NextResponse.json(
      { error: "Error interno al desconectar la cuenta." },
      { status: 500 }
    );
  }
}

