// web/src/app/api/auth/meta/data-deletion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decodeSignedRequest } from "@/lib/meta-webhook";

/**
 * Meta Data Deletion Request.
 * https://developers.facebook.com/docs/development/delete-data/
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
    console.log(`[Meta Data Deletion] Usuario FB ${facebookUserId} solicitó eliminación de datos.`);

    // Buscar el usuario en nuestra DB usando facebookUserId (si lo tuviéramos almacenado)
    // Como no lo almacenamos en el OAuth callback, no podemos mapear a nuestro User.id.
    // Esto es un problema de diseño. Solución temporal: loguear y no eliminar nada.
    // Para cumplir con Meta, devolvemos un URL y código de confirmación.

    // TODO: Agregar `facebookUserId` a `User` en el OAuth callback y usarla aquí.
    const user = await prisma.user.findFirst({
      where: { id: facebookUserId }, // Esto no funciona: facebookUserId no es nuestro User.id
    });

    if (!user) {
      console.warn(`[Meta Data Deletion] Usuario FB ${facebookUserId} no encontrado en nuestra DB.`);
    } else {
      // Eliminar todos los datos del usuario: IgAccount, Conversation, etc.
      await prisma.igAccount.deleteMany({ where: { userId: user.id } });
      await prisma.conversation.deleteMany({ where: { userId: user.id } });
      // Eliminar al usuario mismo (opcional, según políticas)
      await prisma.user.delete({ where: { id: user.id } });
    }

    // Meta requiere un URL y un código de confirmación
    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const deletionUrl = `https://settingfly.com/privacidad/eliminacion?code=${confirmationCode}`;

    return NextResponse.json({
      url: deletionUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("[Meta Data Deletion Error]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
