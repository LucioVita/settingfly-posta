"use client";
// web/src/app/crm/page.tsx
// CRM interno: login simple y pipeline de solicitudes de contacto (ContactRequest).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ExternalLink,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// Instagram no existe como export en lucide-react en esta versión: SVG propio
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

interface CrmLead {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  instagram: string | null;
  businessName: string | null;
  monthlyBudget: string | null;
  message: string | null;
  status: string;
  adminNote: string | null;
}

// Estados del pipeline (valores guardados en DB)
const STATUSES = ["pending", "contactado", "agendado", "ganado", "descartado"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Nuevo",
  contactado: "Contactado",
  agendado: "Agendado",
  ganado: "Ganado",
  descartado: "Descartado",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/30",
  contactado: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  agendado: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  ganado: "bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/40",
  descartado: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CrmPage() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Leads state
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [leadsError, setLeadsError] = useState("");
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const fetchLeads = useCallback(async () => {
    setLeadsError("");
    try {
      const res = await fetch("/api/crm/leads");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setLeadsError(data.error || "Error al cargar solicitudes.");
        return;
      }
      setLeads(data.leads || []);
      setAuthed(true);
    } catch {
      setLeadsError("Error de conexión con el servidor.");
    }
  }, []);

  useEffect(() => {
    fetchLeads().finally(() => setLoading(false));
  }, [fetchLeads]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/crm/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      setPassword("");
      await fetchLeads();
    } catch {
      setLoginError("Error de conexión con el servidor.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/crm/session", { method: "DELETE" });
    } catch {
      // noop
    }
    setAuthed(false);
    setLeads([]);
    setUsername("");
  };

  // Actualiza localmente y persiste
  const updateLead = async (lead: CrmLead, patch: { status?: string; adminNote?: string }) => {
    setSavingIds((prev) => new Set(prev).add(lead.id));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(lead.id);
      return next;
    });
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));

    try {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, ...patch }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(lead.id));
        window.setTimeout(() => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(lead.id);
            return next;
          });
        }, 2000);
      } else {
        const data = await res.json();
        setLeadsError(data.error || "Error al guardar el cambio.");
        if (res.status === 401) setAuthed(false);
      }
    } catch {
      setLeadsError("Error al guardar el cambio.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchStatus = filter === "todos" || lead.status === filter;
      if (!matchStatus) return false;
      if (!q) return true;
      return [lead.name, lead.email, lead.instagram, lead.businessName, lead.monthlyBudget]
        .some((field) => field && field.toLowerCase().includes(q));
    });
  }, [leads, filter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { todos: leads.length };
    for (const s of STATUSES) map[s] = 0;
    for (const lead of leads) map[lead.status] = (map[lead.status] || 0) + 1;
    return map;
  }, [leads]);

  // ===== Login screen =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#14161b] flex items-center justify-center text-slate-500 text-sm font-mono">
        Cargando CRM...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#14161b] text-slate-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(closest-side, #d4ff00, transparent 70%)" }}
        />
        <div className="relative w-full max-w-sm rounded-3xl bg-[#1a1d24] border border-white/[0.08] p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-12 w-12 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center">
              <ShieldCheck className="size-6 text-[#d4ff00]" />
            </div>
            <h1 className="text-xl font-heading font-extrabold text-white">Settingfly CRM</h1>
            <p className="text-xs text-slate-400">Acceso interno · solicitudes del sitio</p>
          </div>

          {loginError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Usuario</label>
              <input
                type="text"
                name="username"
                autoComplete="off"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                placeholder="Usuario del CRM"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Contraseña</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4ff00] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-[#d4ff00] text-black font-bold text-sm hover:shadow-neon-lime transition-shadow disabled:opacity-50"
            >
              {loginLoading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
        <p className="relative mt-6 text-[11px] text-slate-600 font-mono">Acceso restringido al equipo</p>
      </div>
    );
  }

  // ===== Board =====
  return (
    <div className="min-h-screen bg-[#14161b] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#14161b]/85 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center">
              <Sparkles className="size-4.5 text-[#d4ff00]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-extrabold text-white">Settingfly CRM</span>
              <span className="text-[10px] text-slate-500">Solicitudes de contacto · settingfly.com</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#20242e] border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-[#272c38] transition-colors"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refrescar
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#20242e] border border-white/[0.08] text-xs text-slate-300 hover:text-rose-400 transition-colors"
            >
              <LogOut className="size-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Barra de filtros */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("todos")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                filter === "todos"
                  ? "bg-white/[0.08] text-white border-white/25"
                  : "text-slate-400 border-white/[0.08] hover:text-white"
              }`}
            >
              Todos <span className="font-mono opacity-60">({counts.todos})</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  filter === s ? STATUS_STYLES[s] : "text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {STATUS_LABELS[s]} <span className="font-mono opacity-60">({counts[s] || 0})</span>
              </button>
            ))}
          </div>
          <div className="md:ml-auto relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, @instagram..."
              className="w-full md:w-72 bg-[#1a1d24] border border-white/[0.08] rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4ff00] transition-colors"
            />
          </div>
        </div>

        {leadsError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{leadsError}</span>
          </div>
        )}

        {/* Lista de solicitudes */}
        {filteredLeads.length === 0 ? (
          <div className="rounded-3xl bg-[#1a1d24] border border-white/[0.06] p-12 text-center flex flex-col items-center gap-3">
            <Mail className="size-8 text-slate-600" />
            <p className="text-sm text-slate-400 font-semibold">
              {leads.length === 0 ? "Todavía no hay solicitudes." : "Nada que mostrar con este filtro/ búsqueda."}
            </p>
            <p className="text-xs text-slate-600">
              Las solicitudes del formulario de la landing aparecen aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredLeads.map((lead) => (
              <article
                key={lead.id}
                className="rounded-3xl bg-[#1a1d24] border border-white/[0.06] p-6 flex flex-col gap-4 hover:border-white/15 transition-colors"
              >
                {/* Encabezado fila */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-heading font-bold text-lg text-white">{lead.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          STATUS_STYLES[lead.status] || "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}
                      >
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                      {savedIds.has(lead.id) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#d4ff00] font-bold">
                          <Check className="size-3" /> Guardado
                        </span>
                      )}
                      {savingIds.has(lead.id) && (
                        <RefreshCw className="size-3 animate-spin text-slate-500" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      #{lead.id} · {formatDate(lead.createdAt)}
                    </span>
                  </div>

                  {/* Dropdown de estado */}
                  <label className="flex flex-col gap-1 min-w-[170px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Estado
                    </span>
                    <div className="relative">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead, { status: e.target.value })}
                        className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4ff00]/40 transition-colors ${
                          STATUS_STYLES[lead.status] || "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}
                        style={{ backgroundColor: "#20242e" }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[#20242e] text-slate-200">
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                    </div>
                  </label>
                </div>

                {/* Datos de contacto */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-[#20242e] border border-white/[0.05] px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Email</span>
                    <a
                      href={`mailto:${lead.email}?subject=Settingfly%20·%20tu%20solicitud%20de%20plan%20a%20medida`}
                      className="text-xs text-slate-200 hover:text-[#00f2fe] inline-flex items-center gap-1.5 transition-colors"
                    >
                      {lead.email}
                      <ExternalLink className="size-3 opacity-50" />
                    </a>
                  </div>
                  <div className="rounded-2xl bg-[#20242e] border border-white/[0.05] px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Instagram</span>
                    {lead.instagram ? (
                      <a
                        href={
                          lead.instagram.startsWith("http")
                            ? lead.instagram
                            : `https://instagram.com/${lead.instagram.replace(/^@/, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-200 hover:text-[#00f2fe] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <InstagramIcon className="size-3.5 text-pink-400" />
                        {lead.instagram}
                        <ExternalLink className="size-3 opacity-50" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-[#20242e] border border-white/[0.05] px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Negocio</span>
                    <span className="text-xs text-slate-200">{lead.businessName || "—"}</span>
                  </div>
                  <div className="rounded-2xl bg-[#20242e] border border-white/[0.05] px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Presupuesto</span>
                    <span className="text-xs text-slate-200">{lead.monthlyBudget || "—"}</span>
                  </div>
                </div>

                {/* Mensaje */}
                {lead.message ? (
                  <div className="rounded-2xl border border-[#00f2fe]/20 bg-[#00f2fe]/[0.04] px-4 py-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00f2fe] mb-1 block">
                      Mensaje
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{lead.message}</p>
                  </div>
                ) : null}

                {/* Nota interna */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Nota interna (solo el equipo la ve)
                  </span>
                  <textarea
                    defaultValue={lead.adminNote || ""}
                    placeholder="Género, condición, próximos pasos..."
                    onBlur={(e) => {
                      const value = e.target.value || "";
                      if (value !== (lead.adminNote || "")) {
                        updateLead(lead, { adminNote: value });
                      }
                    }}
                    rows={2}
                    className="w-full bg-[#14161b] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-200 resize-y focus:outline-none focus:border-[#d4ff00] transition-colors"
                  />
                </label>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
