// web/src/components/InstagramIntegrationBadge.tsx
// Sello de integración con Instagram.
// Muestra únicamente el glifo de Instagram (en blanco, según las brand guidelines)
// junto a un texto descriptivo. No reclama ninguna afiliación ni partnership con Meta.

type Props = {
  variant?: "default" | "compact";
  className?: string;
};

export function InstagramGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function InstagramIntegrationBadge({
  variant = "default",
  className = "",
}: Props) {
  const compact = variant === "compact";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-slate-300 ${
        compact ? "px-2.5 py-1" : "px-3.5 py-1.5"
      } ${className}`}
      title="Settingfly se conecta con Instagram a través de la API de Instagram"
    >
      <InstagramGlyph className={compact ? "size-3.5 text-white" : "size-4 text-white"} />
      <span
        className={`font-mono font-bold uppercase tracking-wider ${
          compact ? "text-[9px]" : "text-[11px]"
        }`}
      >
        Integrado con Instagram
      </span>
    </div>
  );
}
