import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";

function RiskScoreCard({ riskLevel, riskScore }) {
  /* =====================================================
     Normalize Risk Level
  ===================================================== */

  const normalized = String(riskLevel || "Unknown")
    .trim()
    .toLowerCase();

  let displayLevel = "Unknown";
  let color = "#60a5fa";
  let background = "rgba(59,130,246,0.10)";
  let border = "rgba(59,130,246,0.20)";

  let description = "Risk level has not been determined yet.";

  let StatusIcon = Activity;

  /* =====================================================
     High / Critical
  ===================================================== */

  if (normalized === "high" || normalized === "critical") {
    displayLevel = normalized === "critical" ? "Critical" : "High";

    color = "#ef4444";

    background = "rgba(239,68,68,0.10)";

    border = "rgba(239,68,68,0.22)";

    description =
      "High forest-risk indicators detected. Immediate monitoring and verification are recommended.";

    StatusIcon = ShieldAlert;
  } else if (normalized === "medium" || normalized === "warning") {

  /* =====================================================
     Medium / Warning
  ===================================================== */
    displayLevel = normalized === "warning" ? "Warning" : "Medium";

    color = "#f59e0b";

    background = "rgba(245,158,11,0.10)";

    border = "rgba(245,158,11,0.22)";

    description =
      "Moderate forest-risk indicators detected. Continue monitoring for significant changes.";

    StatusIcon = AlertTriangle;
  } else if (normalized === "low" || normalized === "safe") {

  /* =====================================================
     Low / Safe
  ===================================================== */
    displayLevel = normalized === "safe" ? "Safe" : "Low";

    color = "#22c55e";

    background = "rgba(34,197,94,0.10)";

    border = "rgba(34,197,94,0.22)";

    description = "No major forest-risk indicators are currently detected.";

    StatusIcon = CheckCircle2;
  }

  /* =====================================================
     Risk Score

     Backend riskScore normally:
     0.82 → 82%
  ===================================================== */

  const rawScore = Number(riskScore);

  const normalizedScore = Number.isFinite(rawScore)
    ? rawScore <= 1
      ? rawScore * 100
      : rawScore
    : null;

  const score =
    normalizedScore !== null
      ? Math.max(0, Math.min(100, normalizedScore))
      : null;

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
              background,
              border: `1px solid ${border}`,
            }}
          >
            <ShieldAlert size={20} style={{ color }} />
          </div>

          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Risk Assessment
            </h3>

            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
              }}
            >
              AI forest risk classification
            </p>
          </div>
        </div>

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
            background,
            border: `1px solid ${border}`,
          }}
        >
          {displayLevel}
        </span>
      </div>

      {/* =================================================
          Main Risk Display
      ================================================= */}

      <div
        className="
          rounded-xl
          p-6
          text-center
        "
        style={{
          background,
          border: `1px solid ${border}`,
        }}
      >
        <div
          className="
            w-14
            h-14
            mx-auto
            rounded-2xl
            flex
            items-center
            justify-center
            mb-4
          "
          style={{
            background: `${color}15`,

            border: `1px solid ${color}30`,
          }}
        >
          <StatusIcon size={27} style={{ color }} />
        </div>

        <p
          className="
            text-xs
            uppercase
            tracking-widest
            font-semibold
          "
          style={{
            color: "var(--text-muted)",
          }}
        >
          Current Risk Level
        </p>

        <h2
          className="
            text-4xl
            font-bold
            tracking-tight
            mt-2
          "
          style={{ color }}
        >
          {displayLevel}
        </h2>

        {/* Risk Score */}

        {score !== null && (
          <div className="mt-4">
            <div
              className="
                flex
                justify-between
                text-xs
                mb-2
              "
            >
              <span
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Risk Score
              </span>

              <span className="font-semibold" style={{ color }}>
                {score.toFixed(0)}/100
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
                  width: `${score}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          Explanation
      ================================================= */}

      <div
        className="
          flex
          items-start
          gap-2.5
          mt-4
          p-3.5
          rounded-xl
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
          style={{ color }}
        />

        <div>
          <p
            className="
              text-xs
              font-semibold
            "
            style={{ color }}
          >
            {displayLevel} Risk
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

export default RiskScoreCard;
