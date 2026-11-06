import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Bot,
  Users,
  FlaskConical,
  Repeat,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Settingfly | El Setter Autónomo de Instagram que agenda clientes 24/7",
  description:
    "Convierte comentarios en Reels y mensajes directos en videollamadas agendadas 24/7 con IA. Cualifica, maneja objeciones y agenda en piloto automático.",
};

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio", href: "#precio" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Un comentario. Un lead.",
    description:
      "Cada comentario en tus Reels y posts se convierte en un lead: respuesta pública + contenido por privado, según la palabra clave que tú definas.",
  },
  {
    icon: Bot,
    title: "Setter IA 24/7",
    description:
      "Cualifica leads, maneja objeciones y agenda en lenguaje natural. Configura su tono y personalidad sin tocar una línea de código, en cualquier huso horario.",
  },
  {
    icon: Users,
    title: "CRM de leads",
    description:
      "Todos tus leads en un solo lugar: qué conversación lleva cada uno, en qué estado está y su historial completo de Instagram.",
  },
  {
    icon: FlaskConical,
    title: "Simulador antes de activar",
    description:
      "Prueba tu setter en conversaciones de prueba y ajusta sus instrucciones hasta que hable exactamente como quieres. Solo entonces pasa a producción.",
  },
  {
    icon: Repeat,
    title: "Follow-ups que nadie pierde",
    description:
      "Vuelve a contactar leads inactivos con mensajes programados, audios, enlaces o contenido que aporte valor y reavive la conversación.",
  },
  {
    icon: BarChart3,
    title: "Métricas por contenido",
    description:
      "Mira qué Reels y posts generan más leads y cuáles convierten mejor, para enfocar tu estrategia de contenido donde realmente da resultados.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: InstagramIcon,
    title: "Conecta tu Instagram",
    description:
      "Vinculas tus cuentas con la Graph API oficial de Meta. Sin riesgo de baneos ni accesos turbios: es la misma conexión que usan las herramientas aprobadas por Meta.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Configura tu setter",
    description:
      "Le cuentas en lenguaje natural qué vende tu negocio, a quién busca y cómo quieres que hable. Lo pruebas en el simulador y lo activas cuando estés satisfecho.",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Agenda en automático",
    description:
      "La IA recibe los comentarios y DMs de tus campañas, cualifica a cada lead y le manda el link de agenda. Tú solo entras a cerrar la videollamada.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: 49,
    tagline: "Para negocios que arrancan",
    highlight: false,
    features: [
      "1 cuenta de Instagram vinculada",
      "Setter IA con personalidad configurable",
      "Captación de leads por comentarios",
      "CRM con hasta 200 leads activos",
      "Simulador de conversaciones",
      "Soporte por email (24-48h)",
    ],
  },
  {
    name: "Pro",
    price: 99,
    tagline: "Para negocios en crecimiento",
    highlight: true,
    features: [
      "Hasta 3 cuentas de Instagram",
      "CRM con leads ilimitados y funnel visual",
      "Follow-ups programados automáticos",
      "Métricas por contenido (top 10)",
      "Respuestas personalizadas + emojis",
      "Soporte prioritario (< 24h)",
    ],
  },
  {
    name: "Agencia",
    price: 249,
    tagline: "Para agencias y equipos",
    highlight: false,
    features: [
      "Cuentas de Instagram ilimitadas",
      "Perfiles separados por cliente",
      "Toda la potencia del plan Pro",
      "Branding personalizado",
      "Onboarding 1:1 con nuestro equipo",
      "Soporte VIP + revisión de estrategia",
    ],
  },
];

