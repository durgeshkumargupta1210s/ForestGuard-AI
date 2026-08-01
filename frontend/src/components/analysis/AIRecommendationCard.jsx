import {
  Bot,
  Sparkles,
  TriangleAlert,
  CheckCircle2,
  Satellite,
  FileText,
  Bell,
  RefreshCw,
} from "lucide-react";

function AIRecommendationCard({ analysis }) {
  if (!analysis) return null;

  /* =====================================================
     AI Explanation
  ===================================================== */

  const explanation =
    analysis.explainability?.summary ||
    analysis.explainability?.primaryFactor ||
    "AI explanation is not available for this analysis.";

  /* =====================================================
     Normalize Risk Level

     Supports:
     High / Critical
     Medium / Warning
     Low / Safe
  ===================================================== */

  const rawRisk =
    analysis.riskClassification?.riskLevel ||
    analysis.riskClassification?.level ||
    analysis.riskLevel ||
    "Unknown";

  const normalizedRisk = String(rawRisk).trim().toLowerCase();

  let displayRisk = "Unknown";

  let color = "#60a5fa";

  let background = "rgba(59,130,246,0.08)";

  let border = "rgba(59,130,246,0.20)";

  let recommendationTitle = "Continue Monitoring";

  let recommendationDescription =
    "Continue monitoring the selected forest region and perform periodic satellite analysis.";

  /* =====================================================
     Risk-specific configuration
  ===================================================== */

  if (normalizedRisk === "high" || normalizedRisk === "critical") {
    displayRisk = normalizedRisk === "critical" ? "Critical" : "High";

    color = "#ef4444";

    background = "rgba(239,68,68,0.08)";

    border = "rgba(239,68,68,0.22)";

    recommendationTitle = "Immediate Attention Recommended";

    recommendationDescription =
      "Significant forest-risk indicators were detected. Verify the affected area and notify responsible forest authorities.";
  } else if (normalizedRisk === "medium" || normalizedRisk === "warning") {
    displayRisk = normalizedRisk === "warning" ? "Warning" : "Medium";

    color = "#f59e0b";

    background = "rgba(245,158,11,0.08)";

    border = "rgba(245,158,11,0.22)";

    recommendationTitle = "Enhanced Monitoring Recommended";

    recommendationDescription =
      "Moderate forest-risk indicators were detected. Schedule another analysis and monitor vegetation changes closely.";
  } else if (normalizedRisk === "low" || normalizedRisk === "safe") {
    displayRisk = normalizedRisk === "safe" ? "Safe" : "Low";

    color = "#22c55e";

    background = "rgba(34,197,94,0.08)";

    border = "rgba(34,197,94,0.22)";

    recommendationTitle = "Continue Routine Monitoring";

    recommendationDescription =
      "The region currently shows low forest-risk indicators. Continue routine satellite monitoring.";
  }

  /* =====================================================
     Dynamic Recommended Actions
  ===================================================== */

  const getActions = () => {
    if (normalizedRisk === "high" || normalizedRisk === "critical") {
      return [
        {
          icon: Bell,
          text: "Notify responsible forest officials about the detected risk.",
        },
        {
          icon: Satellite,
          text: "Verify the affected area using recent satellite observations.",
        },
        {
          icon: RefreshCw,
          text: "Run another analysis to confirm vegetation change.",
        },
        {
          icon: FileText,
          text: "Generate and preserve the analysis report for investigation.",
        },
      ];
    }

    if (normalizedRisk === "medium" || normalizedRisk === "warning") {
      return [
        {
          icon: Satellite,
          text: "Continue frequent satellite monitoring of the region.",
        },
        {
          icon: RefreshCw,
          text: "Schedule another AI analysis to track vegetation change.",
        },
        {
          icon: Bell,
          text: "Escalate to forest officials if the risk level increases.",
        },
        {
          icon: FileText,
          text: "Generate a report for future comparison.",
        },
      ];
    }

    return [
      {
        icon: Satellite,
        text: "Continue routine satellite monitoring.",
      },
      {
        icon: RefreshCw,
        text: "Schedule periodic forest analysis.",
      },
      {
        icon: CheckCircle2,
        text: "Maintain the current monitoring strategy.",
      },
      {
        icon: FileText,
        text: "Preserve analysis reports for historical comparison.",
      },
    ];
  };

  const actions = getActions();

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
          mb-5
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
            <Bot
              size={20}
              style={{
                color: "#4ade80",
              }}
            />
          </div>

          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              AI Recommendation
            </h3>

            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Gemini-powered analysis insight
            </p>
          </div>
        </div>

        {/* Risk Badge */}

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
          {displayRisk} Risk
        </span>
      </div>

      {/* =================================================
          Gemini AI Summary
      ================================================= */}

      <div
        className="
          rounded-xl
          p-4
        "
        style={{
          background: "var(--bg-primary)",

          border: "1px solid var(--bg-border)",
        }}
      >
        <div
          className="
            flex
            items-center
            gap-2
            mb-3
          "
        >
          <Sparkles
            size={16}
            style={{
              color: "#fbbf24",
            }}
          />

          <span
            className="
              text-xs
              font-semibold
            "
            style={{
              color: "var(--text-primary)",
            }}
          >
            Gemini AI Summary
          </span>
        </div>

        <p
          className="
            text-xs
            leading-6
          "
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {explanation}
        </p>
      </div>

      {/* =================================================
          Main Recommendation
      ================================================= */}

      <div
        className="
          mt-4
          rounded-xl
          p-4
        "
        style={{
          background,
          border: `1px solid ${border}`,
        }}
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              flex-shrink-0
            "
            style={{
              background: `${color}15`,
            }}
          >
            {normalizedRisk === "low" || normalizedRisk === "safe" ? (
              <CheckCircle2 size={18} style={{ color }} />
            ) : (
              <TriangleAlert size={18} style={{ color }} />
            )}
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
              "
              style={{
                color,
              }}
            >
              {recommendationTitle}
            </p>

            <p
              className="
                text-xs
                leading-5
                mt-1
              "
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {recommendationDescription}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          Recommended Actions
      ================================================= */}

      <div className="mt-5">
        <p
          className="
            text-[10px]
            uppercase
            tracking-widest
            font-semibold
            mb-3
          "
          style={{
            color: "var(--text-muted)",
          }}
        >
          Recommended Actions
        </p>

        <div className="space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <div
                key={index}
                className="
                    flex
                    items-start
                    gap-3
                    p-3
                    rounded-lg
                    transition-colors
                  "
                style={{
                  background: "var(--bg-primary)",

                  border: "1px solid var(--bg-border)",
                }}
              >
                <div
                  className="
                      w-7
                      h-7
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  style={{
                    background: `${color}10`,
                  }}
                >
                  <Icon
                    size={13}
                    style={{
                      color,
                    }}
                  />
                </div>

                <p
                  className="
                      text-xs
                      leading-5
                    "
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {action.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================
          AI Footer
      ================================================= */}

      <div
        className="
          mt-5
          pt-4
          flex
          items-center
          justify-between
          border-t
        "
        style={{
          borderColor: "var(--bg-border)",
        }}
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <div
            className="
              w-2
              h-2
              rounded-full
              bg-green-500
            "
          />

          <span
            className="text-[10px]"
            style={{
              color: "var(--text-muted)",
            }}
          >
            AI Analysis Complete
          </span>
        </div>

        <span
          className="text-[10px]"
          style={{
            color: "var(--text-muted)",
          }}
        >
          ForestGuard AI
        </span>
      </div>
    </div>
  );
}

export default AIRecommendationCard;
