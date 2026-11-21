// web/src/app/api/conversations/route.ts
// Conversaciones reales del usuario autenticado.
// GET   -> lista de conversaciones
// PATCH -> cambia el estado (p. ej. tomar control humano)
// POST  -> envía una respuesta humana por Instagram y la guarda en el historial
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendInstagramText } from "@/lib/instagram-api";

type HistoryItem = { role: "user" | "assistant"; content: string; timestamp?: string };

function parseHistory(raw: unknown): HistoryItem[] {
  if (Array.isArray(raw)) return raw as HistoryItem[];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    return NextResponse.json({ error: "Error al obtener conversaciones" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const id = Number(body?.id);
    const status = String(body?.status || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    if (!status || status.length > 40) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!conversation) {
      return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error) {
    console.error("Error al actualizar conversación:", error);
    return NextResponse.json({ error: "Error al actualizar conversación" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const id = Number(body?.id);
    const message = String(body?.message || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
      include: { igAccount: true },
    });
    if (!conversation) {
      return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
    }

    const sendResult = await sendInstagramText({
      account: conversation.igAccount,
      recipientId: conversation.instagramUserId,
      text: message,
    });

    if (!sendResult.ok) {
      return NextResponse.json(
        {
          error: `No se pudo enviar por Instagram: ${sendResult.error.message}`,
          kind: sendResult.error.kind,
        },
        { status: 502 }
      );
    }

    const now = new Date();
    const history = parseHistory(conversation.history);
    history.push({
      role: "assistant",
      content: message,
      timestamp: now.toISOString(),
    });

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        history: JSON.stringify(history),
        lastOutboundAt: now,
        lastOutboundMid: sendResult.messageId ?? null,
      },
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