const FAQS = [
  {
    q: "¿Es seguro? ¿La IA accede a mis DMs de Instagram?",
    a: "Usamos la integración oficial con la Graph API de Meta. No accedemos a tu cuenta por la puerta de atrás ni pedimos tu contraseña: la conexión es la misma que usan las herramientas aprobadas por Meta, por lo que tu cuenta no corre riesgo de baneo. Tus conversaciones son tuyas y no se comparten ni venden.",
  },
  {
    q: "¿Tengo que redactar prompts técnicos o saber de IA?",
    a: "No. Configuras el setter en lenguaje natural: qué vende tu negocio, quiénes son tus leads y cómo quieres que hable (tono, emojis, dialecto). Lo pruebas en el simulador hasta que suene exactamente como quieres, y recién ahí lo activas.",
  },
  {
    q: "¿Puedo tomar el control de una conversación?",
    a: "Sí. En cualquier momento puedes pausar la IA en una conversación concreta y responder tú. La IA retoma cuando quieras, así que siempre tienes el control total.",
  },
  {
    q: "¿Y si la IA dice algo que no quiero que diga?",
    a: "Para eso existe el simulador: antes de activar el setter, lo pruebas con conversaciones reales de prueba y ves exactamente qué responde. Ajustas las instrucciones las veces que necesites y solo pasas a producción cuando estés conforme.",
  },
  {
    q: "¿La IA capta leads por sí sola?",
    a: "El sistema recoge, cualifica y agenda: toma los comentarios y mensajes que ya te llegan por tu contenido y campañas, y los convierte en llamadas agendadas. No hace publicidad ni capta tráfico: potenciar tu captación es responsabilidad de tu estrategia de contenido.",
  },
  {
    q: "¿Con qué herramientas agenda las llamadas?",
    a: "Puedes conectar tu Calendly (u otro sistema de reservas con link) para que la IA envíe el link de agenda solo a leads cualificados. También puede coordinar videollamadas por WhatsApp como alternativa.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center flex flex-col gap-4">
      <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#00f2fe]">
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight">
        {title}
      </h2>
      {description ? (
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-settingfly-icon.png"
        alt="Settingfly"
        className="h-9 w-9 rounded-lg object-contain"
      />
      <span className="font-heading font-extrabold text-lg tracking-tight text-white">
        Setting<span className="text-[#d4ff00]">fly</span>
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#14161b] text-slate-100 flex flex-col">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#14161b]/80 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#d4ff00] text-black text-sm font-bold hover:shadow-neon-lime transition-shadow"
          >
            Acceso
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden">
          {/* Ambient glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(closest-side, #00f2fe, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(closest-side, #d4ff00, transparent 70%)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-14">
            <div className="flex flex-col gap-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-neon-cyan w-fit mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] shadow-[0_0_8px_#00f2fe] animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  Setter IA para Instagram
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.05]">
                El Setter Autónomo de Instagram que{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4ff00] via-[#00f2fe] to-[#ff7a00]">
                  agenda clientes
                </span>{" "}
                en piloto automático.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Convierte comentarios en Reels y mensajes directos en videollamadas cualificadas
                para tu agencia o negocio <strong className="text-white">24/7</strong>, con
                lenguaje natural y sin que tengas que redactar prompts complejos.
                <strong className="text-white"> Sin humanos que se cansan, se desaniman y desaparecen.</strong>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#d4ff00] text-black font-bold text-base hover:shadow-neon-lime transition-shadow"
                >
                  Acceder a la plataforma
                  <ChevronRight className="size-4.5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/15 text-slate-200 font-semibold text-base hover:bg-white/[0.04] hover:border-white/25 transition-colors"
                >
                  Ver cómo funciona
                </a>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 font-mono">
                <Shield className="size-3.5 text-[#d4ff00]" />
                <span>
                  Intercambio oficial de Meta Graph API · Sin riesgo de baneos
                </span>
              </div>
            </div>

            {/* Hero visual: comment -> DM -> agenda mock */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="shadow-phone-electric rounded-3xl border border-white/[0.08] bg-[#1a1d24] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#d4ff00] to-[#00f2fe] flex items-center justify-center">
                    <InstagramIcon className="size-5 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Reel · Tu negocio</span>
                    <span className="text-xs text-slate-500">hace 2 min</span>
                  </div>
                </div>

                {/* Comment */}
                <div className="rounded-2xl rounded-tr-sm bg-[#20242e] border border-white/[0.06] p-4">
                  <p className="text-xs text-[#00f2fe] font-bold mb-1">
                    lead_interesado_01 comentó:
                  </p>
                  <p className="text-sm text-slate-200">“quiero info del programa 🙌”</p>
                </div>

                {/* IA reply */}
                <div className="rounded-2xl rounded-tl-sm bg-[#d4ff00]/10 border border-[#d4ff00]/25 p-4 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#d4ff00]">
                    <Bot className="size-3" /> Setter IA respondió
                  </span>
                  <p className="text-sm text-slate-200">
                    “¡Buenas! Te escribí por DM con todo 👀” <span className="text-slate-500">· público</span>
                  </p>
                </div>

                {/* DM */}
                <div className="rounded-2xl rounded-tr-sm bg-[#20242e] border border-white/[0.06] p-4 flex flex-col gap-2">
                  <p className="text-sm text-slate-200">
                    “Holaa! 👋 Vi que te interesa el programa. ¿Haces llamadas o trabajas con
                    agencias online?”
                  </p>
                </div>

                {/* Agenda */}
                <div className="rounded-2xl border border-[#ff7a00]/30 bg-[#ff7a00]/10 p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#ff7a00]/20 flex items-center justify-center shrink-0">
                    <Calendar className="size-4.5 text-[#ff7a00]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      ✅ Lead cualificado
                    </span>
                    <span className="text-xs text-slate-400">
                      Link de agenda enviado · videollamada mañana 10:00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Capabilities strip ===== */}
        <section className="border-y border-white/[0.06] bg-[#1a1d24]/50">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Zap, value: "24/7", label: "Sin límite de conversaciones" },
              { icon: Shield, value: "API oficial", label: "Conexión segura con Meta" },
              { icon: Bot, value: "IA", label: "Lenguaje natural, sin prompts" },
              { icon: Calendar, value: "0 tiempo", label: "Configuras en menos de un día" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5">
                <item.icon className="size-5 text-[#00f2fe]" />
                <span className="font-heading font-extrabold text-xl text-white">
                  {item.value}
                </span>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Problem ===== */}
        <section className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight">
              Nadie sabe más de tu negocio que tú.
              <span className="block text-slate-400 text-2xl sm:text-3xl mt-2">
                Pero llegá el momento de crecer y…
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Más leads diarios, más demanda, y tú como único cuello de botella. Contratar
              setters humanos significa contratar y capacitar semanas, corregir, volver a
              explicar… y cuando por fin dominan tu proceso, se van.
            </p>
            <ul className="flex flex-col gap-3 pt-2">
              {[
                "Responder cada DM personalmente te come el día",
                "Los leads frios que no respondieron a la primera quedan muertos",
                "Reclutar y gestionar setters toma más tiempo que el valor que aportan",
              ].map((pain) => (
                <li key={pain} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff7a00] shrink-0" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#d4ff00]">
              Con Settingfly
            </span>
            {[
              {
                title: "Sin contratar ni capacitar",
                desc: "El setter IA aprende tu proceso con tus instrucciones y lo ejecuta tal cual, cada vez, para cada lead.",
              },
              {
                title: "Sin horarios ni vacaciones",
                desc: "Responde a las 3 AM un domingo en tu dialecto regional, con tu tono y tu criterio de cualificación.",
              },
              {
                title: "Cero leads perdidos",
                desc: "Follow-ups automáticos hasta que el lead vuelva a responder, y si algún día quieres hablar tú, pausas la IA con un clic.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-[#1a1d24] border border-white/[0.06] p-5 hover:border-[#d4ff00]/30 transition-colors"
              >
                <p className="font-bold text-white mb-1">{card.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Cómo funciona ===== */}
        <section id="como-funciona" className="max-w-7xl mx-auto px-6 py-24">
          <SectionHeading
            eyebrow="Cómo funciona"
            title={
              <>
                Configura una vez.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4ff00] to-[#00f2fe]">
                  Agenda para siempre.
                </span>
              </>
            }
            description="De conectar tu cuenta a tener la IA agendando llamadas, en tres pasos."
          />

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl bg-[#1a1d24] border border-white/[0.06] p-7 flex flex-col gap-4 hover:border-[#00f2fe]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/25 flex items-center justify-center">
                    <step.icon className="size-6 text-[#00f2fe]" />
                  </div>
                  <span className="font-heading font-extrabold text-4xl text-white/[0.08]">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-bold">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-[#1a1d24] border border-white/[0.06] p-6 flex flex-col gap-3 hover:border-white/20 transition-colors"
              >
                <feature.icon className="size-5 text-[#d4ff00]" />
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="precio" className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(closest-side, #d4ff00, transparent 70%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 py-24">
            <SectionHeading
              eyebrow="Precio"
              title="Elige tu plan. Cámbialo cuando quieras."
              description="Todo plan incluye la conexión oficial con la Graph API de Meta y el simulador de conversaciones. Sin instalación: 100% en la nube."
            />

            <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-7 flex flex-col gap-6 border transition-colors ${
                    plan.highlight
                      ? "bg-[#1a1d24] border-[#d4ff00]/40 shadow-neon-lime md:-translate-y-3"
                      : "bg-[#1a1d24] border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#d4ff00] text-black text-[11px] font-bold uppercase tracking-wide">
                      Más elegido
                    </span>
                  ) : null}

                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading font-extrabold text-xl">{plan.name}</h3>
                    <p className="text-xs text-slate-500">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-5xl text-white">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-slate-500">USD / mes</span>
                  </div>

                  <ul className="flex flex-col gap-2.5 text-sm text-slate-300 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`size-4 mt-0.5 shrink-0 ${
                            plan.highlight ? "text-[#d4ff00]" : "text-[#00f2fe]"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-center ${
                      plan.highlight
                        ? "bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30"
                        : "border border-white/10 text-slate-500"
                    }`}
                  >
                    Activación al registrarte
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24 w-full">
          <SectionHeading eyebrow="FAQ" title="Preguntas frecuentes." />
          <div className="mt-12 flex flex-col gap-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl bg-[#1a1d24] border border-white/[0.06] px-6 py-4 hover:border-white/20 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-sm sm:text-base text-white [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-[#00f2fe] text-xl group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="pt-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="max-w-7xl mx-auto px-6 pb-24 w-full">
          <div className="relative overflow-hidden rounded-3xl border border-[#d4ff00]/25 bg-gradient-to-br from-[#1a1d24] to-[#14161b] px-8 py-14 text-center flex flex-col items-center gap-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-15"
              style={{
                background:
                  "radial-gradient(closest-side, #d4ff00, transparent 70%)",
              }}
            />
            <span className="relative text-xs font-mono font-bold tracking-widest uppercase text-[#d4ff00]">
              Empezar ahora
            </span>
            <h2 className="relative text-3xl sm:text-4xl font-heading font-extrabold tracking-tight max-w-2xl">
              Tu próximo lead ya está comentando en tu Reel.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4ff00] to-[#00f2fe]">
                ¿Quién le responde?
              </span>
            </h2>
            <p className="relative text-sm sm:text-base text-slate-400 max-w-xl">
              Configurar Settingfly toma menos de un día. Conecta tu Instagram y
              deja que el setter IA trabaje 24/7 por ti.
            </p>
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#d4ff00] text-black font-bold text-base hover:shadow-neon-lime transition-shadow"
            >
              Acceder a la plataforma
              <ChevronRight className="size-4.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/[0.06] bg-[#1a1d24]/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link href="/login" className="hover:text-white transition-colors">
              Acceso
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 py-5 text-center text-[11px] text-slate-500 font-mono">
            © 2026 Settingfly.com • Desarrollado por{" "}
            <a
              href="https://guruweb.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#00f2fe] transition-colors"
            >
              guruweb.com.ar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
