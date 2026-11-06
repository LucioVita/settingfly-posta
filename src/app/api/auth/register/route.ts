// web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "El registro público se encuentra temporalmente cerrado. Por favor, contáctanos directamente para obtener acceso." },
    { status: 403 }
  );
}
