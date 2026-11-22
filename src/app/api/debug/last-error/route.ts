// web/src/app/api/debug/last-error/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const account = await prisma.igAccount.findFirst();
  const conversations = await prisma.conversation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const webhooks = await prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    account: {
      id: account?.id,
      username: account?.username,
      lastErrorKind: account?.lastErrorKind,
      lastErrorAt: account?.lastErrorAt,
    },
    conversations,
    webhooks,
  });
}
