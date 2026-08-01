import {
  Inbox,
  SearchX,
  MapPinned,
  BellOff,
  FileX2,
  Activity,
} from "lucide-react";

/**
 * ForestGuard Empty State
 *
 * Props:
 * - icon            Custom Lucide icon
 * - title           Main heading
 * - description     Supporting text
 * - actionLabel     Primary action text
 * - onAction        Primary action callback
 * - secondaryLabel  Optional secondary action
 * - onSecondary     Secondary action callback
 * - type            preset icon:
 *                   default | search | region |
 *                   alert | report | analysis
 * - compact         Smaller version for cards/widgets
 */

function EmptyState({
  icon: CustomIcon,
  title = "Nothing here yet",
  description = "There is currently no data available.",
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  type = "default",
  compact = false,
  className = "",
}) {
  /* =========================================================
     Preset Icons
  ========================================================= */

  const icons = {
    default: Inbox,
    search: SearchX,
    region: MapPinned,
    alert: BellOff,
    report: FileX2,
    analysis: Activity,
  };

  const Icon = CustomIcon || icons[type] || icons.default;

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      className={`
        relative
        flex
        flex-col
        items-center
        justify-center
        text-center
        overflow-hidden
        ${compact ? "px-5 py-10" : "px-6 py-16"}
        ${className}
      `}
    >
      {/* Background glow */}

      <div
        className="
          absolute
          pointer-events-none
          rounded-full
        "
        style={{
          width: compact ? "150px" : "220px",
          height: compact ? "150px" : "220px",

          background:
            "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",

          filter: "blur(4px)",
        }}
      />

      {/* =====================================================
          Icon
      ===================================================== */}

      <div
        className={`
          relative
          flex
          items-center
          justify-center
          rounded-2xl
          border
          ${compact ? "w-12 h-12" : "w-16 h-16"}
        `}
        style={{
          color: "#4ade80",

          background:
            "linear-gradient(145deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))",

          borderColor: "rgba(74,222,128,0.18)",

          boxShadow: "0 10px 35px rgba(34,197,94,0.08)",
        }}
      >
        <Icon size={compact ? 22 : 28} strokeWidth={1.8} />

        {/* Small status dot */}

        <span
          className="
            absolute
            -right-1
            -bottom-1
            w-4
            h-4
            rounded-full
            border-[3px]
          "
          style={{
            background: "#22c55e",
            borderColor: "var(--bg-card, #111827)",
          }}
        />
      </div>

      {/* =====================================================
          Content
      ===================================================== */}

      <div
        className={
          compact ? "relative mt-4 max-w-sm" : "relative mt-6 max-w-md"
        }
      >
        <h3
          className={`
            font-semibold
            tracking-tight
            ${compact ? "text-base" : "text-lg"}
          `}
          style={{
            color: "var(--text-primary, #f8fafc)",
          }}
        >
          {title}
        </h3>

        {description && (
          <p
            className={`
              mt-2
              leading-relaxed
              ${compact ? "text-xs" : "text-sm"}
            `}
            style={{
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* =====================================================
          Actions
      ===================================================== */}

      {(actionLabel || secondaryLabel) && (
        <div
          className="
            relative
            flex
            flex-col
            sm:flex-row
            items-center
            justify-center
            gap-3
            mt-6
          "
        >
          {/* Primary */}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="
                inline-flex
                items-center
                justify-center
                min-h-10
                px-4
                rounded-xl
                text-sm
                font-semibold
                text-white
                transition-all
                duration-200
                hover:-translate-y-0.5
                active:translate-y-0
                active:scale-[0.98]
              "
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",

                border: "1px solid rgba(74,222,128,0.28)",

                boxShadow: "0 8px 24px rgba(34,197,94,0.18)",
              }}
            >
              {actionLabel}
            </button>
          )}

          {/* Secondary */}

          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="
                inline-flex
                items-center
                justify-center
                min-h-10
                px-4
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200
                hover:-translate-y-0.5
                active:translate-y-0
              "
              style={{
                color: "var(--text-secondary, #cbd5e1)",

                background: "rgba(148,163,184,0.06)",

                border: "1px solid var(--bg-border, rgba(148,163,184,0.12))",
              }}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
