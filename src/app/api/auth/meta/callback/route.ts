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

    // 4. Obtener las páginas de Facebook administradas y su cuenta de Instagram vinculada
    const accountsUrl = new URL("https://graph.facebook.com/v21.0/me/accounts");
    accountsUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username}");
    accountsUrl.searchParams.set("access_token", longUserToken);

    const accountsRes = await fetch(accountsUrl.toString());
    const accountsData = await accountsRes.json();

    if (accountsData.error) {
      console.error("Error al obtener páginas de Meta:", accountsData.error);
      return NextResponse.redirect(
        `${appUrl}/dashboard?meta_error=${encodeURIComponent(
          "Error de Meta API al leer páginas: " + (accountsData.error.message || JSON.stringify(accountsData.error))
        )}`
      );
    }

    const pages: FacebookPage[] = accountsData.data || [];

    if (pages.length === 0) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?meta_error=${encodeURIComponent(
          "Meta no devolvió ninguna página de Facebook. Asegúrate de haber tildado tu página en el diálogo de Facebook."
        )}`
      );
    }

    // Para cada página, aseguramos consultar su Instagram vinculado usando el token propio de la página
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
          `Páginas detectadas: [${pageNames}], pero Meta informa que ninguna tiene una cuenta de Instagram Profesional enlazada. Asegúrate de que en la app de Instagram (@guruweb.com.ar) esté configurada como cuenta de Empresa o Creador.`
        )}`
      );
    }

    let connectedCount = 0;

    // 5. Vincular las cuentas de Instagram encontradas
    for (const page of pagesWithIg) {
      const ig = page.instagram_business_account!;
      const igId = ig.id;
      let igUsername: string = ig.username || "";

      // Si Meta no trajo el username directamente, lo consultamos con el token de la página
      if (!igUsername) {
        try {
          const igDetailsRes = await fetch(
            `https://graph.facebook.com/v21.0/${igId}?fields=username&access_token=${page.access_token}`
          );
          const igDetails = await igDetailsRes.json();
          igUsername = igDetails.username || `ig_${igId}`;
        } catch {
          igUsername = `ig_${igId}`;
        }
      }

      // Suscribir automáticamente la página a los webhooks de Settingfly
      try {
        await fetch(`https://graph.facebook.com/v21.0/${page.id}/subscribed_apps`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            subscribed_fields: "messages,messaging_postbacks,feed",
            access_token: page.access_token,
          }),
        });
      } catch (subErr) {
        console.warn(`No se pudo auto-suscribir la página ${page.id} a los webhooks:`, subErr);
      }

      // Guardar en base de datos
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 días
      await prisma.igAccount.upsert({
        where: { instagramId: igId },
        update: {
          userId,
          username: igUsername.replace(/^@/, "").toLowerCase(),
          accessToken: page.access_token,
          pageId: page.id,
          expiresAt,
        },
        create: {
          userId,
          instagramId: igId,
          username: igUsername.replace(/^@/, "").toLowerCase(),
          accessToken: page.access_token,
          pageId: page.id,
          expiresAt,
        },
      });

      connectedCount++;
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard?meta_success=true&connected=${connectedCount}`
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Excepción en callback de Meta OAuth:", error);
    const msg = err?.message || String(error) || "Error procesando vinculación con Meta";
    return NextResponse.redirect(
      `${appUrl}/dashboard?meta_error=${encodeURIComponent(msg)}`
    );
  }
}
