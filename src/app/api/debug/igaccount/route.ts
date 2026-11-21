// web/src/app/api/debug/igaccount/route.ts
// ENDPOINT TEMPORAL DE DIAGNÓSTICO - remover en producción real
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const accounts = await prisma.igAccount.findMany({
    select: {
      id: true,
      instagramId: true,
      username: true,
      pageId: true,
      expiresAt: true,
      revokedAt: true,
      lastErrorKind: true,
      // NO incluir accessToken por seguridad
    }
  });
  const convCount = await prisma.conversation.count();
  const webhookCount = await prisma.webhookEvent.count();
  return NextResponse.json({ accounts, convCount, webhookCount });
}
