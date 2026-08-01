import { Target, CheckCircle2, AlertTriangle } from "lucide-react";

function ConfidenceCard({ confidence = 0 }) {
  /* =====================================================
     Normalize Confidence

     Backend normally returns:
     0.92 → 92%

     Also supports older data:
     92 → 92%
  ===================================================== */

  const rawValue = Number(confidence);

  const normalizedValue = Number.isFinite(rawValue)
    ? rawValue <= 1
      ? rawValue * 100
      : rawValue
    : 0;

  const value = Math.max(
    0,
    Math.min(100, normalizedValue)
  );

  /* =====================================================
     Confidence Status
  ===================================================== */

  let color = "#ef4444";
  let status = "Low Confidence";
  let description =
    "Prediction confidence is relatively low. Additional data may improve reliability.";

  if (value >= 80) {
    color = "#22c55e";
    status = "High Confidence";
    description =
      "The AI model has high confidence in this forest risk prediction.";
  } else if (value >= 50) {
    color = "#f59e0b";
    status = "Moderate Confidence";
    description =
      "The prediction has moderate confidence and should be monitored.";
  }

  /* =====================================================
     Circular Progress
  ===================================================== */

  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (value / 100) * circumference;

  return (
    <div className="fg-card p-5 h-full">

      {/* Header */}

      <div className="flex items-center justify-between mb-5">

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
              background: `${color}18`,
              border: `1px solid ${color}35`,
            }}
          >
            <Target
              size={19}
              style={{ color }}
            />
          </div>

          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Confidence Score
            </h3>

            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
              }}
            >
              AI prediction reliability
            </p>
          </div>

        </div>

        {/* Status */}

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
          Circular Confidence Indicator
      ================================================= */}

      <div className="flex justify-center py-3">

        <div
          className="
            relative
            w-40
            h-40
          "
        >
          <svg
            className="
              w-40
              h-40
              -rotate-90
            "
            viewBox="0 0 160 160"
          >

            {/* Background Ring */}

            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--bg-border)"
              strokeWidth="9"
            />

            {/* Progress Ring */}

            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition:
                  "stroke-dashoffset 0.8s ease",
              }}
            />

          </svg>

          {/* Center Value */}

          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
            "
          >
            <p
              className="
                text-3xl
                font-bold
                tracking-tight
              "
              style={{ color }}
            >
              {value.toFixed(1)}%
            </p>

            <p
              className="text-xs mt-1"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Confidence
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          Status Description
      ================================================= */}

      <div
        className="
          mt-3
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

        {value >= 80 ? (
          <CheckCircle2
            size={15}
            className="flex-shrink-0 mt-0.5"
            style={{ color }}
          />
        ) : (
          <AlertTriangle
            size={15}
            className="flex-shrink-0 mt-0.5"
            style={{ color }}
          />
        )}

        <div>
          <p
            className="text-xs font-semibold"
            style={{ color }}
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

      {/* =================================================
          Confidence Scale
      ================================================= */}

      <div className="mt-4">

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
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>

        <div
          className="
            relative
            h-1.5
            rounded-full
            overflow-hidden
          "
          style={{
            background:
              "var(--bg-border)",
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
              width: `${value}%`,
              background: color,
            }}
          />
        </div>

      </div>

    </div>
  );
}

export default ConfidenceCard;