import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Condiciones del Servicio | Settingfly",
  description: "Términos y condiciones de uso de la plataforma Settingfly.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="size-4" /> Volver a Settingfly
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileText className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Condiciones del Servicio de Settingfly
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Última actualización: 21 de noviembre de 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-[#0D1117] border border-white/[0.06] rounded-2xl p-6 sm:p-10 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="size-4 text-purple-400" /> 1. Aceptación de los términos
            </h2>
            <p>
              Al registrarse, acceder o utilizar la plataforma Settingfly, usted acepta quedar vinculado por estos Términos y Condiciones, así como por las Políticas de la Plataforma de Meta e Instagram. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-400" /> 2. Descripción del servicio
            </h2>
            <p>
              Settingfly es un software como servicio (SaaS) que proporciona herramientas de asistencia y automatización mediante Inteligencia Artificial para la gestión de mensajes directos y comentarios en cuentas profesionales de Instagram.
            </p>
            <p>
              El usuario es el único responsable de configurar los parámetros de voz, tono, disparadores y límites del Setter IA, asegurándose de que el contenido enviado cumpla con la legislación aplicable y las normativas comunitarias de Meta.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" /> 3. Uso aceptable y cumplimiento anti-spam
            </h2>
            <p>El usuario se compromete a no utilizar Settingfly para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Enviar mensajes no solicitados masivos (SPAM) a personas que no hayan iniciado previamente una interacción o solicitado información.</li>
              <li>Promover productos o servicios engañosos, ilegales o contrarios a las Políticas Comerciales de Meta.</li>
              <li>Intentar eludir las restricciones de velocidad o ventanas de mensajería oficiales impuestas por la API de Meta Graph.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="size-4 text-emerald-400" /> 4. Integraciones con terceros (Meta / Instagram)
            </h2>
            <p>
              Settingfly utiliza la API oficial de Meta para interactuar con las cuentas de Instagram autorizadas por el usuario. No nos hacemos responsables de interrupciones, cambios en las políticas o restricciones aplicadas directamente por Meta sobre las cuentas de usuario que violen sus normas comunitarias.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="size-4 text-indigo-400" /> 5. Modificaciones y cancelación
            </h2>
            <p>
              Settingfly se reserva el derecho de modificar estos términos en cualquier momento. El usuario puede cancelar su suscripción y eliminar la vinculación de sus cuentas en cualquier momento desde el panel de control.
            </p>
            <p className="font-semibold text-white mt-2">
              Contacto legal: lucio_vita@hotmail.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          &copy; 2026 Settingfly. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
