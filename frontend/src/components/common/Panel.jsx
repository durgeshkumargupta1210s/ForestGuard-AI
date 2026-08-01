/**
 * Panel — a titled card container.
 *
 * Replaces the repeated rounded-2xl + border + header-row markup
 * that each dashboard section was declaring inline.
 *
 * Props:
 *   title    — string: section heading
 *   subtitle — string (optional): supporting line under the title
 *   icon     — lucide icon component (optional)
 *   accent   — "green" | "blue" | "amber" | "red" | "purple"
 *   action   — React node (optional): rendered at the right of the header
 *   bodyless — boolean: skip body padding (for maps / edge-to-edge content)
 *   footer   — React node (optional): rendered below the body, divided
 */

const ACCENTS = {
  green: { color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.14)" },
  blue: { color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.14)" },
  amber: { color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.14)" },
  red: { color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.14)" },
  purple: { color: "#c084fc", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.14)" },
};

function Panel({
  title,
  subtitle,
  icon: Icon,
  accent = "green",
  action,
  bodyless = false,
  footer,
  children,
  className = "",
}) {
  const tone = ACCENTS[accent] || ACCENTS.green;

  return (
    <div
      className={`rounded-2xl border overflow-hidden min-w-0 ${className}`}
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--bg-border)",
      }}
    >
      {title && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: "var(--bg-border)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  color: tone.color,
                  background: tone.bg,
                  border: `1px solid ${tone.border}`,
                }}
              >
                <Icon size={17} />
              </div>
            )}

            <div className="min-w-0">
              <h2
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h2>

              {subtitle && (
                <p
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>
      )}

      <div className={bodyless ? "" : "p-4 sm:p-5"}>{children}</div>

      {footer && (
        <div
          className="px-5 py-3 border-t"
          style={{
            borderColor: "var(--bg-border)",
            background: "rgba(2,6,23,0.15)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Panel;
