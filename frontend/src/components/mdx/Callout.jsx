/**
 * MDX içinde kullanılır:
 *   <Callout type="tip" title="İpucu">Metin…</Callout>
 * type: "tip" | "warning" | "info" | "danger"
 */

const VARIANTS = {
  tip: {
    box: "border-primary-200 bg-primary-50",
    icon: "text-primary-600",
    label: "İpucu",
    path: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    box: "border-accent-200 bg-accent-50",
    icon: "text-accent-600",
    label: "Bilgi",
    path: "M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    box: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    label: "Dikkat",
    path: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  },
  danger: {
    box: "border-red-200 bg-red-50",
    icon: "text-red-600",
    label: "Uyarı",
    path: "M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export default function Callout({ type = "tip", title, children }) {
  const v = VARIANTS[type] ?? VARIANTS.tip;

  return (
    <div className={`my-6 flex gap-3 rounded-brand border p-4 ${v.box}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${v.icon}`}
      >
        <path
          d={v.path}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="min-w-0 text-[0.95rem] leading-relaxed text-ink [&>*+*]:mt-2 [&>p]:m-0">
        <strong className="mb-1 block text-sm font-bold">{title ?? v.label}</strong>
        {children}
      </div>
    </div>
  );
}
