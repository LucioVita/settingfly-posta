// web/src/app/api/webhooks/lemonsqueezy/route.ts
// Recibe los eventos de Lemon Squeezy y activa/actualiza el plan del usuario.
// Soporta suscripciones (subscription_created / subscription_updated / subscription_expired, etc).
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPlanFromVariantId } from "@/lib/plans";

interface LsWebhookSubscription {
  meta: {
    event_name: string;
    custom_data?: { user_id?: number; user_email?: string };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      variant_id: number;
      customer_id: number;
      user_email?: string;
      renews_at?: string | null;
      ends_at?: string | null;
      cancelled?: boolean;
    };
  };
}

/** Mapea el status de LS a nuestro subscriptionStatus */
function mapStatus(lsStatus: string): string {
  // LS: on_trial | active | cancelled | on_hold | past_due | expired
  return lsStatus;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");

    const secret = process.env.LEMONSQUEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("LEMONSQUEZY_WEBHOOK_SECRET no está configurado.");
      return NextResponse.json({ error: "Webhook sin configurar" }, { status: 503 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Firma ausente" }, { status: 401 });
    }

    // Verificación HMAC-SHA256 de Lemon Squeezy sobre el cuerpo crudo
    const hmac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(hmac);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.error("Firma de webhook inválida (Lemon Squeezy).");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as LsWebhookSubscription;
    const eventName = event?.meta?.event_name;
    const attrs = event?.data?.attributes;

    if (!eventName || !attrs) {
      return NextResponse.json({ received: true }); // evento no estructurado: ignorar sin error
    }

    // Solo procesamos suscripciones (el modelo es 100% de suscripción mensual)
    if (!event.data.type || event.data.type !== "subscriptions") {
      return NextResponse.json({ received: true, ignored: eventName });
    }

    const userId = event?.meta?.custom_data?.user_id;

    // Respaldo: si no llega user_id en custom data, buscamos el usuario por email
    let targetUserId: number | null = null;
    if (typeof userId === "number" && userId > 0) {
      targetUserId = userId;
    } else if (attrs.user_email) {
      const found = await prisma.user.findUnique({
        where: { email: attrs.user_email.toLowerCase() },
        select: { id: true },
      });
      targetUserId = found?.id ?? null;
    }

    if (!targetUserId) {
      console.error("Webhook LS sin user_id ni email reconocible:", eventName);
      return NextResponse.json({ received: true, ignored: "sin usuario destino" });
    }

    const planFromVariant = getPlanFromVariantId(attrs.variant_id);
    const newStatus = mapStatus(attrs.status);
    // renews_at = próxima fecha de cobro; si está cancelled/expired usamos ends_at
    const periodEnd = attrs.renews_at ?? attrs.ends_at ?? null;

    const updateData: {
      plan?: string;
      subscriptionStatus: string;
      subscriptionEndsAt: Date | null;
      lemonsqueezyCustomerId: string;
      lemonsqueezySubId: string;
    } = {
      subscriptionStatus: newStatus,
      subscriptionEndsAt: periodEnd ? new Date(periodEnd) : null,
      lemonsqueezyCustomerId: String(attrs.customer_id),
      lemonsqueezySubId: event.data.id,
    };

    if (planFromVariant) {
      // Nunca bajamos el plan hasta que la suscripción deje de estar activa
      const isStillActive = ["on_trial", "active", "past_due"].includes(newStatus);
      if (isStillActive) {
        updateData.plan = planFromVariant;
      } else {
        // cancelada / expired / on_hold: baja a free
        updateData.plan = "free";
      }
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    return NextResponse.json({ received: true, event: eventName });
  } catch (error) {
    console.error("Error en webhook de Lemon Squeezy:", error);
    // 200 para no provocar reintentos infinitos ante errores internos,
    // pero logueamos el error para debug
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
