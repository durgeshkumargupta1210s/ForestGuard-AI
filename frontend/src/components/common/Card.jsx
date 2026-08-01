/**
 * StatCard — displays a single KPI statistic.
 *
 * Props:
 *   title       — string: metric label
 *   value       — string | number: the displayed value
 *   icon        — React element: lucide icon component
 *   color       — "green" | "blue" | "amber" | "red" | "purple"
 *   trend       — string (optional): e.g. "+12%" or "↑ 3"
 *   trendUp     — boolean (optional): true = green, false = red
 *   subtitle    — string (optional): extra context line
 *   loading     — boolean: show skeleton
 */
function StatCard({
  title,
  value,
  icon: Icon,
  color = "green",
  trend,
  trendUp,
  subtitle,
  loading = false,
}) {
  const colorMap = {
    green:  { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)",   icon: "#4ade80",  glow: "0 0 20px rgba(34,197,94,0.15)"   },
    blue:   { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)",  icon: "#60a5fa",  glow: "0 0 20px rgba(59,130,246,0.15)"  },
    amber:  { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  icon: "#fbbf24",  glow: "0 0 20px rgba(245,158,11,0.15)"  },
    red:    { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   icon: "#f87171",  glow: "0 0 20px rgba(239,68,68,0.15)"   },
    purple: { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.2)",  icon: "#c084fc",  glow: "0 0 20px rgba(168,85,247,0.15)"  },
  };

  // Fall back to green so an unrecognized color prop can't crash the page.
  const c = colorMap[color] || colorMap.green;

  if (loading) {
    return (
      <div className="fg-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="skeleton w-16 h-5 rounded-md" />
        </div>
        <div className="skeleton w-20 h-7 rounded-md mb-2" />
        <div className="skeleton w-32 h-4 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className="fg-card p-5 flex flex-col gap-4 transition-all duration-200 cursor-default"
      style={{ boxShadow: c.glow }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = c.glow + ", 0 8px 30px rgba(0,0,0,0.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = c.glow; }}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          {Icon && <Icon size={18} style={{ color: c.icon }} />}
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              color: trendUp ? "#4ade80" : "#f87171",
              background: trendUp ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            }}
          >
            {trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value ?? "—"}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
