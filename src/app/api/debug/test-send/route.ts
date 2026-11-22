// web/src/app/api/debug/test-send/route.ts
// Test directo de envío a Instagram para ver el error exacto que da Meta
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function GET() {
  const account = await prisma.igAccount.findFirst();
  if (!account) return NextResponse.json({ error: "No account" }, { status: 404 });

  // Buscamos la última conversación para tener el ID del prospecto
  const conv = await prisma.conversation.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const recipientId = conv?.instagramUserId || "test";

  // Intento 1: POST /me/messages con access_token
  const r1 = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${account.accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: "Test directo desde Settingfly" },
    }),
  });
  const res1 = await r1.json();

  // Intento 2: POST /{instagramId}/messages
  const r2 = await fetch(`${GRAPH}/${account.instagramId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${account.accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: "Test directo desde Settingfly" },
    }),
  });
  const res2 = await r2.json();

  return NextResponse.json({
    recipientId,
    test_me_messages: res1,
    test_ig_messages: res2,
  });
}
