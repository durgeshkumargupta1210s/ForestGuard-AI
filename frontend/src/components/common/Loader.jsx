/**
 * ForestGuard reusable loading components.
 *
 * Exports:
 * - Spinner
 * - DotsLoader
 * - TableSkeleton
 * - CardSkeleton
 * - StatCardSkeleton
 * - PageLoader
 * - default: Loader
 */

/* =========================================================
   Spinner
========================================================= */

export function Spinner({ size = 20, color = "#22c55e", thickness = 2.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
      style={{
        animation: "fg-spin 0.8s linear infinite",
        flexShrink: 0,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={thickness}
        opacity="0.18"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />

      <style>
        {`
          @keyframes fg-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </svg>
  );
}

/* =========================================================
   Dots Loader
========================================================= */

export function DotsLoader({ size = 6, color = "#22c55e" }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
            animation: "fg-dot-pulse 1.2s ease-in-out infinite",
            animationDelay: `${item * 0.15}s`,
          }}
        />
      ))}

      <style>
        {`
          @keyframes fg-dot-pulse {
            0%, 80%, 100% {
              transform: scale(0.7);
              opacity: 0.35;
            }

            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   Skeleton Block
========================================================= */

function SkeletonBlock({
  width = "100%",
  height = "14px",
  borderRadius = "8px",
  className = "",
}) {
  return (
    <div
      className={`fg-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    >
      <style>
        {`
          .fg-skeleton {
            position: relative;
            overflow: hidden;
            background: rgba(148, 163, 184, 0.10);
          }

          .fg-skeleton::after {
            content: "";
            position: absolute;
            inset: 0;

            transform: translateX(-100%);

            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.07),
              transparent
            );

            animation: fg-skeleton-wave 1.5s infinite;
          }

          @keyframes fg-skeleton-wave {
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   Table Skeleton
========================================================= */

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          style={{
            borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
          }}
        >
          {Array.from({ length: cols }).map((_, columnIndex) => (
            <td
              key={columnIndex}
              style={{
                padding: "16px",
              }}
            >
              <SkeletonBlock
                height="14px"
                width={
                  columnIndex === 0
                    ? "65%"
                    : columnIndex === cols - 1
                      ? "72px"
                      : "80%"
                }
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* =========================================================
   Generic Card Skeleton
========================================================= */

export function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: "var(--bg-card, #111827)",
        borderColor: "var(--bg-border, #1f2937)",
      }}
    >
      <div className="flex justify-between items-start mb-5">
        <SkeletonBlock width="44px" height="44px" borderRadius="12px" />

        <SkeletonBlock width="58px" height="22px" borderRadius="20px" />
      </div>

      <SkeletonBlock width="35%" height="28px" className="mb-3" />

      <SkeletonBlock width="60%" height="14px" />
    </div>
  );
}

/* =========================================================
   Stat Card Skeleton
========================================================= */

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "var(--bg-card, #111827)",
        borderColor: "var(--bg-border, #1f2937)",
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <SkeletonBlock width="42px" height="42px" borderRadius="12px" />

        <SkeletonBlock width="60px" height="20px" borderRadius="999px" />
      </div>

      <SkeletonBlock width="80px" height="30px" className="mb-3" />

      <SkeletonBlock width="120px" height="14px" className="mb-2" />

      <SkeletonBlock width="90px" height="10px" />
    </div>
  );
}

/* =========================================================
   Standard Loader
========================================================= */

function Loader({ text = "Loading...", size = 32, minHeight = "200px" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{
        minHeight,
        color: "var(--text-muted, #94a3b8)",
      }}
      role="status"
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size + 20,
          height: size + 20,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: size + 18,
            height: size + 18,
            background: "rgba(34, 197, 94, 0.08)",
            animation: "fg-loader-pulse 1.8s ease-in-out infinite",
          }}
        />

        <Spinner size={size} color="#22c55e" />
      </div>

      {text && (
        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--text-secondary, #cbd5e1)",
            }}
          >
            {text}
          </p>

          <div className="mt-3">
            <DotsLoader />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fg-loader-pulse {
            0%, 100% {
              transform: scale(0.9);
              opacity: 0.4;
            }

            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   Full Page Loader
========================================================= */

export function PageLoader({
  title = "ForestGuard",
  text = "Preparing your dashboard...",
}) {
  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        px-6
      "
      style={{
        background: "var(--bg-primary, #0b1220)",
      }}
    >
      <div className="text-center">
        {/* Brand Icon */}

        <div
          className="
            w-16
            h-16
            mx-auto
            mb-6
            rounded-2xl
            flex
            items-center
            justify-center
            border
          "
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            borderColor: "rgba(34, 197, 94, 0.20)",
            boxShadow: "0 0 40px rgba(34, 197, 94, 0.10)",
          }}
        >
          <Spinner size={32} color="#4ade80" />
        </div>

        <h2
          className="text-xl font-bold"
          style={{
            color: "var(--text-primary, #f8fafc)",
          }}
        >
          {title}
        </h2>

        <p
          className="text-sm mt-2 mb-5"
          style={{
            color: "var(--text-muted, #94a3b8)",
          }}
        >
          {text}
        </p>

        <DotsLoader />
      </div>
    </div>
  );
}

export default Loader;
