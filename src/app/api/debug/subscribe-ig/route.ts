// web/src/app/api/debug/subscribe-ig/route.ts
// Suscribe la cuenta de Instagram directamente via Graph API usando el token guardado
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function GET() {
  const account = await prisma.igAccount.findFirst({
    select: { pageId: true, accessToken: true, instagramId: true, username: true }
  });

  if (!account) return NextResponse.json({ error: "No hay cuenta conectada" }, { status: 404 });

  const results: Record<string, unknown> = {
    instagramId: account.instagramId,
    username: account.username,
    pageId: account.pageId,
    tokenLength: account.accessToken.length,
  };

  // Intentar suscribir con todos los métodos posibles

  // Método 1: POST /{page-id}/subscribed_apps (classic)
  const r1 = await fetch(`${GRAPH}/${account.pageId}/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      subscribed_fields: "messages,messaging_postbacks",
      access_token: account.accessToken,
    }),
  });
  results.method1_page_sub = await r1.json();

  // Método 2: POST /{ig-user-id}/subscribed_apps (Instagram unified login)
  const r2 = await fetch(`${GRAPH}/${account.instagramId}/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      subscribed_fields: "messages",
      access_token: account.accessToken,
    }),
  });
  results.method2_ig_sub = await r2.json();

  // Método 3: Verificar permisos del token
  const r3 = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(account.accessToken)}`);
  results.method3_permissions = await r3.json();

  // Método 4: Verificar /me con el token
  const r4 = await fetch(`${GRAPH}/me?access_token=${encodeURIComponent(account.accessToken)}`);
  results.method4_me = await r4.json();

  return NextResponse.json(results, { status: 200 });
}
