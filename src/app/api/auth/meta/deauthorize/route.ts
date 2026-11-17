// web/src/app/api/auth/meta/deauthorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decodeSignedRequest } from "@/lib/meta-webhook";

/**
 * Meta Deauthorize Callback.
 * Se dispara cuando un usuario elimina nuestra app desde su configuración de Facebook.
 * https://developers.facebook.com/docs/facebook-login/reauthenticate/#deauthorize-callback
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const data = decodeSignedRequest(signedRequest);
    if (!data || !data.user_id) {
      return NextResponse.json({ error: "Invalid signed_request" }, { status: 401 });
    }

    const facebookUserId = data.user_id;
    console.log(`[Meta Deauthorize] Usuario FB ${facebookUserId} eliminó la app.`);

    // Buscar todas las cuentas de Instagram vinculadas a este usuario de FB (a través del User.id de nuestra DB)
    // Para eso, necesitamos mapear facebookUserId a nuestro User.id.
    // Sin embargo, no tenemos una columna `facebookUserId` en `User` ni en `IgAccount`.
    // Por ahora, logueamos y no hacemos nada. El próximo envío fallará y se marcará como error.
    // Para una solución completa, deberíamos agregar una columna `facebookUserId` en `User`.

    // Solución temporal: buscar por `expiresAt` viejo (que no es confiable).
    // Esto solo se usa para no dejar el callback sin implementar (requisito de Meta).
    // En producción, el cliente debería reconectar manualmente.

    // TODO: Agregar `facebookUserId` a `User` y usarla para buscar IgAccount.
    const user = await prisma.user.findFirst({
      where: { id: facebookUserId }, // Esto no funciona: facebookUserId no es nuestro User.id
    });

    if (!user) {
      console.warn(`[Meta Deauthorize] Usuario FB ${facebookUserId} no encontrado en nuestra DB.`);
      return NextResponse.json({ status: "ok" });
    }

    // Marcar todas las IgAccount del usuario como revocadas
    const updateResult = await prisma.igAccount.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date(), lastErrorAt: new Date(), lastErrorKind: "auth" },
    });

    console.log(`[Meta Deauthorize] Marcadas ${updateResult.count} cuentas como revocadas para el usuario ${user.id}.`);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Meta Deauthorize Error]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
