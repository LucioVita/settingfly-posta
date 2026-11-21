// web/src/app/api/auth/meta/callback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
}

interface IgAccount {
  id: string;
  username?: string;
  name?: string;
  biography?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://settingfly.com";

  if (error || !code || !stateRaw) {
    console.error("Error en callback de Meta:", error, errorDescription);
    return NextResponse.redirect(
      `${appUrl}/dashboard?meta_error=${encodeURIComponent(errorDescription || error || "Acceso cancelado")}`
    );
  }

  try {
    // 1. Decodificar y validar el state
    const stateData = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"));
    const userId = Number(stateData.userId);

    if (!userId) {
      return NextResponse.redirect(`${appUrl}/dashboard?meta_error=Estado_invalido`);
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    if (!appId || !appSecret) {
      return NextResponse.redirect(`${appUrl}/dashboard?meta_error=Configuracion_Meta_incompleta`);
    }

    // 2. Canjear el 'code' por un User Access Token de corta duración
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Error al canjear code por token en Meta:", tokenData);
      const msg = tokenData?.error?.message || tokenData?.error || "Error al canjear código por token en Meta";
      return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(msg)}`);
    }

    const shortUserToken = tokenData.access_token;

    // 3. Extender a User Token de Larga Duración (60 días)
    const longTokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longTokenUrl.searchParams.set("client_id", appId);
    longTokenUrl.searchParams.set("client_secret", appSecret);
    longTokenUrl.searchParams.set("fb_exchange_token", shortUserToken);

    const longTokenRes = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenRes.json();
    const longUserToken = longTokenData.access_token || shortUserToken;

    console.log("Token de larga duración obtenido:", longUserToken ? "OK" : "FALLBACK al corto");

    // ════════════════════════════════════════════════════════════════
    // ESTRATEGIA 1: /me/accounts (Facebook Login clásico)
    // ════════════════════════════════════════════════════════════════
    let pages: FacebookPage[] = [];

    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${longUserToken}`
    );
    const accountsData = await accountsRes.json();

    if (!accountsData.error && accountsData.data?.length > 0) {
      pages = accountsData.data;
      console.log(`Estrategia 1 exitosa: ${pages.length} páginas`);
    }

