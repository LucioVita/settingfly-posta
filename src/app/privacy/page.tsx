import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, Trash2, Mail } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | Settingfly",
  description: "Política de privacidad y tratamiento de datos de Settingfly conforme a las políticas de Meta Platform.",
};

export default function PrivacyPolicyPage() {
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
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Política de Privacidad de Settingfly
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
              <Lock className="size-4 text-blue-400" /> 1. Información que recopilamos
            </h2>
            <p>
              Settingfly recopila información únicamente con el propósito de prestar el servicio de automatización de respuestas, cualificación de leads y agendamiento para cuentas profesionales de Instagram.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">Datos de cuenta y registro:</strong> Nombre, correo electrónico y credenciales cifradas del usuario registrado en la plataforma.
              </li>
              <li>
                <strong className="text-slate-200">Datos de la API de Meta / Instagram:</strong> Identificador de cuenta comercial de Instagram, nombre de usuario, identificadores de páginas de Facebook vinculadas y tokens de acceso necesarios para la operación autónoma del Setter IA.
              </li>
              <li>
                <strong className="text-slate-200">Mensajes e interacciones:</strong> Mensajes directos (DMs) y comentarios públicos recibidos en la cuenta conectada, con el fin exclusivo de generar respuestas conversacionales contextuales mediante IA y detectar el interés del prospecto.
              </li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="size-4 text-purple-400" /> 2. Finalidad del tratamiento de datos
            </h2>
            <p>Los datos recopilados se utilizan estrictamente para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Permitir que el Setter IA responda mensajes entrantes y comentarios en Instagram en nombre del titular de la cuenta.</li>
              <li>Detectar palabras clave de activación (triggers) y derivar prospectos cualificados hacia enlaces de agenda (Calendly, Cal.com) o WhatsApp.</li>
              <li>Mantener el hilo conversacional temporal para evitar repeticiones y brindar respuestas coherentes.</li>
              <li>Supervisar la salud de la conexión y notificar revocación de permisos o incidencias operativas.</li>
            </ul>
            <p className="text-xs text-slate-400 italic">
              Settingfly nunca vende, alquila ni comercializa datos personales ni información de conversaciones a terceros ni a plataformas publicitarias.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" /> 3. Seguridad y conservación
            </h2>
            <p>
              Todos los tokens de acceso de la API de Meta y las claves criptográficas se almacenan con cifrado de grado militar (AES-GCM / SHA-256) en servidores protegidos bajo certificados SSL/TLS.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="size-4 text-rose-400" /> 4. Eliminación de datos del usuario (Meta Data Deletion)
            </h2>
            <p>
              Conforme a los términos para desarrolladores de Meta, cualquier usuario puede solicitar la eliminación completa de sus datos o desvincular su cuenta en cualquier momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">Desvinculación automática:</strong> Al eliminar una cuenta de Instagram desde el panel de control de Settingfly o revocar los permisos desde la configuración de Facebook/Instagram, los tokens y datos asociados quedan inmediatamente inactivos y son purgados de la base de datos.
              </li>
              <li>
                <strong className="text-slate-200">Endpoint de eliminación de Meta:</strong> Settingfly cuenta con una URL de devolución de llamada para eliminación de datos accesible en{" "}
                <code className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  https://settingfly.com/api/auth/meta/data-deletion
                </code>
              </li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="size-4 text-amber-400" /> 5. Contacto
            </h2>
            <p>
              Para cualquier consulta o ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), puede contactar con el equipo responsable a través de:
            </p>
            <p className="font-semibold text-white">
              lucio_vita@hotmail.com | soporte@settingfly.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          &copy; {new Date().getFullYear()} Settingfly. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
