import {
  Leaf,
  Bot,
  Zap,
  BarChart3,
  Radio,
  ShieldAlert,
  Target,
  Trees,
  Activity,
} from "lucide-react";

import Modal from "../common/Modal";

function AnalysisDetailsModal({ open, onClose, analysis }) {
  if (!open || !analysis) return null;

  /* =====================================================
     Risk
  ===================================================== */

  const riskLevel =
    analysis.riskClassification?.riskLevel ||
    analysis.riskClassification?.level ||
    analysis.riskLevel ||
    "Unknown";

  const normalizedRisk = String(riskLevel).trim().toLowerCase();

  let riskColor = "#60a5fa";
  let riskBg = "rgba(59,130,246,0.10)";
  let riskBorder = "rgba(59,130,246,0.22)";

  if (normalizedRisk === "high" || normalizedRisk === "critical") {
    riskColor = "#ef4444";
    riskBg = "rgba(239,68,68,0.10)";
    riskBorder = "rgba(239,68,68,0.22)";
  } else if (normalizedRisk === "medium" || normalizedRisk === "warning") {
    riskColor = "#f59e0b";
    riskBg = "rgba(245,158,11,0.10)";
    riskBorder = "rgba(245,158,11,0.22)";
  } else if (normalizedRisk === "low" || normalizedRisk === "safe") {
    riskColor = "#22c55e";
    riskBg = "rgba(34,197,94,0.10)";
    riskBorder = "rgba(34,197,94,0.22)";
  }

  /* =====================================================
     Confidence
     Supports:
     0.92 -> 92%
     92   -> 92%
  ===================================================== */

  const rawConfidence =
    analysis.riskClassification?.confidenceScore ??
    analysis.confidenceScore ??
    0;

  const confidenceNumber = Number(rawConfidence);

  const confidence = Number.isFinite(confidenceNumber)
    ? confidenceNumber <= 1
      ? confidenceNumber * 100
      : confidenceNumber
    : 0;

  /* =====================================================
     Vegetation Loss
  ===================================================== */

  const lossPct =
    Number(
      analysis.riskClassification?.vegetationLossPercentage ??
        analysis.vegetationLossPercentage ??
        0,
    ) || 0;

  /* =====================================================
     Risk Score
  ===================================================== */

  const rawRiskScore = Number(analysis.riskClassification?.riskScore ?? 0);

  const riskScore = Number.isFinite(rawRiskScore)
    ? rawRiskScore <= 1
      ? rawRiskScore * 100
      : rawRiskScore
    : 0;

  /* =====================================================
     NDVI Compatibility

     Supports:
     [0.52]
     0.52
     { mean: 0.52, min, max, stdDev }
  ===================================================== */

  const ndviData = analysis.ndvi;

  let ndviMean = 0;
  let ndviMin = "—";
  let ndviMax = "—";
  let ndviStd = "—";

  if (Array.isArray(ndviData)) {
    const firstValue = Number(ndviData[0]);

    ndviMean = Number.isFinite(firstValue) ? firstValue : 0;
  } else if (ndviData && typeof ndviData === "object") {
    const mean = Number(ndviData.mean);

    ndviMean = Number.isFinite(mean) ? mean : 0;

    ndviMin = ndviData.min ?? "—";

    ndviMax = ndviData.max ?? "—";

    ndviStd = ndviData.stdDev ?? "—";
  } else {
    const numericNDVI = Number(ndviData);

    ndviMean = Number.isFinite(numericNDVI) ? numericNDVI : 0;
  }

  /* =====================================================
     Change Detection
  ===================================================== */

  const change = analysis.changeDetection || {};

  const decreaseCount = change.decreaseCount ?? 0;

  const stableCount = change.stableCount ?? 0;

  const increaseCount = change.increaseCount ?? 0;

  /* =====================================================
     Satellite Information
  ===================================================== */

  const satData = analysis.satelliteData || {};

  const isFallback =
    satData.fallbackUsed ?? analysis.detectionMethod === "fallback";

  const dataSource =
    satData.dataSource ||
    (isFallback ? "Algorithmic / Fallback" : "Sentinel-2");

  /* =====================================================
     Execution Time
  ===================================================== */

  const executionTime =
    analysis.executionTime ||
    (analysis.processingTime
      ? `${(analysis.processingTime / 1000).toFixed(2)}s`
      : "—");

  /* =====================================================
     AI Explanation
  ===================================================== */

  const aiExplanation =
    analysis.explainability?.summary ||
    analysis.explainability?.primaryFactor ||
    "No AI explanation generated for this analysis.";

  /* =====================================================
     Formatting helper
  ===================================================== */

  const formatNDVI = (value) => {
    if (value === "—" || value === null || value === undefined) {
      return "—";
    }

    const number = Number(value);

    return Number.isFinite(number) ? number.toFixed(3) : value;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        analysis.regionName ||
        analysis.regionId?.name ||
        analysis.region?.name ||
        "Forest Analysis Details"
      }
      subtitle={`Analysis ID: ${analysis._id || "—"} · ${new Date(
        analysis.createdAt || analysis.timestamp || Date.now(),
      ).toLocaleString("en-IN")}`}
      size="xl"
    >
      <div className="space-y-5">
        {/* =================================================
            Data Source Banner
        ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-3
            p-4
            rounded-xl
          "
          style={{
            background: isFallback
              ? "rgba(245,158,11,0.07)"
              : "rgba(34,197,94,0.07)",

            border: `1px solid ${
              isFallback ? "rgba(245,158,11,0.22)" : "rgba(34,197,94,0.22)"
            }`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
              "
              style={{
                background: isFallback
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(34,197,94,0.12)",
              }}
            >
              <Radio
                size={17}
                style={{
                  color: isFallback ? "#fbbf24" : "#4ade80",
                }}
              />
            </div>

            <div>
              <p
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Data Source
              </p>

              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {dataSource}
              </p>
            </div>

            <span
              className="
                text-[10px]
                px-2.5
                py-1
                rounded-lg
                font-semibold
              "
              style={{
                color: isFallback ? "#fbbf24" : "#4ade80",

                background: isFallback
                  ? "rgba(245,158,11,0.10)"
                  : "rgba(34,197,94,0.10)",
              }}
            >
              {isFallback ? "Fallback" : "Satellite"}
            </span>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              text-xs
            "
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <Zap
              size={15}
              style={{
                color: "#fbbf24",
              }}
            />
            Processing Time:
            <strong>{executionTime}</strong>
          </div>
        </div>

        {/* =================================================
            Main Metrics
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-3
          "
        >
          {/* Risk */}

          <MetricCard
            icon={ShieldAlert}
            title="Risk Level"
            value={riskLevel}
            color={riskColor}
          />

          {/* Confidence */}

          <MetricCard
            icon={Target}
            title="Confidence"
            value={`${confidence.toFixed(1)}%`}
            color={
              confidence >= 80
                ? "#22c55e"
                : confidence >= 50
                  ? "#f59e0b"
                  : "#ef4444"
            }
          />

          {/* Vegetation Loss */}

          <MetricCard
            icon={Trees}
            title="Vegetation Loss"
            value={`${lossPct.toFixed(1)}%`}
            color={lossPct > 10 ? "#ef4444" : "#22c55e"}
          />

          {/* NDVI */}

          <MetricCard
            icon={Leaf}
            title="Mean NDVI"
            value={formatNDVI(ndviMean)}
            color={
              ndviMean >= 0.7
                ? "#22c55e"
                : ndviMean >= 0.4
                  ? "#f59e0b"
                  : "#ef4444"
            }
          />
        </div>

        {/* =================================================
            Risk Score
        ================================================= */}

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-primary)",

            border: "1px solid var(--bg-border)",
          }}
        >
          <div
            className="
              flex
              items-center
              justify-between
              mb-3
            "
          >
            <div className="flex items-center gap-2">
              <Activity
                size={15}
                style={{
                  color: riskColor,
                }}
              />

              <h4
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
                style={{
                  color: "var(--text-muted)",
                }}
              >
                AI Risk Score
              </h4>
            </div>

            <span
              className="text-sm font-bold"
              style={{
                color: riskColor,
              }}
            >
              {riskScore.toFixed(0)}/100
            </span>
          </div>

          <div
            className="
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
                width: `${Math.min(100, riskScore)}%`,

                background: riskColor,
              }}
            />
          </div>
        </div>

        {/* =================================================
            Model 1 - NDVI
        ================================================= */}

        <div
          className="rounded-xl p-4"
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
              mb-4
            "
          >
            <Leaf
              size={16}
              style={{
                color: "#4ade80",
              }}
            />

            <h4
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
              "
              style={{
                color: "var(--text-muted)",
              }}
            >
              Model 1: NDVI Vegetation Analysis
            </h4>
          </div>

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-4
              gap-3
            "
          >
            <SmallMetric title="Mean" value={formatNDVI(ndviMean)} />

            <SmallMetric title="Minimum" value={formatNDVI(ndviMin)} />

            <SmallMetric title="Maximum" value={formatNDVI(ndviMax)} />

            <SmallMetric title="Std. Deviation" value={formatNDVI(ndviStd)} />
          </div>
        </div>

        {/* =================================================
            Model 2 - Change Detection
        ================================================= */}

        <div
          className="rounded-xl p-4"
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
              mb-4
            "
          >
            <BarChart3
              size={16}
              style={{
                color: "#60a5fa",
              }}
            />

            <h4
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
              "
              style={{
                color: "var(--text-muted)",
              }}
            >
              Model 2: Satellite Change Detection
            </h4>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-3
            "
          >
            <ChangeCard
              title="Decreased Pixels"
              value={decreaseCount}
              color="#ef4444"
            />

            <ChangeCard
              title="Stable Pixels"
              value={stableCount}
              color="#60a5fa"
            />

            <ChangeCard
              title="Increased Pixels"
              value={increaseCount}
              color="#22c55e"
            />
          </div>
        </div>

        {/* =================================================
            Model 3 - Risk Classification
        ================================================= */}

        <div
          className="rounded-xl p-4"
          style={{
            background: riskBg,
            border: `1px solid ${riskBorder}`,
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
            <ShieldAlert
              size={16}
              style={{
                color: riskColor,
              }}
            />

            <h4
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
              "
              style={{
                color: "var(--text-muted)",
              }}
            >
              Model 3: Forest Risk Classification
            </h4>
          </div>

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Predicted Risk
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mt-1
                "
                style={{
                  color: riskColor,
                }}
              >
                {riskLevel}
              </p>
            </div>

            <div className="text-right">
              <p
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Model Confidence
              </p>

              <p
                className="
                  text-xl
                  font-bold
                  mt-1
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {confidence.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            Gemini AI
        ================================================= */}

        <div
          className="rounded-xl p-5"
          style={{
            background: "rgba(168,85,247,0.06)",

            border: "1px solid rgba(168,85,247,0.18)",
          }}
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-3
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
              "
              style={{
                background: "rgba(168,85,247,0.12)",
              }}
            >
              <Bot
                size={18}
                style={{
                  color: "#c084fc",
                }}
              />
            </div>

            <div>
              <h4
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Gemini AI Explanation
              </h4>

              <p
                className="text-[10px]"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                AI-generated interpretation
              </p>
            </div>
          </div>

          <p
            className="
              text-sm
              leading-6
            "
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {aiExplanation}
          </p>
        </div>

        {/* =================================================
            Footer
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            pt-3
          "
        >
          <span
            className="text-[10px]"
            style={{
              color: "var(--text-muted)",
            }}
          >
            ForestGuard AI Analysis
          </span>

          <button onClick={onClose} className="btn btn-primary">
            Close Analysis
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =====================================================
   Metric Card
===================================================== */

function MetricCard({ icon: Icon, title, value, color }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-primary)",

        border: "1px solid var(--bg-border)",
      }}
    >
      <div
        className="
          flex
          items-center
          justify-between
          mb-3
        "
      >
        <span
          className="text-xs"
          style={{
            color: "var(--text-muted)",
          }}
        >
          {title}
        </span>

        <Icon size={15} style={{ color }} />
      </div>

      <p
        className="
          text-lg
          font-bold
        "
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   Small Metric
===================================================== */

function SmallMetric({ title, value }) {
  return (
    <div
      className="
        p-3
        rounded-lg
      "
      style={{
        background: "var(--bg-card)",

        border: "1px solid var(--bg-border)",
      }}
    >
      <p
        className="text-[10px]"
        style={{
          color: "var(--text-muted)",
        }}
      >
        {title}
      </p>

      <p
        className="
          text-sm
          font-semibold
          mt-1
        "
        style={{
          color: "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   Change Detection Card
===================================================== */

function ChangeCard({ title, value, color }) {
  return (
    <div
      className="
        p-3.5
        rounded-xl
      "
      style={{
        background: `${color}0D`,

        border: `1px solid ${color}25`,
      }}
    >
      <p
        className="text-xs"
        style={{
          color: "var(--text-muted)",
        }}
      >
        {title}
      </p>

      <p
        className="
          text-lg
          font-bold
          mt-1
        "
        style={{ color }}
      >
        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}

export default AnalysisDetailsModal;
