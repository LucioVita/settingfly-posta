// web/src/app/api/metrics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const [conversationsCount, messagesProcessed] = await Promise.all([
      prisma.conversation.count({ where: { userId: user.id } }),
      prisma.conversation.aggregate({
        where: { userId: user.id },
        _sum: {
          id: true,
        },
      }),
    ]);

    // Obtener leads desde ContactRequest
    const leads = await prisma.contactRequest.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const leadsCount = leads.length;
    const qualifiedLeads = leads.filter((l) => l.status === "agendado" || l.status === "ganado").length;

    // Calcular métricas más realistas basadas en los datos
    const totalMessagesProcessed = messagesProcessed._sum.id || 0;
    const callsScheduled = leads.filter((l) => l.status === "agendado").length;

    return NextResponse.json({
      metrics: {
        conversations: conversationsCount,
        messagesProcessed: totalMessagesProcessed,
        qualifiedLeads,
        callsScheduled,
        pipeline: Math.max(0, qualifiedLeads * 1500),
      },
      leads,
    });
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
