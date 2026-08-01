/**
 * Reusable status badge for ForestGuard.
 *
 * Examples:
 * <Badge variant="success">Safe</Badge>
 * <Badge variant="warning">Warning</Badge>
 * <Badge variant="danger">Critical</Badge>
 * <Badge variant="info">Running</Badge>
 * <Badge variant="neutral">Pending</Badge>
 */

function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = true,
  pulse = false,
  icon: Icon,
  className = "",
}) {
  const variants = {
    success: {
      text: "#4ade80",
      background: "rgba(34, 197, 94, 0.10)",
      border: "rgba(34, 197, 94, 0.22)",
      dot: "#22c55e",
    },

    warning: {
      text: "#fbbf24",
      background: "rgba(245, 158, 11, 0.10)",
      border: "rgba(245, 158, 11, 0.22)",
      dot: "#f59e0b",
    },

    danger: {
      text: "#f87171",
      background: "rgba(239, 68, 68, 0.10)",
      border: "rgba(239, 68, 68, 0.22)",
      dot: "#ef4444",
    },

    info: {
      text: "#60a5fa",
      background: "rgba(59, 130, 246, 0.10)",
      border: "rgba(59, 130, 246, 0.22)",
      dot: "#3b82f6",
    },

    purple: {
      text: "#c084fc",
      background: "rgba(168, 85, 247, 0.10)",
      border: "rgba(168, 85, 247, 0.22)",
      dot: "#a855f7",
    },

    neutral: {
      text: "#94a3b8",
      background: "rgba(148, 163, 184, 0.08)",
      border: "rgba(148, 163, 184, 0.18)",
      dot: "#94a3b8",
    },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const config = variants[variant] || variants.neutral;

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        gap-1.5
        rounded-full
        font-semibold
        whitespace-nowrap
        border
        ${sizes[size] || sizes.md}
        ${className}
      `}
      style={{
        color: config.text,
        background: config.background,
        borderColor: config.border,
      }}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
              style={{
                backgroundColor: config.dot,
              }}
            />
          )}

          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{
              backgroundColor: config.dot,
            }}
          />
        </span>
      )}

      {Icon && <Icon size={13} />}

      {children}
    </span>
  );
}

export default Badge;