    // ════════════════════════════════════════════════════════════════
    // ESTRATEGIA 2: /me/instagram_accounts (Unified Login - nuevo)
    // ════════════════════════════════════════════════════════════════
    if (pages.length === 0) {
      console.log("Estrategia 1 vacía, intentando /me/instagram_accounts...");
      try {
        const igAccountsRes = await fetch(
          `https://graph.facebook.com/v21.0/me/instagram_accounts?fields=id,username,name,biography&access_token=${longUserToken}`
        );
        const igAccountsData = await igAccountsRes.json();

        if (!igAccountsData.error && igAccountsData.data?.length > 0) {
          console.log(`Estrategia 2 exitosa: ${igAccountsData.data.length} cuentas IG directas`);

          // Con Unified Login obtenemos directamente la cuenta IG — guardamos sin page token
          for (const ig of igAccountsData.data as IgAccount[]) {
            const igUsername = ig.username || `ig_${ig.id}`;
            const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 días

            await prisma.igAccount.upsert({
              where: { instagramId: ig.id },
              update: {
                userId,
                username: igUsername.replace(/^@/, "").toLowerCase(),
                accessToken: longUserToken,
                pageId: null,
                expiresAt,
              },
              create: {
                userId,
                instagramId: ig.id,
                username: igUsername.replace(/^@/, "").toLowerCase(),
                accessToken: longUserToken,
                pageId: null,
                expiresAt,
              },
            });
          }

          return NextResponse.redirect(`${appUrl}/dashboard?meta_success=true&connected=${igAccountsData.data.length}`);
        } else {
          console.log("Estrategia 2 vacía:", JSON.stringify(igAccountsData));
        }
      } catch (e) {
        console.warn("Error en estrategia 2:", e);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // ESTRATEGIA 3: /me con campos de IG del propio usuario
    // ════════════════════════════════════════════════════════════════
    if (pages.length === 0) {
      console.log("Intentando /me con campos de Instagram...");
      try {
        const meRes = await fetch(
          `https://graph.facebook.com/v21.0/me?fields=id,name,instagram_accounts{id,username}&access_token=${longUserToken}`
        );
        const meData = await meRes.json();

        if (!meData.error && meData.instagram_accounts?.data?.length > 0) {
          console.log("Estrategia 3 exitosa:", meData.instagram_accounts.data);
          for (const ig of meData.instagram_accounts.data as IgAccount[]) {
            const igUsername = ig.username || `ig_${ig.id}`;
            const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

            await prisma.igAccount.upsert({
              where: { instagramId: ig.id },
              update: { userId, username: igUsername.replace(/^@/, "").toLowerCase(), accessToken: longUserToken, pageId: null, expiresAt },
              create: { userId, instagramId: ig.id, username: igUsername.replace(/^@/, "").toLowerCase(), accessToken: longUserToken, pageId: null, expiresAt },
            });
          }
          return NextResponse.redirect(`${appUrl}/dashboard?meta_success=true&connected=${meData.instagram_accounts.data.length}`);
        }
      } catch (e) {
        console.warn("Error en estrategia 3:", e);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // Si /me/accounts sí trajo páginas, procesarlas (flujo clásico)
    // ════════════════════════════════════════════════════════════════
    if (pages.length > 0) {
      // Para cada página, aseguramos consultar su Instagram vinculado
      for (const page of pages) {
        if (!page.instagram_business_account?.id && page.access_token) {
          try {
            const pageRes = await fetch(
              `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account{id,username},connected_instagram_account{id,username}&access_token=${page.access_token}`
            );
            const pageData = await pageRes.json();
            if (pageData.instagram_business_account?.id) {
              page.instagram_business_account = pageData.instagram_business_account;
            } else if (pageData.connected_instagram_account?.id) {
              page.instagram_business_account = pageData.connected_instagram_account;
            }
          } catch (err) {
            console.warn(`Error al consultar Instagram para página ${page.name}:`, err);
          }
        }
      }

      const pagesWithIg = pages.filter((p) => p.instagram_business_account?.id);

      if (pagesWithIg.length === 0) {
        const pageNames = pages.map((p) => p.name).join(", ");
        return NextResponse.redirect(
          `${appUrl}/dashboard?meta_error=${encodeURIComponent(
            `Páginas detectadas: [${pageNames}], pero ninguna tiene cuenta de Instagram Profesional enlazada. Asegurate que @guruweb.com.ar esté configurada como cuenta de Empresa.`
          )}`
        );
      }

      let connectedCount = 0;
      for (const page of pagesWithIg) {
        const ig = page.instagram_business_account!;
        const igId = ig.id;
        let igUsername: string = ig.username || "";

        if (!igUsername) {
          try {
            const igDetailsRes = await fetch(`https://graph.facebook.com/v21.0/${igId}?fields=username&access_token=${page.access_token}`);
            const igDetails = await igDetailsRes.json();
            igUsername = igDetails.username || `ig_${igId}`;
          } catch {
            igUsername = `ig_${igId}`;
          }
        }

        try {
          await fetch(`https://graph.facebook.com/v21.0/${page.id}/subscribed_apps`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ subscribed_fields: "messages,messaging_postbacks,feed", access_token: page.access_token }),
          });
        } catch (subErr) {
          console.warn(`No se pudo auto-suscribir la página ${page.id}:`, subErr);
        }

        const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        await prisma.igAccount.upsert({
          where: { instagramId: igId },
          update: { userId, username: igUsername.replace(/^@/, "").toLowerCase(), accessToken: page.access_token, pageId: page.id, expiresAt },
          create: { userId, instagramId: igId, username: igUsername.replace(/^@/, "").toLowerCase(), accessToken: page.access_token, pageId: page.id, expiresAt },
        });
        connectedCount++;
      }

      return NextResponse.redirect(`${appUrl}/dashboard?meta_success=true&connected=${connectedCount}`);
    }

    // ════════════════════════════════════════════════════════════════
    // Todas las estrategias fallaron — diagnóstico completo
    // ════════════════════════════════════════════════════════════════
    let permSummary = "";
    try {
      const permRes = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${longUserToken}`);
      const permData = await permRes.json();
      const granted = ((permData.data as Array<{ permission: string; status: string }>) || [])
        .filter((p) => p.status === "granted")
        .map((p) => p.permission)
        .join(", ");
      permSummary = ` Permisos: [${granted}].`;
    } catch (e) {
      permSummary = ` Error leyendo permisos: ${String(e)}.`;
    }

    let rawAccounts = "";
    try {
      const rawRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${longUserToken}`);
      rawAccounts = ` Raw /me/accounts: ${await rawRes.text().then(t => t.slice(0, 200))}.`;
    } catch {}

    return NextResponse.redirect(
      `${appUrl}/dashboard?meta_error=${encodeURIComponent(
        `Ninguna estrategia encontró cuentas de Instagram.${permSummary}${rawAccounts} Solución: en Meta Developers → app → Casos de uso → añadir "Facebook Login for Business".`
      )}`
    );

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Excepción en callback de Meta OAuth:", error);
    const msg = err?.message || String(error) || "Error procesando vinculación con Meta";
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(msg)}`);
  }
}
