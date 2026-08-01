import { Trees, Leaf, AlertTriangle, CheckCircle2 } from "lucide-react";

function NDVIProgressCard({ ndvi }) {
  /* =====================================================
     Normalize NDVI

     Current backend:
     ndvi: [0.52]

     Also supports:
     ndvi: 0.52

     And older/object format:
     ndvi: { mean: 0.52 }
  ===================================================== */

  const getNDVIValue = () => {
    if (Array.isArray(ndvi)) {
      const firstValue = Number(ndvi[0]);

      return Number.isFinite(firstValue) ? firstValue : 0;
    }

    if (ndvi && typeof ndvi === "object") {
      const meanValue = Number(ndvi.mean);

      return Number.isFinite(meanValue) ? meanValue : 0;
    }

    const numericValue = Number(ndvi);

    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const rawValue = getNDVIValue();

  /*
   * NDVI normally ranges from -1 to +1.
   * Don't modify the actual value displayed.
   */
  const value = Math.max(-1, Math.min(1, rawValue));

  /*
   * Progress bar represents vegetation strength.
   * Negative NDVI is displayed as 0% vegetation strength.
   */
  const percentage = Math.max(0, Math.min(100, value * 100));

  /* =====================================================
     Vegetation Classification
  ===================================================== */

  let color = "#ef4444";
  let status = "Poor Vegetation";
  let description =
    "Low vegetation density detected. This region may require closer monitoring.";

  if (value >= 0.7) {
    color = "#22c55e";

    status = "Healthy Forest";

    description =
      "High vegetation density detected, indicating healthy forest coverage.";
  } else if (value >= 0.4) {
    color = "#f59e0b";

    status = "Moderate Vegetation";

    description =
      "Moderate vegetation density detected. Continue regular monitoring.";
  } else if (value >= 0.2) {
    color = "#f97316";

    status = "Sparse Vegetation";

    description =
      "Vegetation coverage is relatively sparse and may require attention.";
  }

  /* =====================================================
     Status Icon
  ===================================================== */

  const StatusIcon =
    value >= 0.7 ? CheckCircle2 : value >= 0.4 ? Leaf : AlertTriangle;

  return (
    <div className="fg-card p-5 h-full">
      {/* =================================================
          Header
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          mb-6
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
            "
            style={{
              background: "rgba(34,197,94,0.10)",

              border: "1px solid rgba(34,197,94,0.20)",
            }}
          >
            <Trees
              size={20}
              style={{
                color: "#4ade80",
              }}
            />
          </div>

          <div>
            <h3
              className="
                text-sm
                font-semibold
              "
              style={{
                color: "var(--text-primary)",
              }}
            >
              NDVI Index
            </h3>

            <p
              className="
                text-xs
                mt-0.5
              "
              style={{
                color: "var(--text-muted)",
              }}
            >
              Vegetation health indicator
            </p>
          </div>
        </div>

        {/* Current Status */}

        <span
          className="
            text-[10px]
            font-semibold
            px-2.5
            py-1
            rounded-lg
          "
          style={{
            color,

            background: `${color}12`,

            border: `1px solid ${color}25`,
          }}
        >
          {status}
        </span>
      </div>

      {/* =================================================
          NDVI Score
      ================================================= */}

      <div
        className="
          flex
          items-end
          justify-between
          mb-5
        "
      >
        <div>
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
            }}
          >
            Current NDVI
          </p>

          <p
            className="
              text-4xl
              font-bold
              tracking-tight
              mt-1
            "
            style={{
              color,
            }}
          >
            {value.toFixed(3)}
          </p>
        </div>

        <div
          className="
            w-11
            h-11
            rounded-xl
            flex
            items-center
            justify-center
          "
          style={{
            background: `${color}12`,

            border: `1px solid ${color}25`,
          }}
        >
          <StatusIcon
            size={20}
            style={{
              color,
            }}
          />
        </div>
      </div>

      {/* =================================================
          Vegetation Progress
      ================================================= */}

      <div>
        <div
          className="
            flex
            items-center
            justify-between
            mb-2
          "
        >
          <span
            className="text-xs"
            style={{
              color: "var(--text-muted)",
            }}
          >
            Vegetation Strength
          </span>

          <span
            className="
              text-xs
              font-semibold
            "
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div
          className="
            w-full
            h-2
            rounded-full
            overflow-hidden
          "
          style={{
            background: "var(--bg-border)",
          }}
        >
          <div
            className="
              h-full
              rounded-full
              transition-all
              duration-700
            "
            style={{
              width: `${percentage}%`,

              background: color,
            }}
          />
        </div>
      </div>

      {/* =================================================
          NDVI Scale
      ================================================= */}

      <div className="mt-5">
        <div
          className="
            flex
            justify-between
            text-[9px]
            mb-1.5
          "
          style={{
            color: "var(--text-muted)",
          }}
        >
          <span>Poor</span>

          <span>Sparse</span>

          <span>Moderate</span>

          <span>Healthy</span>
        </div>

        <div
          className="
            grid
            grid-cols-4
            gap-1
          "
        >
          <div
            className="
              h-1.5
              rounded-full
            "
            style={{
              background: "#ef4444",
            }}
          />

          <div
            className="
              h-1.5
              rounded-full
            "
            style={{
              background: "#f97316",
            }}
          />

          <div
            className="
              h-1.5
              rounded-full
            "
            style={{
              background: "#f59e0b",
            }}
          />

          <div
            className="
              h-1.5
              rounded-full
            "
            style={{
              background: "#22c55e",
            }}
          />
        </div>
      </div>

      {/* =================================================
          Description
      ================================================= */}

      <div
        className="
          mt-5
          p-3.5
          rounded-xl
          flex
          items-start
          gap-2.5
        "
        style={{
          background: `${color}0D`,

          border: `1px solid ${color}20`,
        }}
      >
        <StatusIcon
          size={15}
          className="
            flex-shrink-0
            mt-0.5
          "
          style={{
            color,
          }}
        />

        <div>
          <p
            className="
              text-xs
              font-semibold
            "
            style={{
              color,
            }}
          >
            {status}
          </p>

          <p
            className="
              text-[11px]
              leading-relaxed
              mt-1
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NDVIProgressCard;
