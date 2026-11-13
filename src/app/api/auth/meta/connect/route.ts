// web/src/app/api/auth/meta/connect/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://settingfly.com";

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?error=unauthorized`);
    }

    const appId = process.env.META_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: "META_APP_ID no está configurado en el servidor." },
        { status: 500 }
      );
    }

    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    // Permisos requeridos para leer y contestar mensajes y comentarios de Instagram
    const permissions = [
      "public_profile",
      "email",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "instagram_basic",
      "instagram_manage_messages",
    ].join(",");

    // Generamos un state seguro con el userId para evitar ataques CSRF y asociar la cuenta
    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        nonce: Math.random().toString(36).substring(2),
        timestamp: Date.now(),
      })
    ).toString("base64url");

    // URL oficial del diálogo de login de Facebook / Meta
    const metaAuthUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
    metaAuthUrl.searchParams.set("client_id", appId);
    metaAuthUrl.searchParams.set("redirect_uri", redirectUri);
    metaAuthUrl.searchParams.set("state", state);
    metaAuthUrl.searchParams.set("scope", permissions);
    metaAuthUrl.searchParams.set("response_type", "code");
    metaAuthUrl.searchParams.set("auth_type", "rerequest");

    return NextResponse.redirect(metaAuthUrl.toString());
  } catch (error) {
    console.error("Error al iniciar conexión con Meta:", error);
    return NextResponse.json(
      { error: "Error al iniciar conexión con Meta." },
      { status: 500 }
    );
  }
}

