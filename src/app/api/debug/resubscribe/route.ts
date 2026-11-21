// web/src/app/api/debug/resubscribe/route.ts
// Re-suscribe la página de Facebook al webhook de Instagram
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function GET() {
  const account = await prisma.igAccount.findFirst({
    select: { pageId: true, accessToken: true, instagramId: true, username: true }
  });

  if (!account) {
    return NextResponse.json({ error: "No hay ninguna cuenta conectada" }, { status: 404 });
  }

  const results: Record<string, unknown> = {
    instagramId: account.instagramId,
    username: account.username,
    pageId: account.pageId,
    tokenLength: account.accessToken.length,
  };

  // 1. Verificar suscripción actual
  const checkRes = await fetch(
    `${GRAPH}/${account.pageId}/subscribed_apps?access_token=${encodeURIComponent(account.accessToken)}`
  );
  const checkData = await checkRes.json();
  results.currentSubscription = checkData;

  // 2. Re-suscribir con todos los campos de Instagram
  const subRes = await fetch(`${GRAPH}/${account.pageId}/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      subscribed_fields: "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads,messaging_referrals,feed",
      access_token: account.accessToken,
    }),
  });
  const subData = await subRes.json();
  results.resubscribeResult = subData;

  // 3. Verificar app-level webhook subscriptions
  const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
  const appSubRes = await fetch(`${GRAPH}/app/subscriptions?access_token=${appToken}`);
  const appSubData = await appSubRes.json();
  results.appSubscriptions = appSubData;

  return NextResponse.json(results, { status: 200 });
}
