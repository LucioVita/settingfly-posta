// web/src/app/api/campaigns/route.ts
// Estadísticas reales de campañas / triggers de Reels.
// No existe todavía un modelo de campañas en la DB, así que las métricas se
// derivan de los eventos de webhook y de las cuentas conectadas.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [commentsToday, messagesToday, totalComments, accounts] = await Promise.all([
      prisma.webhookEvent.count({
        where: { id: { startsWith: "ig:comment:" }, createdAt: { gte: startOfDay } },
      }),
      prisma.webhookEvent.count({
        where: { id: { startsWith: "ig:message:" }, createdAt: { gte: startOfDay } },
      }),
      prisma.webhookEvent.count({ where: { id: { startsWith: "ig:comment:" } } }),
      prisma.igAccount.findMany({
        where: { userId: user.id },
        select: { id: true, revokedAt: true, lastErrorKind: true },
      }),
    ]);

    const triggerRate =
      commentsToday > 0 ? Math.min(100, Math.round((messagesToday / commentsToday) * 1000) / 10) : 0;

    return NextResponse.json({
      campaigns: {
        activeAccounts: accounts.filter((a) => !a.revokedAt).length,
        commentsToday,
        messagesToday,
        totalComments,
        triggerRate,
        antibanIssues: accounts.filter((a) => a.revokedAt || a.lastErrorKind).length,
      },
      // Sin modelo de campañas/reels todavía: la UI muestra un estado vacío honesto.
      reels: [],
    });
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    return NextResponse.json({ error: "Error al obtener campañas" }, { status: 500 });
  }
}
