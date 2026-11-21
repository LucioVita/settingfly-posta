// web/src/app/api/auth/meta/callback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string };
  connected_instagram_account?: { id: string; username?: string };
}

const GRAPH = "https://graph.facebook.com/v21.0";

/** GET a Graph API. Devuelve null si Meta responde error (queda logueado para diagnóstico). */
async function graphGet<T>(path: string, token: string): Promise<T | null> {
  try {
    // Se concatenan los campos con llaves tal cual (la API los espera así) y se
    // codifica únicamente el token, que puede traer caracteres especiales.
    const separator = path.includes("?") ? "&" : "?";
    const res = await fetch(`${GRAPH}/${path}${separator}access_token=${encodeURIComponent(token)}`);
    const data = (await res.json()) as { error?: { message?: string } } & T;
    if (data?.error) {
      console.warn(`[Meta callback] Error en ${path}:`, data.error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn(`[Meta callback] Excepción en ${path}:`, error);
    return null;
  }
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
    // 1. Validar state
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

    // 2. Code -> User Access Token
    const tokenUrl = new URL(`${GRAPH}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Error al canjear code por token en Meta:", tokenData);
      const msg = tokenData?.error?.message || "Error al canjear código por token en Meta";
      return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(msg)}`);
    }

    // 3. Extender a token de larga duración (60 días)
    const longTokenUrl = new URL(`${GRAPH}/oauth/access_token`);
    longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longTokenUrl.searchParams.set("client_id", appId);
    longTokenUrl.searchParams.set("client_secret", appSecret);
    longTokenUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longTokenRes = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenRes.json();
    const longUserToken: string = longTokenData.access_token || tokenData.access_token;

    // 4. Recolectar Páginas por todas las vías conocidas
    const pages: FacebookPage[] = [];
    const seen = new Set<string>();
    const addPage = (page: FacebookPage | null | undefined) => {
      if (page?.id && !seen.has(page.id)) {
        seen.add(page.id);
        pages.push(page);
      }
    };

    // 4.a) /me/accounts (Facebook Login clásico)
    const accountsData = await graphGet<{ data?: FacebookPage[] }>(
      "me/accounts?fields=id,name,access_token,instagram_business_account{id,username},connected_instagram_account{id,username}&limit=100",
      longUserToken
    );
    for (const page of accountsData?.data ?? []) addPage(page);
    console.log(`[Meta callback] /me/accounts: ${accountsData?.data?.length ?? 0} páginas`);

    // 4.b) Portafolios de negocio: owned_pages / client_pages
    if (pages.length === 0) {
      const bizData = await graphGet<{
        data?: Array<{
          owned_pages?: { data?: FacebookPage[] };
          client_pages?: { data?: FacebookPage[] };
        }>;
      }>(
        "me/businesses?fields=id,name,owned_pages{id,name,access_token,instagram_business_account{id,username}},client_pages{id,name,access_token,instagram_business_account{id,username}}",
        longUserToken
      );
      for (const biz of bizData?.data ?? []) {
        for (const page of [...(biz.owned_pages?.data ?? []), ...(biz.client_pages?.data ?? [])]) {
          addPage(page);
        }
      }
      console.log(`[Meta callback] /me/businesses: ${pages.length} páginas acumuladas`);
    }

    // 4.c) Página(s) configurada(s) explícitamente (fallback que ya funcionaba)
    if (pages.length === 0) {
      const fallbackIds = (process.env.META_FALLBACK_PAGE_IDS || process.env.META_PAGE_ID || "109498395585154")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      for (const pageId of fallbackIds) {
        const page = await graphGet<FacebookPage>(
          `${pageId}?fields=id,name,access_token,instagram_business_account{id,username},connected_instagram_account{id,username}`,
          longUserToken
        );
        if (page?.id) addPage(page);
      }
      console.log(`[Meta callback] Fallback directo: ${pages.length} páginas acumuladas`);
    }

    // 5. Resolver token de página + cuenta de Instagram enlazada
    for (const page of pages) {
      if (!page.access_token) {
        const tokenOnly = await graphGet<{ access_token?: string }>(
          `${page.id}?fields=access_token`,
          longUserToken
        );
        if (tokenOnly?.access_token) page.access_token = tokenOnly.access_token;
      }

      if (!page.instagram_business_account?.id && page.access_token) {
        const pageData = await graphGet<{
          instagram_business_account?: { id: string; username?: string };
          connected_instagram_account?: { id: string; username?: string };
        }>(
          `${page.id}?fields=instagram_business_account{id,username},connected_instagram_account{id,username}`,
          page.access_token
        );
        if (pageData?.instagram_business_account?.id) {
          page.instagram_business_account = pageData.instagram_business_account;
        } else if (pageData?.connected_instagram_account?.id) {
          page.instagram_business_account = pageData.connected_instagram_account;
        }
      }
    }

    const pagesWithIg = pages.filter((page) => page.instagram_business_account?.id);

    if (pages.length === 0) {
      // Diagnóstico sólo en logs; al usuario le damos un mensaje claro.
      const perms = await graphGet<{ data?: Array<{ permission: string; status: string }> }>(
        "me/permissions",
        longUserToken
      );
      console.warn(
        "[Meta callback] Sin páginas. Permisos:",
        (perms?.data ?? []).filter((p) => p.status === "granted").map((p) => p.permission)
      );
      return NextResponse.redirect(
        `${appUrl}/dashboard?meta_error=${encodeURIComponent(
          "No encontramos ninguna Página de Facebook asociada a tu cuenta. Verificá que tu Instagram sea Business o Creator y que esté vinculado a una Página que administrás."
        )}`
      );
    }

    if (pagesWithIg.length === 0) {
      const pageNames = pages.map((page) => page.name).join(", ");
      return NextResponse.redirect(
        `${appUrl}/dashboard?meta_error=${encodeURIComponent(
          `Encontramos la Página "${pageNames}", pero no tiene una cuenta de Instagram Profesional vinculada. Vinculala desde Instagram: Configuración → Cuenta → Compartir con otras apps → Facebook.`
        )}`
      );
    }

    // 6. Guardar cuentas y suscribir webhooks
    let connectedCount = 0;
    for (const page of pagesWithIg) {
      const ig = page.instagram_business_account!;
      const igId = ig.id;
      let igUsername = ig.username || "";

      if (!igUsername && page.access_token) {
        const igDetails = await graphGet<{ username?: string }>(`${igId}?fields=username`, page.access_token);
        igUsername = igDetails?.username || `ig_${igId}`;
      }

      const pageToken = page.access_token || longUserToken;

      try {
        await fetch(`${GRAPH}/${page.id}/subscribed_apps`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            subscribed_fields: "messages,messaging_postbacks,feed",
            access_token: pageToken,
          }),
        });
      } catch (subErr) {
        console.warn(`No se pudo auto-suscribir la página ${page.id}:`, subErr);
      }

      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      await prisma.igAccount.upsert({
        where: { instagramId: igId },
        update: {
          userId,
          username: igUsername.replace(/^@/, "").toLowerCase(),
          accessToken: pageToken,
          pageId: page.id,
          expiresAt,
          revokedAt: null,
          lastErrorKind: null,
          lastErrorAt: null,
        },
        create: {
          userId,
          instagramId: igId,
          username: igUsername.replace(/^@/, "").toLowerCase(),
          accessToken: pageToken,
          pageId: page.id,
          expiresAt,
        },
      });

      connectedCount++;
    }

    return NextResponse.redirect(`${appUrl}/dashboard?meta_success=true&connected=${connectedCount}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Excepción en callback de Meta OAuth:", error);
    const msg = err?.message || "Error procesando vinculación con Meta";
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(msg)}`);
  }
}
