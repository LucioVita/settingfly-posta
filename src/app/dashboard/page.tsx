"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Layers,
  BarChart3,
  MessageSquare,
  FlaskConical,
  Calculator,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  LogOut,
  LogIn,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Send,
  Phone,
  Video,
  Shield,
  Clock,
  Zap,
  Flame,
  Check,
  Search,
  Plus,
  PlayCircle,
  CheckCheck,
  Link as LinkIcon,
  HelpCircle,
  Settings2,
  Share2,
  TrendingUp,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

// Iconos personalizados para Meta Instagram y WhatsApp (estilo ZeroChats)
function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.88-.38-4.13-1.11l-.3-.17-3.12.82.83-3.04-.19-.31a8.21 8.21 0 0 1-1.26-4.43c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.39-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/>
    </svg>
  );
}

export default function App() {
  // Navigation
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"wizard" | "campaigns" | "metrics" | "inbox" | "sandbox">("wizard");
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Auth state
  const [user, setUser] = useState<{ id: number; email: string; name: string | null; plan?: string; subscriptionStatus?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Instagram accounts state (Multi-tenant ZeroChats style)
  const [igAccounts, setIgAccounts] = useState<
    Array<{ id: number; username: string; instagramId: string; pageId?: string; expiresAt?: string }>
  >([]);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [newIgUsername, setNewIgUsername] = useState("");
  const [newIgId, setNewIgId] = useState("");
  const [newIgToken, setNewIgToken] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showManualConnect, setShowManualConnect] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Save loading
  const [isSaving, setIsSaving] = useState(false);

  // Plan / Billing (Lemon Squeezy)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  // Setter configuration state (matched to Prisma schema)
  const [config, setConfig] = useState({
    businessName: "Settingfly",
    offerDescription: "Automatización de ventas para Instagram y cualificación con IA para agencias y creadores",
    targetAudience: "Dueños de agencias B2B, formadores y negocios que reciben +20 DMs diarios",
    priceRange: "$500 - $1,500 USD",
    setterName: "Asistente Settingfly",
    tone: "cercano",
    useEmojis: "moderado",
    dialect: "rioplatense",
    bookingType: "calendly",
    bookingUrl: "https://settingfly.com/demo",
    ctaHook: "Sesión de diagnóstico de 15 minutos sin costo",
    keywords: ["INFO", "QUIERO", "PRECIO", "AGENDA"],
    triggerComments: true,
    triggerDms: true,
    triggerStories: false,
    qualificationQ1: "¿Actualmente ya tenés un negocio en marcha o estás por comenzar?",
    qualificationQ2: "¿Qué volumen aproximado de prospectos o consultas recibís por semana?",
    qualificationQ3: "¿Cuentas con presupuesto para invertir en delegar esto si encaja con tu negocio?",
    faqPrice: "Tenemos planes a medida desde $500/mes. En la llamada de 15 min vemos exactamente qué arquitectura te rinde mejor.",
    faqInfo: "Te entiendo perfectamente. Como armamos una solución a medida, en la sesión de 15 min te comparto pantalla y te muestro el embudo funcionando en vivo.",
    faqTime: "¡Totalmente entendible! Justamente implementamos el setter para liberarte 20h semanales. Si quieres te dejo el link para cuando te liberes.",
    noClosedPrices: true,
    noRefundPromises: true,
    disqualifyPolite: true,
    customRedLines: "Nunca insultar, no hablar de política, ni prometer números de facturación irreales.",
    scheduleMode: "TwentyFourSeven",
    timezone: "America/Argentina/Buenos_Aires",
    delayMin: 15,
    delayMax: 30,
    takeoverOnRequest: true,
    takeoverOnScheduled: true,
    aiEnabled: true,
  });

  // Simulator test message override
  const [simProspectMsg, setSimProspectMsg] = useState("¡Hola! Vi el reel de automatización, ¿me pasan info y precios?");
  const [simSetterOverride, setSimSetterOverride] = useState<string | null>(null);

  // Check auth and load config on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const authRes = await fetch("/api/auth/me");
          if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            setUser(authData.user);
            if (authData.user.igAccounts) {
              setIgAccounts(authData.user.igAccounts);
            }
            if (authData.user.setterConfig) {
              const sc = authData.user.setterConfig;
              setConfig((prev) => ({
                ...prev,
                ...sc,
                keywords: Array.isArray(sc.keywords) ? sc.keywords : prev.keywords,
              }));
            }
          } else {
            router.replace("/login"); // Redirect to login if not authenticated
          }
        } else {
          router.replace("/login"); // Redirect to login if auth check fails
        }
      } catch (e) {
        console.error("Error loading user session:", e);
      }
    }
    loadInitialData();

    // Comprobar parámetros devueltos por el callback de Meta OAuth
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const metaSuccess = urlParams.get("meta_success");
      const metaError = urlParams.get("meta_error");
      const connectedCount = urlParams.get("connected");

      if (metaSuccess) {
        triggerToast(`¡Conexión exitosa con Meta! (${connectedCount || 1} cuenta/s vinculadas)`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (metaError) {
        triggerToast(`Error al conectar con Meta: ${decodeURIComponent(metaError)}`, "error");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save config to MySQL
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/setter/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        triggerToast("¡Configuración sincronizada y guardada en MySQL!");
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setIsAuthModalOpen(true);
          triggerToast("Inicia sesión para guardar tus cambios.", "error");
        } else {
          triggerToast(data.error || "Error al guardar.", "error");
        }
      }
    } catch {
      triggerToast("Error de conexión al servidor.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Auth handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Ocurrió un error.");
        setAuthLoading(false);
        return;
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      setAuthPassword("");
      triggerToast(authMode === "login" ? "¡Sesión iniciada con éxito!" : "¡Cuenta creada exitosamente!");

      // Refresh config
      const cfgRes = await fetch("/api/setter/config");
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.config) {
          setConfig((prev) => ({
            ...prev,
            ...cfgData.config,
            keywords: Array.isArray(cfgData.config.keywords) ? cfgData.config.keywords : prev.keywords,
          }));
        }
      }
    } catch {
      setAuthError("Error de comunicación con el servidor.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIgAccounts([]);
      triggerToast("Sesión cerrada.");
    } catch {
      triggerToast("Error al cerrar sesión.", "error");
    }
  };

  // Inicia el checkout en Lemon Squeezy para el plan elegido
  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      triggerToast("Inicia sesión para elegir tu plan.", "error");
      return;
    }
    setBillingLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      triggerToast(data?.error || "No se pudo iniciar el pago.", "error");
    } catch {
      triggerToast("Error de conexión al iniciar el pago.", "error");
    } finally {
      setBillingLoading(null);
    }
  };

  const fetchIgAccounts = async () => {
    try {
      const res = await fetch("/api/instagram/accounts");
      if (res.ok) {
        const data = await res.json();
        setIgAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error("Error fetching IG accounts:", err);
    }
  };

  const handleConnectIgAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectLoading(true);
    setConnectError(null);
    try {
      const res = await fetch("/api/instagram/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newIgUsername,
          instagramId: newIgId,
          accessToken: newIgToken,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`¡Cuenta @${newIgUsername.replace(/^@/, "")} vinculada exitosamente!`);
        setNewIgUsername("");
        setNewIgId("");
        setNewIgToken("");
        fetchIgAccounts();
      } else {
        setConnectError(data.error || "Error al conectar la cuenta.");
      }
    } catch {
      setConnectError("Error de comunicación con el servidor.");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectIgAccount = async (id: number) => {
    if (!confirm("¿Deseas desconectar esta cuenta de Instagram?")) return;
    try {
      const res = await fetch(`/api/instagram/accounts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("Cuenta de Instagram desconectada.");
        fetchIgAccounts();
      } else {
        triggerToast("No se pudo desconectar la cuenta.", "error");
      }
    } catch {
      triggerToast("Error de conexión.", "error");
    }
  };

  // Get dynamic greeting based on dialect
  const getSimGreeting = () => {
    if (config.dialect === "rioplatense") {
      return `¡Qué hacés crack! Qué bueno que nos escribís 🔥 Sí, de una te paso la data completa de ${config.businessName}.`;
    }
    if (config.dialect === "espana") {
      return `¡Muy buenas! Un placer saludarte. Enseguida te paso los detalles completos de ${config.businessName}.`;
    }
    return `¡Hola! Qué gusto saludarte. Con todo gusto te comparto la información de ${config.businessName} enseguida.`;
  };

  // Interactive iPhone Chat Simulator State
  const [simChat, setSimChat] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string; hasBooking?: boolean }>
  >([
    {
      id: "1",
      role: "user",
      content: "¡Hola! Vi el reel de automatización, ¿me pasan info y precios?",
    },
    {
      id: "2",
      role: "assistant",
      content: "¡Qué hacés crack! Qué bueno que nos escribís 🔥 Sí, de una te paso la data completa de Settingfly.",
    },
    {
      id: "3",
      role: "assistant",
      content: "¿Actualmente ya tenés un negocio en marcha o estás por comenzar?",
    },
  ]);
  const [simInput, setSimInput] = useState("");
  const [simIsThinking, setSimIsThinking] = useState(false);
  const simChatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    simChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simChat, simIsThinking]);

  const handleResetSimChat = () => {
    setSimChat([
      {
        id: Date.now().toString() + "_1",
        role: "user",
        content: "¡Hola! Vi el reel de automatización, ¿me pasan info y precios?",
      },
      {
        id: Date.now().toString() + "_2",
        role: "assistant",
        content: getSimGreeting(),
      },
      {
        id: Date.now().toString() + "_3",
        role: "assistant",
        content: config.qualificationQ1 || "¿Actualmente ya tenés un negocio en marcha o estás por comenzar?",
      },
    ]);
  };

  const handleSendSimMessage = async (customText?: string) => {
    const textToSend = typeof customText === "string" ? customText : simInput;
    if (!textToSend.trim() || simIsThinking) return;

    const userText = textToSend.trim();
    setSimInput("");

    const newChat = [
      ...simChat,
      { id: Date.now().toString(), role: "user" as const, content: userText },
    ];
    setSimChat(newChat);
    setSimIsThinking(true);

    try {
      const res = await fetch("/api/setter/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          messages: newChat.map((m) => ({ role: m.role, content: m.content })),
          userMessage: userText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const replyLower = data.reply.toLowerCase();
        const hasBooking =
          (config.bookingUrl && data.reply.includes(config.bookingUrl)) ||
          replyLower.includes("calendly") ||
          replyLower.includes("agend") ||
          replyLower.includes("llamada") ||
          replyLower.includes("sesión");

        setSimChat((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            hasBooking,
          },
        ]);
      } else {
        setSimChat((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "¡Totalmente! En una sesión corta de 15 min vemos los detalles específicos. ¿Te paso el enlace?",
            hasBooking: true,
          },
        ]);
      }
    } catch {
      setSimChat((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "¡Genial! Justamente adaptamos la solución a lo que necesitás. ¿Qué día te queda más cómodo para una breve llamada?",
          hasBooking: true,
        },
      ]);
    } finally {
      setSimIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#14161b] text-slate-100 font-sans antialiased overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all border ${
            toastType === "success"
              ? "bg-[#1a1d24] text-[#d4ff00] border-[#d4ff00]/40 shadow-neon-lime"
              : "bg-[#1a1d24] text-rose-400 border-rose-500/40"
          }`}
        >
          {toastType === "success" ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Plan / Billing Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#1a1d24] border border-white/[0.1] rounded-3xl p-7 w-full max-w-3xl shadow-2xl relative">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.05]"
            >
              <XCircle className="size-6" />
            </button>

            <h3 className="text-lg font-heading font-bold text-white mb-1">Plan y Facturación</h3>
            <p className="text-xs text-slate-400 mb-6">
              El pago se procesa de forma segura. Tu plan se activa automáticamente al confirmarse el cobro.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  key: "starter",
                  name: "Starter",
                  price: 49,
                  current: (user?.plan || "free") === "starter",
                  features: ["1 cuenta de Instagram", "CRM con 200 leads activos", "Setter IA + simulador"],
                },
                {
                  key: "pro",
                  name: "Pro",
                  price: 99,
                  current: user?.plan === "pro",
                  features: ["Hasta 3 cuentas de Instagram", "Leads ilimitados + funnel", "Follow-ups + métricas"],
                },
                {
                  key: "agencia",
                  name: "Agencia",
                  price: 249,
                  current: user?.plan === "agencia",
                  features: ["Cuentas ilimitadas", "Perfiles separados por cliente", "Branding + onboarding 1:1"],
                },
              ].map((plan) => (
                <div
                  key={plan.key}
                  className={`rounded-2xl p-5 flex flex-col gap-3 border ${
                    plan.current
                      ? "border-[#d4ff00]/40 bg-[#d4ff00]/[0.06]"
                      : "border-white/[0.08] bg-[#14161b]/60"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading font-extrabold text-white">{plan.name}</span>
                    {plan.current ? (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30">
                        Plan actual
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-extrabold text-white">${plan.price}</span>
                    <span className="text-xs text-slate-500">USD/mes</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-400 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="size-3.5 mt-0.5 text-[#00f2fe] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.current ? (
                    <span className="inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs text-[#d4ff00] border border-[#d4ff00]/30">
                      <Check className="size-4" />
                      Plan activo
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={billingLoading !== null}
                      onClick={() => handleUpgrade(plan.key)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-shadow bg-[#d4ff00] text-[#14161b] hover:shadow-neon-lime disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {billingLoading === plan.key ? "Abriendo pago..." : "Elegir plan"}
                      <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-5 text-[11px] text-slate-500 font-mono text-center">
              Pago procesado por Lemon Squeezy (merchant of record). El plan se activa al confirmarse el pago.
            </p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#1a1d24] border border-white/[0.1] rounded-3xl p-7 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.05]"
            >
              <XCircle className="size-6" />
            </button>

            {/* Logo in Auth Modal */}
            <div className="flex items-center justify-center mb-5">
              <img
                src="/logo-settingfly.png"
                alt="Logotipo de Settingfly"
                className="h-14 w-auto max-w-[200px] object-contain drop-shadow-md"
              />
            </div>

            <h3 className="text-lg font-heading font-bold text-center text-white mb-1">
              {authMode === "login" ? "Bienvenido de Vuelta" : "Crea tu Cuenta"}
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              {authMode === "login"
                ? "Accede para gestionar tu Setter IA y sincronizar Instagram."
                : "Automatiza tus DMs y llamadas de ventas con IA en 2 minutos."}
            </p>

            <div className="flex bg-[#14161b] p-1 rounded-2xl mb-5 border border-white/[0.05]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === "login" ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime" : "text-slate-400 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMode === "register" ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime" : "text-slate-400 hover:text-white"
                }`}
              >
                Registrarme
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3.5">
              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nombre o Agencia</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Ej. Convexa Growth"
                    className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@tuagencia.com"
                  className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="mt-2 w-full py-3 rounded-2xl bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold text-xs uppercase tracking-wider shadow-neon-lime transition-all disabled:opacity-50"
              >
                {authLoading ? "Procesando..." : authMode === "login" ? "Ingresar a mi Consola" : "Crear mi Cuenta Gratis"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Cuentas (Estilo ZeroChats) */}
      {isAccountsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#171920] border border-white/[0.1] rounded-3xl shadow-2xl p-6 text-white overflow-hidden">
            {/* Botón cerrar */}
            <button
              onClick={() => {
                setIsAccountsModalOpen(false);
                setConnectError(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.05] transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Cabecera */}
            <h3 className="text-xl font-bold font-heading mb-1 text-slate-100">Tus cuentas</h3>
            <p className="text-xs text-slate-400 mb-6">Conecta o desconecta las cuentas que atiende la IA.</p>

            {/* Cuentas conectadas */}
            <div className="space-y-3 mb-6">
              {igAccounts.length > 0 ? (
                igAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#20242e] border border-white/[0.08]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <InstagramIcon className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>@{acc.username}</span>
                          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {acc.instagramId}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnectIgAccount(acc.id)}
                      className="size-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors"
                      title="Desconectar cuenta"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                  <InstagramIcon className="size-6 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs text-amber-300 font-medium">No tienes ninguna cuenta de Instagram conectada.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Conecta tu cuenta para que el Setter IA comience a responder.</p>
                </div>
              )}
            </div>

            {/* Conexión Automática / Manual */}
            <div className="border-t border-white/[0.08] pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <InstagramIcon className="size-3.5 text-pink-400" />
                <span>{igAccounts.length > 0 ? "Vincular otra cuenta" : "Vincular cuenta de Instagram"}</span>
              </h4>

              {connectError && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{connectError}</span>
                </div>
              )}

              {/* BOTÓN OFICIAL DE LOGIN CON FACEBOOK / META */}
              <a
                href="/api/auth/meta/connect"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0D65D9] hover:from-[#166fe5] hover:to-[#0b58be] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] mb-3"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Conectar con Facebook e Instagram (1 Clic)</span>
              </a>
              <p className="text-[11px] text-slate-400 text-center mb-4">
                Detecta tus cuentas profesionales y activa los webhooks automáticamente sin tocar código.
              </p>

              {/* Desplegable para Conexión Manual (Avanzado) */}
              <div className="pt-2 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setShowManualConnect(!showManualConnect)}
                  className="w-full py-1.5 text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{showManualConnect ? "Ocultar conexión manual" : "⚙️ ¿Prefieres ingresar Token e ID manualmente?"}</span>
                </button>

                {showManualConnect && (
                  <form onSubmit={handleConnectIgAccount} className="space-y-3 mt-3 pt-3 border-t border-white/[0.06] animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Nombre de usuario (@)</label>
                      <input
                        type="text"
                        placeholder="@minegocio_oficial"
                        value={newIgUsername}
                        onChange={(e) => setNewIgUsername(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14161b] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff00] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Instagram Business Account ID</label>
                      <input
                        type="text"
                        placeholder="Ej: 17841405392817263"
                        value={newIgId}
                        onChange={(e) => setNewIgId(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14161b] border border-white/[0.1] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#d4ff00] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Page Access Token de Meta</label>
                      <input
                        type="password"
                        placeholder="EAAG..."
                        value={newIgToken}
                        onChange={(e) => setNewIgToken(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14161b] border border-white/[0.1] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#d4ff00] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={connectLoading}
                      className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {connectLoading ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <span>Guardar credenciales manuales</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Botón WhatsApp (Exacto ZeroChats) */}
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/15 border border-blue-500/25 text-blue-300 text-xs font-semibold flex items-center justify-between cursor-not-allowed opacity-75"
              >
                <div className="flex items-center gap-2">
                  <WhatsAppIcon className="size-4 text-emerald-400" />
                  <span>Conectar WhatsApp</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Próximamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR - ELECTRIC DARK CRAFT */}
      <aside className="w-64 bg-[#171920]/95 backdrop-blur-2xl border-r border-white/[0.08] z-50 flex flex-col justify-between p-5 shrink-0 shadow-lg">
        <div className="flex flex-col gap-6">
          {/* Logo Settingfly (wordmark) */}
          <div className="flex items-center justify-start px-1 py-1">
            <img
              src="/logo-settingfly-wordmark.png"
              alt="Settingfly"
              className="w-full max-w-[210px] h-auto object-contain transition-transform hover:scale-105 drop-shadow-md"
            />
          </div>

          {/* Quick Status Pill */}
          <div className="p-3 bg-[#1e222b] rounded-2xl border border-[#00f2fe]/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00f2fe]"></span>
              </span>
              <span className="text-xs font-semibold text-slate-200">{config.setterName} Activo</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40">
              EN LÍNEA
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("wizard")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-xs text-left ${
                activeTab === "wizard"
                  ? "bg-[#202530] text-white font-semibold border border-[#d4ff00]/40 shadow-[0_0_15px_-3px_rgba(212,255,0,0.15)] ring-1 ring-[#d4ff00]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Bot className={`size-4 ${activeTab === "wizard" ? "text-[#d4ff00]" : "text-slate-400"}`} />
              <span>Asistente Setter (8 Pasos)</span>
            </button>

            <button
              onClick={() => setActiveTab("campaigns")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-xs text-left ${
                activeTab === "campaigns"
                  ? "bg-[#202530] text-white font-semibold border border-[#d4ff00]/40 shadow-[0_0_15px_-3px_rgba(212,255,0,0.15)] ring-1 ring-[#d4ff00]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <PlayCircle className={`size-4 ${activeTab === "campaigns" ? "text-[#d4ff00]" : "text-slate-400"}`} />
              <span>Campañas Reels & Triggers</span>
            </button>

            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-xs text-left ${
                activeTab === "metrics"
                  ? "bg-[#202530] text-white font-semibold border border-[#d4ff00]/40 shadow-[0_0_15px_-3px_rgba(212,255,0,0.15)] ring-1 ring-[#d4ff00]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <BarChart3 className={`size-4 ${activeTab === "metrics" ? "text-[#d4ff00]" : "text-slate-400"}`} />
              <span>Panel de Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-xs text-left ${
                activeTab === "inbox"
                  ? "bg-[#202530] text-white font-semibold border border-[#d4ff00]/40 shadow-[0_0_15px_-3px_rgba(212,255,0,0.15)] ring-1 ring-[#d4ff00]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <MessageSquare className={`size-4 ${activeTab === "inbox" ? "text-[#d4ff00]" : "text-slate-400"}`} />
              <span>Bandeja CRM (Inbox)</span>
            </button>

            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-xs text-left ${
                activeTab === "sandbox"
                  ? "bg-[#202530] text-white font-semibold border border-[#d4ff00]/40 shadow-[0_0_15px_-3px_rgba(212,255,0,0.15)] ring-1 ring-[#d4ff00]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <FlaskConical className={`size-4 ${activeTab === "sandbox" ? "text-[#d4ff00]" : "text-slate-400"}`} />
              <span>Simulador Sandbox</span>
            </button>
          </nav>
        </div>

        {/* Plan Pro Scale Card */}
        <div className="p-3.5 bg-[#1e222b] rounded-2xl border border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#d4ff00]" />
              Plan Pro Scale
            </span>
            <span className="text-[#d4ff00] text-[11px] font-mono font-bold">78%</span>
          </div>
          <div className="w-full bg-[#14161b] rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#d4ff00] via-[#00f2fe] to-[#ff7a00] h-1.5 rounded-full w-[78%]"></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>7,800 / 10,000 DMs</span>
            <span className="text-emerald-400 font-bold">En Cuota</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#171920]/90 backdrop-blur-xl border-b border-white/[0.08] z-40 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              title="Ver planes y facturación"
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#20242e] border border-white/[0.08] text-slate-200 hover:border-[#d4ff00]/40 transition-colors"
            >
              <span className="text-xs font-semibold">{config.businessName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 font-mono">
                {(user?.plan || "free").toUpperCase()}
              </span>
            </button>
            {/* Botón Gestión de Cuentas (ZeroChats style) */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                  triggerToast("Inicia sesión para gestionar tus cuentas de Instagram.", "error");
                  return;
                }
                setIsAccountsModalOpen(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                igAccounts.length > 0
                  ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30 text-pink-200 hover:border-pink-500/50 shadow-sm"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/50"
              }`}
            >
              <InstagramIcon className="size-3.5" />
              {igAccounts.length > 0 ? (
                <>
                  <span className="font-semibold">@{igAccounts[0].username}</span>
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                </>
              ) : (
                <>
                  <span>Conectar cuenta</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">0</span>
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#20242e] border border-white/[0.08]">
                  <div className="size-6 rounded-full bg-gradient-to-tr from-[#d4ff00] to-[#00f2fe] flex items-center justify-center text-[#14161b] text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{user.name || user.email.split("@")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-full bg-[#20242e] hover:bg-[#272c38] text-slate-400 hover:text-rose-400 transition-colors border border-white/[0.08]"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold shadow-neon-lime transition-all text-xs flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <LogIn className="size-3.5" />
                  <span>Iniciar Sesión</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 rounded-full bg-[#20242e] hover:bg-[#272c38] text-slate-300 hover:text-white transition-all text-xs font-semibold border border-white/[0.08]"
                >
                  Modal
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* VIEW 1: ASISTENTE SETTER (WIZARD 8 PASOS) */}
          {activeTab === "wizard" && (
            <div className="max-w-[1580px] mx-auto flex flex-col gap-6">
              {/* Header Ribbon */}
              <div className="bg-[#1a1d24] rounded-3xl p-6 border border-white/[0.08] shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#d4ff00]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4ff00] to-[#00f2fe] text-[#14161b] flex items-center justify-center shadow-neon-lime">
                    <Sparkles className="size-6 text-[#14161b]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-heading font-bold text-white tracking-tight">
                        Configura tu Setter IA en 2 clics
                      </h1>
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00f2fe]/10 text-[#00f2fe] font-mono font-bold text-xs border border-[#00f2fe]/40 shadow-neon-cyan">
                        <span className="w-2 h-2 rounded-full bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]"></span>
                        MySQL Conectado
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Respuestas fluidas, naturales y sin tecnicismos pesados. Listo para captar leads hoy.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-full bg-[#20242e] hover:bg-[#272c38] text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08]"
                  >
                    <span>Reiniciar Pasos</span>
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-full bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] shadow-neon-lime transition-all text-xs font-heading font-extrabold flex items-center gap-2 tracking-wide uppercase disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                </div>
              </div>

              {/* Stepper Pills */}
              <div className="w-full bg-[#1a1d24] p-2.5 rounded-3xl border border-white/[0.08] shadow-lg overflow-x-auto">
                <div className="flex items-center min-w-[920px] gap-2">
                  {[
                    { num: 1, label: "Perfil Negocio" },
                    { num: 2, label: "Personalidad" },
                    { num: 3, label: "Oferta & Gancho" },
                    { num: 4, label: "Cualificación" },
                    { num: 5, label: "FAQ & Dudas" },
                    { num: 6, label: "Triggers" },
                    { num: 7, label: "Líneas Rojas" },
                    { num: 8, label: "Horarios" },
                  ].map((step) => (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setCurrentStep(step.num)}
                      className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all text-left ${
                        currentStep === step.num
                          ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime"
                          : "bg-[#20242e] text-slate-400 hover:bg-[#272c38] hover:text-slate-200 border border-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                          currentStep === step.num ? "bg-[#14161b] text-[#d4ff00]" : "bg-[#14161b] text-slate-400"
                        }`}
                      >
                        {step.num}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Layout: Form (Left) + iPhone Simulator (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Form Column */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                  {/* STEP 1: Perfil Negocio */}
                  {currentStep === 1 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#d4ff00]/15 text-[#d4ff00] flex items-center justify-center border border-[#d4ff00]/30 shadow-neon-lime font-bold">
                            1
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 1: Perfil de tu Negocio
                            </h2>
                            <p className="text-xs text-slate-400">
                              Cuéntale al setter quién eres para que hable con total naturalidad.
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/40">
                          PASO INICIAL
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Nombre de tu Marca o Negocio</label>
                          <input
                            type="text"
                            value={config.businessName}
                            onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                            className="w-full bg-[#14161b] text-slate-100 text-sm font-medium px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-[#d4ff00] focus:outline-none transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Rango de Precios Oferta Principal</label>
                          <input
                            type="text"
                            value={config.priceRange}
                            onChange={(e) => setConfig({ ...config, priceRange: e.target.value })}
                            className="w-full bg-[#14161b] text-slate-100 text-sm font-medium px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-[#00f2fe] focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300">¿A quién va dirigido? (Cliente Ideal)</label>
                        <textarea
                          rows={2}
                          value={config.targetAudience}
                          onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
                          className="w-full bg-[#14161b] text-slate-100 text-sm font-medium p-3.5 rounded-2xl border border-white/[0.08] focus:border-[#d4ff00] focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Personalidad */}
                  {currentStep === 2 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/30 shadow-neon-cyan font-bold">
                            2
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 2: Personalidad y Dialecto
                            </h2>
                            <p className="text-xs text-slate-400">
                              Define cómo suena tu setter para que se sienta 100% como un miembro del equipo.
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40">
                          TONO & VOZ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Nombre del Asistente Setter</label>
                          <input
                            type="text"
                            value={config.setterName}
                            onChange={(e) => setConfig({ ...config, setterName: e.target.value })}
                            className="w-full bg-[#14161b] text-slate-100 text-sm font-medium px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-[#d4ff00] focus:outline-none transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Dialecto Regional</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "rioplatense", label: "Rioplatense (AR/UY)" },
                              { id: "neutro", label: "Neutro Latam" },
                              { id: "espana", label: "España (ES)" },
                            ].map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => setConfig({ ...config, dialect: d.id })}
                                className={`py-2 px-2 rounded-2xl text-[11px] font-bold transition-all truncate ${
                                  config.dialect === d.id
                                    ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime"
                                    : "bg-[#14161b] text-slate-300 border border-white/[0.08] hover:bg-[#20242e]"
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-300">Tono de Voz</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "cercano", label: "Cercano & Casual" },
                            { id: "profesional", label: "Profesional & Consultivo" },
                            { id: "urgente", label: "Directo & Agresivo" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setConfig({ ...config, tone: t.id })}
                              className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border ${
                                config.tone === t.id
                                  ? "bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe] shadow-neon-cyan"
                                  : "bg-[#14161b] text-slate-300 border-white/[0.08] hover:bg-[#20242e]"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Oferta & Gancho */}
                  {currentStep === 3 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center border border-[#ff7a00]/30 shadow-neon-orange font-bold">
                            3
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 3: Oferta Principal & Gancho
                            </h2>
                            <p className="text-xs text-slate-400">
                              ¿Qué ofreces y cuál es la llamada a la acción para agendar?
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300">Descripción Simple de tu Solución</label>
                        <textarea
                          rows={2}
                          value={config.offerDescription}
                          onChange={(e) => setConfig({ ...config, offerDescription: e.target.value })}
                          className="w-full bg-[#14161b] text-slate-100 text-sm font-medium p-3.5 rounded-2xl border border-white/[0.08] focus:border-[#d4ff00] focus:outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Gancho / CTA de Cierre</label>
                          <input
                            type="text"
                            value={config.ctaHook}
                            onChange={(e) => setConfig({ ...config, ctaHook: e.target.value })}
                            className="w-full bg-[#14161b] text-slate-100 text-sm font-medium px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-[#d4ff00] focus:outline-none transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">URL de Calendly o WhatsApp</label>
                          <input
                            type="text"
                            value={config.bookingUrl}
                            onChange={(e) => setConfig({ ...config, bookingUrl: e.target.value })}
                            className="w-full bg-[#14161b] text-slate-100 text-sm font-medium px-4 py-2.5 rounded-2xl border border-white/[0.08] focus:border-[#00f2fe] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Cualificación */}
                  {currentStep === 4 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/30 shadow-neon-cyan font-bold">
                            4
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 4: Cualificación en 3 Preguntas
                            </h2>
                            <p className="text-xs text-slate-400">
                              Filtra prospectos calificados antes de enviar el enlace de tu calendario.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.08] flex flex-col gap-2">
                          <span className="text-xs font-bold text-[#d4ff00] font-mono">Pregunta 1: Situación Actual</span>
                          <input
                            type="text"
                            value={config.qualificationQ1}
                            onChange={(e) => setConfig({ ...config, qualificationQ1: e.target.value })}
                            className="w-full bg-[#1e222b] px-3.5 py-2.5 rounded-xl border border-white/[0.08] text-slate-100 text-xs font-medium focus:border-[#d4ff00] focus:outline-none transition-all"
                          />
                        </div>

                        <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.08] flex flex-col gap-2">
                          <span className="text-xs font-bold text-[#00f2fe] font-mono">Pregunta 2: Volumen de Consultas</span>
                          <input
                            type="text"
                            value={config.qualificationQ2}
                            onChange={(e) => setConfig({ ...config, qualificationQ2: e.target.value })}
                            className="w-full bg-[#1e222b] px-3.5 py-2.5 rounded-xl border border-white/[0.08] text-slate-100 text-xs font-medium focus:border-[#00f2fe] focus:outline-none transition-all"
                          />
                        </div>

                        <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.08] flex flex-col gap-2">
                          <span className="text-xs font-bold text-[#ff7a00] font-mono">Pregunta 3: Filtro de Presupuesto</span>
                          <input
                            type="text"
                            value={config.qualificationQ3}
                            onChange={(e) => setConfig({ ...config, qualificationQ3: e.target.value })}
                            className="w-full bg-[#1e222b] px-3.5 py-2.5 rounded-xl border border-white/[0.08] text-slate-100 text-xs font-medium focus:border-[#ff7a00] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: FAQ & Objeciones */}
                  {currentStep === 5 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center border border-[#ff7a00]/30 shadow-neon-orange font-bold">
                            5
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 5: Dudas Frecuentes y Objeciones
                            </h2>
                            <p className="text-xs text-slate-400">
                              Respuestas rápidas para no perder ventas ante las preguntas típicas.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.08] flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-200">Objeción: "¿Cuánto cuesta?"</span>
                          <textarea
                            rows={2}
                            value={config.faqPrice}
                            onChange={(e) => setConfig({ ...config, faqPrice: e.target.value })}
                            className="w-full bg-[#1e222b] p-3 rounded-xl border border-white/[0.08] text-slate-100 text-xs font-medium focus:border-[#d4ff00] focus:outline-none transition-all resize-none"
                          />
                        </div>

                        <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.08] flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-200">Objeción: "No tengo tiempo ahora"</span>
                          <textarea
                            rows={2}
                            value={config.faqTime}
                            onChange={(e) => setConfig({ ...config, faqTime: e.target.value })}
                            className="w-full bg-[#1e222b] p-3 rounded-xl border border-white/[0.08] text-slate-100 text-xs font-medium focus:border-[#ff7a00] focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Triggers */}
                  {currentStep === 6 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/30 shadow-neon-cyan font-bold">
                            6
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 6: Activadores y Palabras Clave
                            </h2>
                            <p className="text-xs text-slate-400">
                              Define qué palabras clave e interacciones inician al setter.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-300">Palabras Clave de Activación</label>
                        <div className="flex flex-wrap gap-2 items-center bg-[#14161b] p-3.5 rounded-2xl border border-white/[0.08]">
                          {config.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 bg-[#202530] text-[#d4ff00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#d4ff00]/40"
                            >
                              {kw}
                              <button
                                type="button"
                                onClick={() =>
                                  setConfig({
                                    ...config,
                                    keywords: config.keywords.filter((_, idx) => idx !== i),
                                  })
                                }
                                className="text-slate-400 hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newKw = prompt("Ingresa nueva palabra clave (ej. ASESORIA):");
                              if (newKw && newKw.trim()) {
                                setConfig({
                                  ...config,
                                  keywords: [...config.keywords, newKw.trim().toUpperCase()],
                                });
                              }
                            }}
                            className="text-[#00f2fe] text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 hover:bg-[#00f2fe]/20"
                          >
                            + Añadir palabra
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3.5 bg-[#14161b] rounded-2xl border border-white/[0.08]">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">Comentarios en Reels</span>
                            <span className="text-[11px] text-slate-400">Responde en público y envía DM al instante</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.triggerComments}
                            onChange={(e) => setConfig({ ...config, triggerComments: e.target.checked })}
                            className="size-4 accent-[#00f2fe] rounded cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-[#14161b] rounded-2xl border border-white/[0.08]">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">DMs Nuevos Directos</span>
                            <span className="text-[11px] text-slate-400">Inicia la cualificación cuando te escriben</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.triggerDms}
                            onChange={(e) => setConfig({ ...config, triggerDms: e.target.checked })}
                            className="size-4 accent-[#00f2fe] rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 7: Líneas Rojas */}
                  {currentStep === 7 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center border border-[#ff7a00]/30 shadow-neon-orange font-bold">
                            7
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 7: Seguridad y Líneas Rojas
                            </h2>
                            <p className="text-xs text-slate-400">Límites claros para cuidar la reputación de tu marca.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3.5 bg-[#14161b] rounded-2xl border border-white/[0.08]">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">No cerrar precio final por DM</span>
                            <span className="text-[11px] text-slate-400">Invita a la sesión de diagnóstico para presupuesto exacto</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.noClosedPrices}
                            onChange={(e) => setConfig({ ...config, noClosedPrices: e.target.checked })}
                            className="size-4 accent-[#d4ff00] rounded cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-[#14161b] rounded-2xl border border-white/[0.08]">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">Descalificación amable si no hay presupuesto</span>
                            <span className="text-[11px] text-slate-400">Regala un recurso gratuito y cuida el vínculo</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={config.disqualifyPolite}
                            onChange={(e) => setConfig({ ...config, disqualifyPolite: e.target.checked })}
                            className="size-4 accent-[#ff7a00] rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 8: Horarios & Takeover */}
                  {currentStep === 8 && (
                    <div className="bg-[#1a1d24] p-7 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#d4ff00]/15 text-[#d4ff00] flex items-center justify-center border border-[#d4ff00]/30 shadow-neon-lime font-bold">
                            8
                          </div>
                          <div>
                            <h2 className="text-[17px] font-heading font-bold text-white tracking-tight">
                              Paso 8: Horarios & Pase a Humanos
                            </h2>
                            <p className="text-xs text-slate-400">Tú tienes el control total de cuándo responde el setter.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Horario de Actividad</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setConfig({ ...config, scheduleMode: "TwentyFourSeven" })}
                              className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                config.scheduleMode === "TwentyFourSeven"
                                  ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime"
                                  : "bg-[#14161b] text-slate-300 border border-white/[0.08]"
                              }`}
                            >
                              24/7 Siempre
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfig({ ...config, scheduleMode: "FueraHorario" })}
                              className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                config.scheduleMode === "FueraHorario"
                                  ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime"
                                  : "bg-[#14161b] text-slate-300 border border-white/[0.08]"
                              }`}
                            >
                              Fuera de oficina
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Cadencia Humana (Anti-Spam)</label>
                          <div className="p-2.5 bg-[#14161b] rounded-2xl border border-white/[0.08] text-xs text-slate-300 font-medium flex items-center gap-2">
                            <Clock className="size-4 text-[#00f2fe]" />
                            <span>Delay aleatorio: 15 a 30 segundos</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-[#14161b] rounded-2xl border border-white/[0.08]">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Pase automático si piden una persona</span>
                          <span className="text-[11px] text-slate-400">Apaga la IA en esa conversación y crea alerta inmediata</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.takeoverOnRequest}
                          onChange={(e) => setConfig({ ...config, takeoverOnRequest: e.target.checked })}
                          className="size-4 accent-[#00f2fe] rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wizard Footer Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentStep === 1}
                      onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
                      className={`px-5 py-2.5 rounded-full bg-[#20242e] text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-white/[0.08] ${
                        currentStep === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#272c38] hover:text-white"
                      }`}
                    >
                      <ChevronLeft className="size-4" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">Paso {currentStep} de 8</span>

                      {currentStep < 8 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep((p) => Math.min(8, p + 1))}
                          className="px-7 py-3 rounded-full bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold text-xs shadow-neon-lime transition-all flex items-center gap-2 uppercase tracking-wide"
                        >
                          <span>Siguiente Paso</span>
                          <ChevronRight className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSaveConfig}
                          disabled={isSaving}
                          className="px-7 py-3 rounded-full bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold text-xs shadow-neon-lime transition-all flex items-center gap-2 uppercase tracking-wide"
                        >
                          <span>{isSaving ? "Guardando..." : "Guardar y Activar"}</span>
                          <Check className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* iPhone Simulator Column */}
                <div className="lg:col-span-5 xl:col-span-4 sticky top-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-heading font-semibold tracking-tight text-slate-200">
                        Simulador iPhone en Vivo
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#d4ff00] bg-[#d4ff00]/15 px-3 py-1 rounded-full border border-[#d4ff00]/30 shadow-neon-lime capitalize">
                      Dialecto: {config.dialect}
                    </span>
                  </div>

                  {/* Realistic Modern iPhone Frame */}
                  <div className="relative mx-auto w-full max-w-[340px] bg-[#0c0d12] rounded-[3rem] p-3 shadow-phone-electric border-4 border-[#222634] ring-1 ring-[#00f2fe]/20">
                    {/* Dynamic Island */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1b1c24] mr-2"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0f]"></div>
                    </div>

                    {/* Phone Screen */}
                    <div className="bg-[#12141a] rounded-[2.5rem] overflow-hidden pt-6 pb-4 flex flex-col h-[580px] shadow-inner border border-white/[0.05]">
                      {/* IG Chat Header */}
                      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#161820]/95 backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                          <ChevronLeft className="size-4 text-slate-400" />
                          <div className="relative">
                            <div className="size-8 rounded-full bg-gradient-to-tr from-[#d4ff00] to-[#00f2fe] flex items-center justify-center text-[#14161b] font-bold text-xs shadow-sm">
                              {config.setterName ? config.setterName[0] : "I"}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00f2fe] ring-2 ring-[#161820]"></span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                                {config.setterName} • {config.businessName}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#00f2fe] font-mono">En línea ahora</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <button
                            type="button"
                            onClick={handleResetSimChat}
                            title="Reiniciar chat de prueba"
                            className="p-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>
                          <Phone className="size-3.5 opacity-60" />
                          <Video className="size-3.5 opacity-60" />
                        </div>
                      </div>

                      {/* Chat Messages Feed (Interactivo 100%) */}
                      <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3 bg-[#0f1116]">
                        <div className="text-center my-0.5">
                          <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
                            Hoy • Simulación de Lead en Vivo
                          </span>
                        </div>

                        {simChat.map((msg) =>
                          msg.role === "user" ? (
                            <div key={msg.id} className="flex justify-end">
                              <div className="bg-[#242936] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] text-xs font-medium border border-white/10 shadow-sm leading-relaxed">
                                {msg.content}
                              </div>
                            </div>
                          ) : (
                            <div key={msg.id} className="flex items-start gap-2">
                              <div className="size-5 rounded-full bg-[#d4ff00] text-[#14161b] flex items-center justify-center font-bold text-[9px] shrink-0 mt-1 shadow-sm">
                                {config.setterName ? config.setterName[0] : "A"}
                              </div>
                              <div className="flex flex-col gap-2 max-w-[85%]">
                                <div className="bg-gradient-to-r from-[#00f2fe]/15 to-[#00f2fe]/5 border border-[#00f2fe]/50 text-[#e6faff] px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-xs font-medium shadow-neon-cyan leading-relaxed">
                                  {msg.content}
                                </div>
                                {msg.hasBooking && (
                                  <div className="bg-[#181c25] p-3 rounded-2xl border border-[#d4ff00]/40 shadow-neon-lime flex flex-col gap-2 mt-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-xl bg-[#d4ff00]/20 text-[#d4ff00] flex items-center justify-center border border-[#d4ff00]/40">
                                        <Calendar className="size-4" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-white truncate">{config.ctaHook}</span>
                                        <span className="text-[10px] text-[#00f2fe] font-mono">Espacios disponibles</span>
                                      </div>
                                    </div>
                                    <a
                                      href={config.bookingUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full py-2 rounded-xl bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold text-[11px] uppercase tracking-wider text-center transition-colors shadow-sm"
                                    >
                                      Agendar Cita
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {/* Indicador de escribiendo (DeepSeek pensando) */}
                        {simIsThinking && (
                          <div className="flex items-start gap-2 animate-fadeIn">
                            <div className="size-5 rounded-full bg-[#d4ff00] text-[#14161b] flex items-center justify-center font-bold text-[9px] shrink-0 mt-1">
                              {config.setterName ? config.setterName[0] : "A"}
                            </div>
                            <div className="bg-[#1e222b] px-3.5 py-2.5 rounded-2xl rounded-tl-xs border border-white/10 flex items-center gap-1.5 shadow-sm">
                              <span className="size-1.5 rounded-full bg-[#00f2fe] animate-bounce"></span>
                              <span className="size-1.5 rounded-full bg-[#00f2fe] animate-bounce [animation-delay:0.2s]"></span>
                              <span className="size-1.5 rounded-full bg-[#00f2fe] animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                          </div>
                        )}

                        <div ref={simChatEndRef} />
                      </div>

                      {/* Simulator Bottom Input & Quick Test Buttons */}
                      <div className="px-3 pt-2 flex flex-col gap-2">
                        {/* Quick Test Objection Pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleSendSimMessage("¿Cuánto cuesta el servicio?")}
                            disabled={simIsThinking}
                            className="px-2.5 py-1 rounded-full bg-[#1e222b] hover:bg-[#252b38] text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
                          >
                            ¿Cuánto cuesta?
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendSimMessage("Mandame la info por acá porfa")}
                            disabled={simIsThinking}
                            className="px-2.5 py-1 rounded-full bg-[#1e222b] hover:bg-[#252b38] text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
                          >
                            Mandame info
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendSimMessage("No tengo tiempo ahora mismo")}
                            disabled={simIsThinking}
                            className="px-2.5 py-1 rounded-full bg-[#1e222b] hover:bg-[#252b38] text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
                          >
                            No tengo tiempo
                          </button>
                        </div>

                        {/* Interactive Input Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendSimMessage();
                          }}
                          className="flex items-center gap-2 bg-[#1b1f2a] px-3 py-2 rounded-full border border-white/[0.08] focus-within:border-[#00f2fe]/60 transition-colors"
                        >
                          <input
                            type="text"
                            placeholder="Escribe un mensaje de prueba..."
                            value={simInput}
                            onChange={(e) => setSimInput(e.target.value)}
                            disabled={simIsThinking}
                            className="bg-transparent text-white text-xs flex-1 outline-none placeholder:text-slate-500 disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={!simInput.trim() || simIsThinking}
                            className="p-1 rounded-full text-[#00f2fe] hover:bg-[#00f2fe]/10 disabled:opacity-30 transition-colors"
                          >
                            {simIsThinking ? (
                              <RefreshCw className="size-3.5 animate-spin text-[#00f2fe]" />
                            ) : (
                              <Send className="size-3.5" />
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CAMPAÑAS REELS & TRIGGERS */}
          {activeTab === "campaigns" && (
            <div className="max-w-[1580px] mx-auto flex flex-col gap-6">
              {/* Campaign Header */}
              <div className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-gradient-to-r from-[#1a1d24] via-[#20242e] to-[#1a1d24] p-6 rounded-3xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                <div className="flex flex-col relative z-10">
                  <div className="flex items-center gap-2 text-[#00f2fe] text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_8px_rgba(0,242,254,0.9)] animate-ping"></span>
                    <span>Motor de Automatización Meta Reels</span>
                  </div>
                  <h1 className="text-2xl font-heading font-extrabold text-white mt-1 tracking-tight">
                    Campañas Reels & Triggers
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Monitorea comentarios con keywords en Instagram, responde en público y envía DM al instante.
                  </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => triggerToast("Conecta tu cuenta de Instagram en Ajustes para sincronizar reels.")}
                    className="flex items-center gap-2 bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] px-6 py-2.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-neon-lime transition-all"
                  >
                    <Plus className="size-4" />
                    <span>Nueva Campaña Reel</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-[#20242e] p-5 border border-white/10 flex flex-col justify-between shadow-md">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Campañas Activas</span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-heading font-extrabold text-white">4</span>
                    <span className="text-[11px] font-mono font-bold text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-full border border-[#00f2fe]/30">
                      100% On
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl bg-[#20242e] p-5 border border-white/10 flex flex-col justify-between shadow-md">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Comentarios Hoy</span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-heading font-extrabold text-[#d4ff00]">1,420</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">+34% vs ayer</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-[#20242e] p-5 border border-white/10 flex flex-col justify-between shadow-md">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Tasa de Disparo</span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-heading font-extrabold text-[#ff7a00]">99.1%</span>
                    <span className="text-[11px] font-mono text-[#ff7a00] bg-[#ff7a00]/15 px-2 py-0.5 rounded-full">
                      Óptimo
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl bg-[#20242e] p-5 border border-white/10 flex flex-col justify-between shadow-md">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Seguridad Antiban</span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-heading font-extrabold text-[#00f2fe]">0</span>
                    <span className="text-xs text-slate-300">Bloqueos</span>
                  </div>
                </div>
              </div>

              {/* Sample Reel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    id: "reel-1",
                    title: "Reel: 3 Errores al Delegar Ventas",
                    views: "42.5K",
                    comments: 312,
                    keyword: "CLASE",
                    status: "Activa",
                  },
                  {
                    id: "reel-2",
                    title: "Reel: Cómo Agendamos 20 Llamadas con IA",
                    views: "89.1K",
                    comments: 840,
                    keyword: "SETTER",
                    status: "Activa",
                  },
                  {
                    id: "reel-3",
                    title: "Reel: Auditoría en Vivo de un Embudo B2B",
                    views: "18.2K",
                    comments: 168,
                    keyword: "AUDITORIA",
                    status: "Activa",
                  },
                ].map((r) => (
                  <div
                    key={r.id}
                    className="rounded-3xl bg-[#20242e] p-5 border border-white/10 hover:border-[#d4ff00]/40 transition-all shadow-md flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30">
                          KEYWORD: {r.keyword}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          {r.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white font-heading">{r.title}</h3>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-mono">
                        <span>👁️ {r.views} vistas</span>
                        <span>💬 {r.comments} triggers</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#14161b] rounded-2xl border border-white/[0.05] text-[11px] text-slate-300">
                      <span className="text-[#00f2fe] font-mono block mb-1">Respuesta pública rotativa:</span>
                      "¡Te acabo de enviar todos los accesos por DM! Revisá tus mensajes 🚀"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: PANEL DE MÉTRICAS */}
          {activeTab === "metrics" && (
            <div className="max-w-[1580px] mx-auto flex flex-col gap-6">
              <div className="bg-[#1a1d24] rounded-3xl p-6 border border-white/[0.08] shadow-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">Panel de Métricas & Embudo</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Rendimiento en tiempo real de tu setter autónomo en Instagram.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#20242e] px-4 py-2 rounded-full border border-white/[0.08] text-xs font-mono text-slate-300">
                  <Clock className="size-3.5 text-[#d4ff00]" />
                  <span>Últimos 30 días</span>
                </div>
              </div>

              {/* Main KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-[#20242e] p-5 rounded-3xl border border-white/10 shadow-md">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">DMs Procesados</span>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-extrabold text-white">3,248</span>
                    <span className="text-xs font-bold text-emerald-400">+28%</span>
                  </div>
                </div>

                <div className="bg-[#20242e] p-5 rounded-3xl border border-white/10 shadow-md">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Leads Cualificados (BANT)</span>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-extrabold text-[#00f2fe]">892</span>
                    <span className="text-xs font-mono text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-full">27.4%</span>
                  </div>
                </div>

                <div className="bg-[#20242e] p-5 rounded-3xl border border-white/10 shadow-md">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Llamadas Agendadas</span>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-extrabold text-[#d4ff00]">142</span>
                    <span className="text-xs font-mono text-[#d4ff00] bg-[#d4ff00]/15 px-2 py-0.5 rounded-full font-bold">15.9% conv</span>
                  </div>
                </div>

                <div className="bg-[#20242e] p-5 rounded-3xl border border-white/10 shadow-md">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Pipeline Estimado</span>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-extrabold text-[#ff7a00]">$71,000</span>
                    <span className="text-xs text-slate-400 font-mono">USD</span>
                  </div>
                </div>
              </div>

              {/* Funnel Visual */}
              <div className="bg-[#1a1d24] p-6 rounded-3xl border border-white/[0.08] flex flex-col gap-4">
                <h3 className="text-sm font-heading font-bold text-white">Embudo de Conversión Instagram $\rightarrow$ Calendly</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">1. Comentarios</span>
                    <span className="text-xl font-bold text-white font-heading mt-1 block">4,810</span>
                  </div>
                  <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">2. DMs Abiertos</span>
                    <span className="text-xl font-bold text-[#00f2fe] font-heading mt-1 block">3,248</span>
                  </div>
                  <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">3. Cualificados</span>
                    <span className="text-xl font-bold text-[#d4ff00] font-heading mt-1 block">892</span>
                  </div>
                  <div className="p-4 bg-[#14161b] rounded-2xl border border-white/[0.05] text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">4. Agendados</span>
                    <span className="text-xl font-bold text-emerald-400 font-heading mt-1 block">142</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: BANDEJA CRM (INBOX) */}
          {activeTab === "inbox" && (
            <div className="max-w-[1580px] mx-auto h-[calc(100vh-140px)] flex gap-4">
              {/* Conversations List */}
              <div className="w-80 bg-[#1a1d24] rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden shrink-0">
                <div className="p-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 bg-[#14161b] px-3 py-2 rounded-2xl border border-white/[0.05]">
                    <Search className="size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por @usuario..."
                      className="bg-transparent text-xs text-white outline-none flex-1 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
                  {[
                    {
                      user: "@nacho_growth",
                      msg: "Dale, pásame el enlace de la llamada",
                      time: "2m",
                      status: "ready_for_call",
                      ai: true,
                    },
                    {
                      user: "@martin_agency",
                      msg: "Facturo $4k/mes con 3 clientes",
                      time: "14m",
                      status: "qualifying",
                      ai: true,
                    },
                    {
                      user: "@laura_fitness",
                      msg: "¿Puedo hablar con alguien del equipo?",
                      time: "1h",
                      status: "human_takeover",
                      ai: false,
                    },
                    {
                      user: "@fede_ecommerce",
                      msg: "¡Ya agendé para el jueves a las 16hs!",
                      time: "3h",
                      status: "booked",
                      ai: true,
                    },
                  ].map((conv, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        i === 0
                          ? "bg-[#202530] border-[#d4ff00]/40 shadow-sm"
                          : "bg-[#14161b]/60 hover:bg-[#14161b] border-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white font-mono">{conv.user}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{conv.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mb-2">{conv.msg}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            conv.status === "ready_for_call"
                              ? "bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/30"
                              : conv.status === "booked"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : conv.status === "human_takeover"
                              ? "bg-[#ff7a00]/15 text-[#ff7a00] border-[#ff7a00]/30"
                              : "bg-slate-700/30 text-slate-300 border-slate-600/30"
                          }`}
                        >
                          {conv.status === "ready_for_call"
                            ? "Cualificado"
                            : conv.status === "booked"
                            ? "Agendado"
                            : conv.status === "human_takeover"
                            ? "Humano"
                            : "Cualificando"}
                        </span>
                        <span className="text-[10px] font-mono text-[#d4ff00] font-bold">
                          {conv.ai ? "IA ON" : "IA OFF"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 bg-[#1a1d24] rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#171920]">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-2xl bg-[#20242e] border border-white/10 flex items-center justify-center font-bold text-xs text-[#00f2fe]">
                      @N
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white font-mono">@nacho_growth</h3>
                      <span className="text-[10px] text-emerald-400 font-mono">Cualificado • Listo para llamada</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerToast("Control tomado. IA pausada para este usuario.")}
                      className="px-3 py-1.5 rounded-full bg-[#ff7a00]/15 text-[#ff7a00] border border-[#ff7a00]/30 text-xs font-semibold hover:bg-[#ff7a00]/25 transition-all"
                    >
                      Pausar IA / Tomar Control
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 bg-[#12141a]">
                  <div className="flex justify-start">
                    <div className="bg-[#20242e] p-3 rounded-2xl rounded-tl-xs max-w-md text-xs text-slate-200 border border-white/5">
                      ¡Hola! Vi el reel de automatización, ¿me pasan info y precios?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-[#00f2fe]/20 to-[#00f2fe]/10 border border-[#00f2fe]/40 p-3 rounded-2xl rounded-tr-xs max-w-md text-xs text-white">
                      {getSimGreeting()}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-[#20242e] p-3 rounded-2xl rounded-tl-xs max-w-md text-xs text-slate-200 border border-white/5">
                      Dale, pásame el enlace de la llamada
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-[#181c25] border border-[#d4ff00]/40 p-3.5 rounded-2xl max-w-md flex flex-col gap-2">
                      <span className="text-xs font-bold text-white">{config.ctaHook}</span>
                      <a
                        href={config.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 bg-[#d4ff00] text-[#14161b] rounded-xl text-center text-xs font-extrabold uppercase tracking-wider font-heading"
                      >
                        Abrir Calendly
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#171920] border-t border-white/[0.08] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una respuesta como humano..."
                    className="flex-1 bg-[#14161b] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#d4ff00]"
                  />
                  <button
                    onClick={() => triggerToast("Mensaje enviado por Instagram Graph API.")}
                    className="p-2.5 rounded-2xl bg-[#d4ff00] text-[#14161b] hover:bg-[#c6f000] font-bold"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: SIMULADOR SANDBOX */}
          {activeTab === "sandbox" && (
            <div className="max-w-[1200px] mx-auto bg-[#1a1d24] p-8 rounded-3xl border border-white/[0.08] flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-2xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/30 font-bold">
                  🧪
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-white">Simulador Sandbox de Pruebas</h2>
                  <p className="text-xs text-slate-400">
                    Interactúa con el motor de IA usando la configuración activa sin enviar mensajes a Instagram.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-slate-300">Mensaje del Prospecto (Entrada)</label>
                  <textarea
                    rows={4}
                    value={simProspectMsg}
                    onChange={(e) => setSimProspectMsg(e.target.value)}
                    className="w-full bg-[#14161b] p-4 rounded-2xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#00f2fe] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSimProspectMsg("¿Cuánto cobran por el servicio?")}
                      className="px-3 py-1.5 rounded-full bg-[#20242e] text-[11px] text-slate-300 hover:text-white border border-white/5"
                    >
                      Probar Pregunta de Precio
                    </button>
                    <button
                      onClick={() => setSimProspectMsg("No tengo presupuesto en este momento")}
                      className="px-3 py-1.5 rounded-full bg-[#20242e] text-[11px] text-slate-300 hover:text-white border border-white/5"
                    >
                      Probar Descalificación
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-slate-300">Respuesta Generada por el Setter</label>
                  <div className="w-full bg-[#14161b] p-4 rounded-2xl border border-[#00f2fe]/30 text-xs text-[#00f2fe] font-mono leading-relaxed min-h-[120px]">
                    {getSimGreeting()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
