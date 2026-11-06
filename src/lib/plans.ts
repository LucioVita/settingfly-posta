// web/src/lib/plans.ts
// Configuración de planes del SaaS + límites por plan.
// Los IDs de variant de Lemon Squeezy vienen de variables de entorno.

export type PlanKey = "free" | "starter" | "pro" | "agencia";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceUsd: number;
  tagline: string;
  /** null = ilimitado */
  maxIgAccounts: number | null;
  maxActiveLeads: number | null;
  highlight?: boolean;
}

export const PLAN_LIMITS: Record<PlanKey, PlanConfig> = {
  free: {
    key: "free",
    name: "Free",
    priceUsd: 0,
    tagline: "Para probar la plataforma",
    maxIgAccounts: 1,
    maxActiveLeads: 50,
  },
  starter: {
    key: "starter",
    name: "Starter",
    priceUsd: 49,
    tagline: "Para negocios que arrancan",
    maxIgAccounts: 1,
    maxActiveLeads: 200,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceUsd: 99,
    tagline: "Para negocios en crecimiento",
    maxIgAccounts: 3,
    maxActiveLeads: null,
    highlight: true,
  },
  agencia: {
    key: "agencia",
    name: "Agencia",
    priceUsd: 249,
    tagline: "Para agencias y equipos",
    maxIgAccounts: null,
    maxActiveLeads: null,
  },
};

/**variantes pagas (para el selector de upgrade) */
export const PAID_PLANS: PlanKey[] = ["starter", "pro", "agencia"];

export function isPlanKey(value: string): value is PlanKey {
  return value in PLAN_LIMITS;
}

/** ID de variante de Lemon Squeezy configurado por .env (se setea en el dashboard de LS) */
export function getVariantId(plan: PlanKey): string | null {
  const map: Record<Exclude<PlanKey, "free">, string | undefined> = {
    starter: process.env.LEMONSQUEZY_VARIANT_STARTER,
    pro: process.env.LEMONSQUEZY_VARIANT_PRO,
    agencia: process.env.LEMONSQUEZY_VARIANT_AGENCIA,
  };
  if (plan === "free") return null;
  return map[plan] ?? null;
}

/** Mapa inverso: variantId de LS -> plan (para el webhook) */
export function getPlanFromVariantId(variantId: string | number): PlanKey | null {
  for (const plan of PAID_PLANS) {
    const id = getVariantId(plan);
    if (id && String(id) === String(variantId)) return plan;
  }
  return null;
}

export function planIsConfigured(plan: PlanKey): boolean {
  return Boolean(getVariantId(plan));
}

export function isLemonsqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEZY_API_KEY && process.env.LEMONSQUEZY_STORE_ID
  );
}
