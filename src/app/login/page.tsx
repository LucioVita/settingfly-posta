"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Bot,
  Zap,
  CalendarCheck,
  Eye,
  EyeOff,
  Building,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Error al procesar la solicitud.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        mode === "login" ? "¡Sesión iniciada! Redirigiendo..." : "¡Cuenta creada exitosamente! Redirigiendo..."
      );

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage("Error de conexión al servidor. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("demo@settingfly.com");
    setPassword("password123");
    setName("Agencia Growth Pro");
  };

  return (
    <div className="min-h-screen w-full bg-[#14161b] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4ff00]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar Minimal */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-settingfly-wordmark.png"
            alt="Settingfly"
            className="h-10 w-auto max-w-[180px] object-contain drop-shadow-md"
          />
        </Link>
      </header>

      {/* Main Content Split */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 z-10">
        {/* Left Side: Value Proposition & Social Proof */}
        <div className="flex-1 flex flex-col gap-6 max-w-xl text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            El Setter Autónomo de Instagram que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4ff00] via-[#00f2fe] to-[#ff7a00]">
              agenda clientes
            </span>{" "}
            en piloto automático.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Convierte comentarios en Reels y mensajes directos en videollamadas cualificadas para tu agencia o negocio 24/7,
            con lenguaje natural y sin que tengas que redactar prompts complejos.
          </p>

          {/* 3 Key Benefits */}
          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1d24]/70 border border-white/[0.06]">
              <div className="size-9 rounded-xl bg-[#d4ff00]/15 text-[#d4ff00] flex items-center justify-center border border-[#d4ff00]/30 shadow-neon-lime shrink-0">
                <Bot className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-heading">Cualificación BANT en 3 preguntas</span>
                <span className="text-[11px] text-slate-400">
                  Filtra presupuesto y situación actual antes de enviar tu enlace de agenda.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1d24]/70 border border-white/[0.06]">
              <div className="size-9 rounded-xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/30 shadow-neon-cyan shrink-0">
                <CalendarCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-heading">Entrega inteligente de Calendly</span>
                <span className="text-[11px] text-slate-400">
                  Resuelve objeciones frecuentes y entrega el enlace sólo con interés genuino.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1d24]/70 border border-white/[0.06]">
              <div className="size-9 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center border border-[#ff7a00]/30 shadow-neon-orange shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-heading">Meta Graph API & Delay Antiban</span>
                <span className="text-[11px] text-slate-400">
                  Cadencia humana de 15 a 30s con Webhooks oficiales y base de datos aislada.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full max-w-md bg-[#1a1d24]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 shadow-2xl relative">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/logo-settingfly.png"
              alt="Logotipo de Settingfly"
              className="h-12 w-auto max-w-[200px] object-contain drop-shadow-md"
            />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-heading font-extrabold text-white">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta Nueva"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === "login"
                ? "Ingresa con tus credenciales para administrar tus setters."
                : "Configura tu asistente IA en menos de 2 minutos."}
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex bg-[#14161b] p-1 rounded-2xl mb-6 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                mode === "login" ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime" : "text-slate-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                mode === "register" ? "bg-[#d4ff00] text-[#14161b] shadow-neon-lime" : "text-slate-400 hover:text-white"
              }`}
            >
              Registrarme
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre de tu Marca o Agencia</label>
                <div className="relative flex items-center">
                  <Building className="size-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Convexa Growth"
                    className="w-full bg-[#14161b] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
              <div className="relative flex items-center">
                <Mail className="size-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tuagencia.com"
                  className="w-full bg-[#14161b] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="text-[10px] font-mono text-[#00f2fe] hover:underline"
                  >
                    Rellenar datos demo
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="size-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Ingresa tu contraseña" : "Mínimo 6 caracteres"}
                  className="w-full bg-[#14161b] border border-white/[0.08] rounded-2xl pl-11 pr-11 py-3 text-xs text-white focus:outline-none focus:border-[#d4ff00] transition-colors placeholder:text-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-white p-0.5"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3.5 rounded-2xl bg-[#d4ff00] hover:bg-[#c6f000] text-[#14161b] font-heading font-extrabold text-xs uppercase tracking-wider shadow-neon-lime transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? "Procesando..." : mode === "login" ? "Ingresar a mi Consola" : "Crear Cuenta & Comenzar"}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <span className="text-[11px] text-slate-400">
              {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta registrada?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[#d4ff00] font-bold hover:underline"
              >
                {mode === "login" ? "Regístrate aquí" : "Inicia sesión"}
              </button>
            </span>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-[11px] text-slate-500 font-mono z-10">
        © 2026 Settingfly.com • Desarrollado por{" "}
        <a
          href="https://guruweb.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-[#00f2fe] transition-colors"
        >
          guruweb.com.ar
        </a>
      </footer>
    </div>
  );
}

