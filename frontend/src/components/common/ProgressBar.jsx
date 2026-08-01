/**
 * ForestGuard reusable ProgressBar
 *
 * Can be used for:
 * - NDVI
 * - Risk Score
 * - Confidence
 * - Cloud Coverage
 * - Vegetation Health
 * - Analysis Progress
 *
 * Props:
 * value       - current value
 * max         - maximum value
 * min         - minimum value
 * label       - optional heading
 * showValue   - display numeric value
 * suffix      - %, NDVI, etc.
 * variant     - success | warning | danger | info | purple
 * size        - sm | md | lg
 * animated    - animate progress
 * striped     - optional striped effect
 */

function ProgressBar({
  value = 0,
  min = 0,
  max = 100,

  label = "",
  showValue = true,
  suffix = "%",

  variant = "success",

  size = "md",

  animated = true,
  striped = false,

  className = "",
}) {
  /* =========================================================
     Normalize value
  ========================================================= */

  const numericValue = Number(value) || 0;

  const safeValue = Math.min(Math.max(numericValue, min), max);

  const range = max - min || 1;

  const percentage = ((safeValue - min) / range) * 100;

  /* =========================================================
     Variants
  ========================================================= */

  const variants = {
    success: {
      start: "#16a34a",
      end: "#4ade80",
      glow: "rgba(34,197,94,0.25)",
      text: "#4ade80",
    },

    warning: {
      start: "#d97706",
      end: "#fbbf24",
      glow: "rgba(245,158,11,0.25)",
      text: "#fbbf24",
    },

    danger: {
      start: "#dc2626",
      end: "#f87171",
      glow: "rgba(239,68,68,0.25)",
      text: "#f87171",
    },

    info: {
      start: "#2563eb",
      end: "#60a5fa",
      glow: "rgba(59,130,246,0.25)",
      text: "#60a5fa",
    },

    purple: {
      start: "#9333ea",
      end: "#c084fc",
      glow: "rgba(168,85,247,0.25)",
      text: "#c084fc",
    },
  };

  const config = variants[variant] || variants.success;

  /* =========================================================
     Sizes
  ========================================================= */

  const sizes = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}

      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4 mb-2">
          {label ? (
            <span
              className="text-sm font-medium truncate"
              style={{
                color: "var(--text-secondary, #cbd5e1)",
              }}
            >
              {label}
            </span>
          ) : (
            <span />
          )}

          {showValue && (
            <span
              className="text-xs font-semibold whitespace-nowrap"
              style={{
                color: config.text,
              }}
            >
              {safeValue}
              {suffix}
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}

      <div
        className={`
          relative
          w-full
          overflow-hidden
          rounded-full
          ${sizes[size] || sizes.md}
        `}
        style={{
          background: "rgba(148,163,184,0.10)",
        }}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        aria-label={label || "Progress"}
      >
        {/* Progress */}

        <div
          className={`
            relative
            h-full
            rounded-full
            overflow-hidden
          `}
          style={{
            width: `${percentage}%`,

            background: `linear-gradient(
              90deg,
              ${config.start},
              ${config.end}
            )`,

            boxShadow: `0 0 12px ${config.glow}`,

            transition: animated
              ? "width 700ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "none",
          }}
        >
          {/* Shine */}

          {animated && (
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",

                animation: "fg-progress-shine 2.2s ease-in-out infinite",
              }}
            />
          )}

          {/* Optional Stripes */}

          {striped && (
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,.12) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.12) 75%, transparent 75%, transparent)",

                backgroundSize: "16px 16px",

                animation: "fg-progress-stripes 1s linear infinite",
              }}
            />
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fg-progress-shine {
            0% {
              transform: translateX(-100%);
            }

            60%,
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes fg-progress-stripes {
            from {
              background-position: 0 0;
            }

            to {
              background-position: 16px 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            [role="progressbar"] > div {
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ProgressBar;
