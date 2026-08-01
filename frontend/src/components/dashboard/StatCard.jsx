import { motion } from "framer-motion";

/* =========================================================
   Color Configuration
========================================================= */

const COLOR_CONFIG = {
  green: {
    color: "#4ade80",
    background: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.13)",
    glow: "rgba(34,197,94,0.08)",
  },

  blue: {
    color: "#60a5fa",
    background: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.13)",
    glow: "rgba(59,130,246,0.08)",
  },

  amber: {
    color: "#fbbf24",
    background: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.13)",
    glow: "rgba(245,158,11,0.08)",
  },

  red: {
    color: "#f87171",
    background: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.13)",
    glow: "rgba(239,68,68,0.08)",
  },

  purple: {
    color: "#c084fc",
    background: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.13)",
    glow: "rgba(168,85,247,0.08)",
  },
};

/* =========================================================
   Loading Skeleton
========================================================= */

function StatCardSkeleton() {
  return (
    <div
      className="
        rounded-2xl
        border
        p-5
        min-h-[145px]
      "
      style={{
        background: "var(--bg-card, #0f172a)",

        borderColor: "var(--bg-border, rgba(148,163,184,0.12))",
      }}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="flex-1">
          <div
            className="
              skeleton
              h-3
              w-24
              rounded
            "
          />

          <div
            className="
              skeleton
              h-8
              w-16
              rounded-md
              mt-4
            "
          />

          <div
            className="
              skeleton
              h-2.5
              w-32
              rounded
              mt-3
            "
          />
        </div>

        <div
          className="
            skeleton
            w-10
            h-10
            rounded-xl
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   Stat Card
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  color = "green",
  subtitle,
  loading = false,
}) {
  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return <StatCardSkeleton />;
  }

  /* =======================================================
     Color
  ======================================================= */

  const config = COLOR_CONFIG[color] || COLOR_CONFIG.green;

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className="
        relative
        overflow-hidden

        rounded-2xl
        border

        p-5

        min-h-[145px]

        cursor-default
      "
      style={{
        background: "var(--bg-card, #0f172a)",

        borderColor: "var(--bg-border, rgba(148,163,184,0.12))",

        boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
      }}
    >
      {/* ===================================================
          Background Glow
      =================================================== */}

      <div
        className="
          absolute
          -right-10
          -top-10

          w-28
          h-28

          rounded-full

          pointer-events-none
        "
        style={{
          background: `radial-gradient(
            circle,
            ${config.glow},
            transparent 70%
          )`,
        }}
      />

      {/* ===================================================
          Content
      =================================================== */}

      <div
        className="
          relative

          flex
          items-start
          justify-between

          gap-4
        "
      >
        {/* =================================================
            Information
        ================================================= */}

        <div className="min-w-0 flex-1">
          {/* Title */}

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
            "
            style={{
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            {title}
          </p>

          {/* Value */}

          <h2
            className="
              text-3xl
              font-bold
              tracking-tight

              mt-3
            "
            style={{
              color: "var(--text-primary, #f8fafc)",
            }}
          >
            {value ?? 0}
          </h2>

          {/* Subtitle */}

          {subtitle && (
            <p
              className="
                text-[10px]
                mt-2
                leading-relaxed
              "
              style={{
                color: "var(--text-faint, #64748b)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* =================================================
            Icon
        ================================================= */}

        {Icon && (
          <div
            className="
              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-xl

              flex-shrink-0
            "
            style={{
              color: config.color,

              background: config.background,

              border: `1px solid ${config.border}`,
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* ===================================================
          Bottom Accent
      =================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-5
          right-5

          h-px
        "
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${config.color}35,
            transparent
          )`,
        }}
      />
    </motion.div>
  );
}

export default StatCard;
