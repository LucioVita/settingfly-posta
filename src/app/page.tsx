"use client";
import React, { useState } from "react";
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

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        e.currentTarget.reset();
      } else {
        const err = await res.json();
        setError(err.error || "Error al enviar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-center">
        <Check className="size-8 text-[#d4ff00] mx-auto mb-3" />
        <p className="text-[#d4ff00] font-bold">¡Solicitud recibida!</p>
        <p className="text-sm text-slate-300">Te contactaremos a la brevedad.</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl bg-[#1a1d24] border border-white/[0.06] p-6"
      onSubmit={handleSubmit}
    >
      {error && <p className="text-rose-400 text-sm mb-2">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Nombre</label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">Correo</label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-400 block mb-2">Instagram o Perfil</label>
        <input
          type="text"
          name="instagram"
          className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
          placeholder="@usuario"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400 block mb-2">Mensaje</label>
        <textarea
          name="message"
          rows={3}
          className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00] transition-colors resize-none"
          placeholder="¿En qué podemos ayudarte?"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-2xl bg-[#d4ff00] text-[#14161b] font-bold text-base hover:shadow-neon-lime transition-shadow disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}

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

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Plan a medida", href: "#plan" },
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

        {/* ===== Plan a medida / Contacto ===== */}
        <section id="plan" className="relative overflow-hidden">
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
              eyebrow="Plan a medida"
              title={
                <>
                  Sin tablas de precios.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4ff00] to-[#00f2fe]">
                    Un plan armado para tu negocio.
                  </span>
                </>
              }
              description="No publicamos tarifas: primero escuchamos tu caso, entendemos tu volumen de consultas y después armamos una propuesta con exactamente lo que tu negocio necesita, y nada más."
            />

            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Sin tarifas escondidas",
                  desc: "Nada de letra chica ni costos ocultos: la propuesta sale de una conversación con el equipo, no de una tabla genérica.",
                },
                {
                  icon: Users,
                  title: "Diseñado sobre tu caso",
                  desc: "Vemos tu operación, tu canal y tu volumen de leads; el plan reúne solo lo que tu negocio necesita: ni un feature menos, ni uno de más.",
                },
                {
                  icon: Repeat,
                  title: "Escalas a tu ritmo",
                  desc: "Empieza con lo justo y suma cuentas, funciones o volumen solo cuando tu operación lo pida.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-[#1a1d24] border border-white/[0.06] p-7 flex flex-col gap-4 hover:border-[#d4ff00]/30 transition-colors"
                >
                  <div className="h-12 w-12 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/25 flex items-center justify-center">
                    <item.icon className="size-6 text-[#d4ff00]" />
                  </div>
                  <h3 className="text-lg font-heading font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#contacto-custom"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#d4ff00] text-black font-bold text-base hover:shadow-neon-lime transition-shadow"
              >
                Solicitar mi plan a medida
                <ChevronRight className="size-4.5" />
              </a>
            </div>

            {/* Formulario de contacto / cotización personalizada */}
            <div id="contacto-custom" className="mt-14 max-w-xl mx-auto scroll-mt-20">
              <h3 className="text-xl font-heading font-bold text-center text-white mb-2">
                Solicita tu plan a medida
              </h3>
              <p className="text-xs text-slate-400 text-center mb-6">
                Déjanos tus datos y nos pondremos en contacto para armar una propuesta adaptada a tus necesidades y volumen.
              </p>
              <ContactForm />
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
