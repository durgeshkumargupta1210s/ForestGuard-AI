import {
  X,
  Bell,
  MapPinned,
  ShieldAlert,
  CalendarDays,
  Bot,
  CircleCheck,
  Activity,
  FileSearch,
} from "lucide-react";

function AlertDetailsModal({ open, onClose, alert }) {
  if (!open || !alert) return null;

  /* =========================================================
     NORMALIZE ALERT DATA
  ========================================================= */

  const regionName = alert.region?.name || alert.regionName || "Unknown Region";

  const regionId = alert.region?.regionId || "";

  const riskLevel =
    alert.riskLevel ||
    alert.riskClassification?.riskLevel ||
    alert.riskClassification?.level ||
    "Unknown";

  const resolved =
    alert.resolved === true ||
    String(alert.status || "").toLowerCase() === "resolved";

  const alertType = alert.type || "general";

  /*
   * Alert service currently stores the Gemini explanation
   * directly inside `message`, so check that before
   * falling back to explainability.summary.
   */
  const explanation =
    alert.explainability?.summary ||
    alert.message ||
    alert.analysisId?.explainability?.summary ||
    "No AI explanation available.";

  /* =========================================================
     RISK STYLING
  ========================================================= */

  const normalizedRisk = String(riskLevel).toLowerCase();

  const isCritical = normalizedRisk === "critical" || normalizedRisk === "high";

  const isWarning = normalizedRisk === "medium" || normalizedRisk === "warning";

  const riskColor = isCritical ? "#f87171" : isWarning ? "#fbbf24" : "#4ade80";

  const riskBackground = isCritical
    ? "rgba(239,68,68,0.10)"
    : isWarning
      ? "rgba(245,158,11,0.10)"
      : "rgba(34,197,94,0.10)";

  const riskBorder = isCritical
    ? "rgba(239,68,68,0.25)"
    : isWarning
      ? "rgba(245,158,11,0.25)"
      : "rgba(34,197,94,0.25)";

  /* =========================================================
     RECOMMENDATIONS
  ========================================================= */

  const recommendations = isCritical
    ? [
        "Inspect the affected forest region as soon as possible.",
        "Notify the responsible forest officials.",
        "Continue high-frequency satellite monitoring.",
        "Run another AI analysis to confirm vegetation changes.",
      ]
    : isWarning
      ? [
          "Continue satellite monitoring of the region.",
          "Schedule another AI analysis during the next monitoring cycle.",
          "Review vegetation changes for unusual activity.",
          "Escalate to forest officials if the risk level increases.",
        ]
      : [
          "Continue routine satellite monitoring.",
          "Maintain the regular AI analysis schedule.",
          "Preserve the current analysis for future comparison.",
        ];

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        backdrop-blur-sm
        flex
        justify-center
        items-center
        z-50
        p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          shadow-2xl
        "
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            sticky
            top-0
            z-10
            flex
            justify-between
            items-center
            px-6
            py-5
            border-b
          "
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--bg-border)",
          }}
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
                background: riskBackground,
                border: `1px solid ${riskBorder}`,
              }}
            >
              <Bell
                size={18}
                style={{
                  color: riskColor,
                }}
              />
            </div>

            <div>
              <h2
                className="text-lg font-bold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Alert Details
              </h2>

              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                ForestGuard AI Risk Notification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-xl
              transition-colors
              hover:bg-slate-800
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* ===================================================
            BODY
        =================================================== */}

        <div className="p-6 space-y-5">
          {/* =================================================
              RISK BANNER
          ================================================= */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
              p-4
              rounded-xl
              border
            "
            style={{
              background: riskBackground,
              borderColor: riskBorder,
            }}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert
                size={22}
                style={{
                  color: riskColor,
                }}
              />

              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Detected Risk
                </p>

                <p
                  className="text-lg font-bold"
                  style={{
                    color: riskColor,
                  }}
                >
                  {riskLevel}
                </p>
              </div>
            </div>

            <span
              className={resolved ? "badge badge-safe" : "badge badge-critical"}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  resolved ? "bg-green-400" : "bg-red-400"
                }`}
              />

              {resolved ? "Resolved" : "Active"}
            </span>
          </div>

          {/* =================================================
              SUMMARY GRID
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Region */}

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPinned
                  size={16}
                  style={{
                    color: "#4ade80",
                  }}
                />

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Region
                </span>
              </div>

              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {regionName}
              </p>

              {regionId && (
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  {regionId}
                </p>
              )}
            </div>

            {/* Risk */}

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert
                  size={16}
                  style={{
                    color: riskColor,
                  }}
                />

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Risk Level
                </span>
              </div>

              <span
                className={`badge ${
                  isCritical
                    ? "badge-critical"
                    : isWarning
                      ? "badge-warning"
                      : "badge-safe"
                }`}
              >
                {riskLevel}
              </span>
            </div>

            {/* Date */}

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays
                  size={16}
                  style={{
                    color: "#60a5fa",
                  }}
                />

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Alert Time
                </span>
              </div>

              <p
                className="text-sm"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {alert.createdAt
                  ? new Date(alert.createdAt).toLocaleString("en-IN")
                  : "Unknown"}
              </p>
            </div>

            {/* Type */}

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity
                  size={16}
                  style={{
                    color: "#c084fc",
                  }}
                />

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Alert Type
                </span>
              </div>

              <p
                className="text-sm font-medium capitalize"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {alertType}
              </p>
            </div>
          </div>

          {/* =================================================
              ALERT MESSAGE
          ================================================= */}

          {alert.message && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell
                  size={15}
                  style={{
                    color: "#fbbf24",
                  }}
                />

                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  Alert Message
                </h3>
              </div>

              <p
                className="text-sm leading-6"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {alert.message}
              </p>
            </div>
          )}

          {/* =================================================
              AI EXPLANATION
          ================================================= */}

          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--bg-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bot
                size={17}
                style={{
                  color: "#fbbf24",
                }}
              />

              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  Gemini AI Explanation
                </h3>

                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  AI-generated forest risk interpretation
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-7"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {explanation}
            </p>
          </div>

          {/* =================================================
              RECOMMENDED ACTIONS
          ================================================= */}

          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.20)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CircleCheck
                size={17}
                style={{
                  color: "#4ade80",
                }}
              />

              <h3
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Recommended Actions
              </h3>
            </div>

            <ul
              className="
                list-disc
                ml-5
                space-y-2
                text-sm
              "
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>

          {/* =================================================
              LINKED ANALYSIS
          ================================================= */}

          {alert.analysisId && (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                p-4
              "
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <FileSearch
                size={17}
                style={{
                  color: "#60a5fa",
                }}
              />

              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Linked Analysis
                </p>

                <p
                  className="text-xs font-mono mt-0.5"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {typeof alert.analysisId === "object"
                    ? alert.analysisId._id
                    : alert.analysisId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div
          className="
            flex
            justify-end
            px-6
            py-4
            border-t
          "
          style={{
            borderColor: "var(--bg-border)",
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailsModal;
