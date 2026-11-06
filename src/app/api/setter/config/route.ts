// web/src/app/api/setter/config/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let config = await prisma.setterConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      config = await prisma.setterConfig.create({
        data: {
          userId: user.id,
          keywords: ["INFO", "PRECIO", "AGENDA", "ASESORIA", "PLAN"],
        },
      });
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Error al obtener setter config:", error);
    return NextResponse.json(
      { error: "Error interno al obtener configuración." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const data = await request.json();

    const updatedConfig = await prisma.setterConfig.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessName: data.businessName ?? "Settingfly",
        offerDescription: data.offerDescription ?? "",
        targetAudience: data.targetAudience ?? "",
        priceRange: data.priceRange ?? "$500 - $1,500 USD",
        setterName: data.setterName ?? "Asistente Settingfly",
        tone: data.tone ?? "cercano",
        useEmojis: data.useEmojis ?? "moderado",
        dialect: data.dialect ?? "rioplatense",
        bookingType: data.bookingType ?? "calendly",
        bookingUrl: data.bookingUrl ?? "",
        ctaHook: data.ctaHook ?? "Sesión de diagnóstico de 15 minutos sin costo",
        keywords: Array.isArray(data.keywords) ? data.keywords : ["INFO", "PRECIO", "AGENDA"],
        triggerComments: Boolean(data.triggerComments ?? true),
        triggerDms: Boolean(data.triggerDms ?? true),
        triggerStories: Boolean(data.triggerStories ?? false),
        qualificationQ1: data.qualificationQ1 ?? "¿Actualmente ya tenés un negocio en marcha o estás por comenzar?",
        qualificationQ2: data.qualificationQ2 ?? "¿Qué volumen aproximado de prospectos o consultas recibís por semana?",
        qualificationQ3: data.qualificationQ3 ?? "¿Cuentas con presupuesto para invertir en delegar esto si encaja con tu negocio?",
        faqPrice: data.faqPrice ?? "El valor depende exactamente de tus necesidades y volumen de leads...",
        faqInfo: data.faqInfo ?? "Te entiendo perfectamente...",
        faqTime: data.faqTime ?? "¡Totalmente comprensible!...",
        noClosedPrices: Boolean(data.noClosedPrices ?? true),
        noRefundPromises: Boolean(data.noRefundPromises ?? true),
        disqualifyPolite: Boolean(data.disqualifyPolite ?? true),
        customRedLines: data.customRedLines ?? "Nunca insultar, no hablar de política...",
        scheduleMode: data.scheduleMode ?? "TwentyFourSeven",
        timezone: data.timezone ?? "America/Argentina/Buenos_Aires",
        delayMin: Number(data.delayMin ?? 15),
        delayMax: Number(data.delayMax ?? 45),
        takeoverOnRequest: Boolean(data.takeoverOnRequest ?? true),
        takeoverOnScheduled: Boolean(data.takeoverOnScheduled ?? true),
        aiEnabled: Boolean(data.aiEnabled ?? true),
      },
      update: {
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.offerDescription !== undefined && { offerDescription: data.offerDescription }),
        ...(data.targetAudience !== undefined && { targetAudience: data.targetAudience }),
        ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
        ...(data.setterName !== undefined && { setterName: data.setterName }),
        ...(data.tone !== undefined && { tone: data.tone }),
        ...(data.useEmojis !== undefined && { useEmojis: data.useEmojis }),
        ...(data.dialect !== undefined && { dialect: data.dialect }),
        ...(data.bookingType !== undefined && { bookingType: data.bookingType }),
        ...(data.bookingUrl !== undefined && { bookingUrl: data.bookingUrl }),
        ...(data.ctaHook !== undefined && { ctaHook: data.ctaHook }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.triggerComments !== undefined && { triggerComments: data.triggerComments }),
        ...(data.triggerDms !== undefined && { triggerDms: data.triggerDms }),
        ...(data.triggerStories !== undefined && { triggerStories: data.triggerStories }),
        ...(data.qualificationQ1 !== undefined && { qualificationQ1: data.qualificationQ1 }),
        ...(data.qualificationQ2 !== undefined && { qualificationQ2: data.qualificationQ2 }),
        ...(data.qualificationQ3 !== undefined && { qualificationQ3: data.qualificationQ3 }),
        ...(data.faqPrice !== undefined && { faqPrice: data.faqPrice }),
        ...(data.faqInfo !== undefined && { faqInfo: data.faqInfo }),
        ...(data.faqTime !== undefined && { faqTime: data.faqTime }),
        ...(data.noClosedPrices !== undefined && { noClosedPrices: data.noClosedPrices }),
        ...(data.noRefundPromises !== undefined && { noRefundPromises: data.noRefundPromises }),
        ...(data.disqualifyPolite !== undefined && { disqualifyPolite: data.disqualifyPolite }),
        ...(data.customRedLines !== undefined && { customRedLines: data.customRedLines }),
        ...(data.scheduleMode !== undefined && { scheduleMode: data.scheduleMode }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.delayMin !== undefined && { delayMin: Number(data.delayMin) }),
        ...(data.delayMax !== undefined && { delayMax: Number(data.delayMax) }),
        ...(data.takeoverOnRequest !== undefined && { takeoverOnRequest: data.takeoverOnRequest }),
        ...(data.takeoverOnScheduled !== undefined && { takeoverOnScheduled: data.takeoverOnScheduled }),
        ...(data.aiEnabled !== undefined && { aiEnabled: data.aiEnabled }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuración guardada exitosamente.",
      config: updatedConfig,
    });
  } catch (error) {
    console.error("Error al actualizar setter config:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar configuración." },
      { status: 500 }
    );
  }
}
