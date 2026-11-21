// web/src/app/api/metrics/route.ts
// Métricas reales del dashboard, calculadas a partir de MySQL.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type HistoryItem = { role?: string; content?: string; timestamp?: string };

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

    const [conversations, accounts, leads, commentEvents] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: user.id },
        select: { id: true, history: true },
      }),
      prisma.igAccount.findMany({
        where: { userId: user.id },
        select: { id: true, revokedAt: true, lastErrorKind: true },
      }),
      prisma.contactRequest.findMany({
        where: { userId: user.id },
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      // WebhookEvent no guarda userId: cuenta global de eventos procesados por la app.
      prisma.webhookEvent.count({ where: { id: { startsWith: "ig:comment:" } } }),
    ]);

    // Mensajes procesados = cantidad de entradas reales en el historial de cada conversación.
    const messagesProcessed = conversations.reduce(
      (total, conv) => total + parseHistory(conv.history).length,
      0
    );

    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "agendado" || lead.status === "ganado"
    ).length;
    const callsScheduled = leads.filter((lead) => lead.status === "agendado").length;
    const pipeline = qualifiedLeads * 1500;

    return NextResponse.json({
      metrics: {
        conversations: conversations.length,
        messagesProcessed,
        commentsProcessed: commentEvents,
        qualifiedLeads,
        callsScheduled,
        pipeline,
        accountsConnected: accounts.length,
        accountsWithIssues: accounts.filter((a) => a.revokedAt || a.lastErrorKind).length,
      },
      leads,
    });
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
