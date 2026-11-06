// web/src/app/api/billing/checkout/route.ts
// Crea una sesión de Checkout en Lemon Squeezy para el plan elegido y
// devuelve la URL de pago. El plan solo se activa cuando el webhook confirma.
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PLAN_LIMITS, PAID_PLANS, getVariantId, isLemonsqueezyConfigured, PlanKey } from "@/lib/plans";
import { prisma } from "@/lib/db";

const LS_API_URL = "https://api.lemonsqueezy.com/v1/checkouts";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!isLemonsqueezyConfigured()) {
      return NextResponse.json(
        { error: "La pasarela de pagos aún no está configurada." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const plan = body?.plan as PlanKey | undefined;

    if (!plan || !PAID_PLANS.includes(plan) || !(plan in PLAN_LIMITS)) {
      return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
    }

    const variantId = getVariantId(plan);
    if (!variantId) {
      return NextResponse.json(
        { error: `El plan ${plan} no tiene variante de Lemon Squeezy configurada.` },
        { status: 503 }
      );
    }

    const storeId = process.env.LEMONSQUEZY_STORE_ID as string;
    const apiKey = process.env.LEMONSQUEZY_API_KEY as string;

    const origin = req.nextUrl.origin;
    const redirectUrl = `${origin}/dashboard?checkout=success`;

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          // custom_data viaja con el pedido y llega en el webhook
          custom: { user_id: user.id, user_email: user.email },
          product_options: {
            redirect_url: redirectUrl,
          },
          checkout_options: {
            embed: false,
          },
          checkout_data: {
            email: user.email,
            name: user.name ?? "",
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    };

    const res = await fetch(LS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Error creando checkout en Lemon Squeezy:", res.status, detail);
      return NextResponse.json(
        { error: "No se pudo iniciar el pago. Intentá de nuevo en unos minutos." },
        { status: 502 }
      );
    }

    const json = await res.json();
    const url: string | undefined = json?.data?.attributes?.url;

    if (!url) {
      console.error("Respuesta inesperada de Lemon Squeezy:", JSON.stringify(json));
      return NextResponse.json(
        { error: "Respuesta inesperada de la pasarela." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Error en /api/billing/checkout:", error);
    return NextResponse.json(
      { error: "Error interno al iniciar el pago." },
      { status: 500 }
    );
  }
}

// Placeholder para verificar en el frontend qué planes están disponibles/configurados
export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const now = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    billingEnabled: isLemonsqueezyConfigured(),
    plan: now?.plan ?? "free",
    subscriptionStatus: now?.subscriptionStatus ?? "none",
    subscriptionEndsAt: now?.subscriptionEndsAt ?? null,
  });
}
