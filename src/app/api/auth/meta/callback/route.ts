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
      `${appUrl}/?meta_error=${encodeURIComponent(errorDescription || error || "Acceso cancelado")}`
    );
  }

  try {
    // 1. Decodificar y validar el state
    const stateData = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"));
    const userId = Number(stateData.userId);

    if (!userId) {
      return NextResponse.redirect(`${appUrl}/?meta_error=Estado_invalido`);
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    if (!appId || !appSecret) {
      return NextResponse.redirect(`${appUrl}/?meta_error=Configuracion_Meta_incompleta`);
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
      return NextResponse.redirect(`${appUrl}/?meta_error=Error_canje_token`);
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

    const pages: FacebookPage[] = accountsData.data || [];
    const pagesWithIg = pages.filter((p) => p.instagram_business_account?.id);

    if (pagesWithIg.length === 0) {
      return NextResponse.redirect(
        `${appUrl}/?meta_error=${encodeURIComponent(
          "No encontramos ninguna cuenta de Instagram Profesional vinculada a tus páginas de Facebook. Asegúrate de que tu Instagram sea de Empresa o Creador y esté vinculado a tu Fanpage."
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
      `${appUrl}/?meta_success=true&connected=${connectedCount}`
    );
  } catch (error) {
    console.error("Excepción en callback de Meta OAuth:", error);
    return NextResponse.redirect(
      `${appUrl}/?meta_error=Error_procesando_vinculacion_con_Meta`
    );
  }
}
