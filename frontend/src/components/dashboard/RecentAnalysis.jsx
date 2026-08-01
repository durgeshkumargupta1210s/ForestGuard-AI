import {
  MapPinned,
  CalendarDays,
  Activity,
  FileSearch,
} from "lucide-react";

/* =========================================================
   Risk Configuration
========================================================= */

const RISK_CONFIG = {
  Safe: {
    color: "#4ade80",
    background: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.14)",
  },

  Warning: {
    color: "#fbbf24",
    background: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
  },

  Critical: {
    color: "#f87171",
    background: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.14)",
  },

  Unknown: {
    color: "#94a3b8",
    background: "rgba(148,163,184,0.07)",
    border: "rgba(148,163,184,0.12)",
  },
};

/* =========================================================
   Helpers
========================================================= */

function getRiskConfig(level) {
  return (
    RISK_CONFIG[level] ||
    RISK_CONFIG.Unknown
  );
}

function formatConfidence(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return "0.0%";
  }

  /*
   * Backend confidenceScore is currently expected
   * in the range 0 -> 1.
   *
   * Example:
   * 0.82 -> 82.0%
   *
   * The second condition also protects the UI if
   * older data already contains percentage values.
   */

  const percentage =
    value >= 0 && value <= 1
      ? value * 100
      : value;

  return `${percentage.toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   Loading Skeleton
========================================================= */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <tr
            key={index}
            style={{
              borderBottom:
                "1px solid rgba(148,163,184,0.06)",
            }}
          >
            {/* Region */}

            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="
                    skeleton
                    w-8
                    h-8
                    rounded-lg
                    flex-shrink-0
                  "
                />

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      skeleton
                      h-3
                      rounded
                      w-28
                    "
                  />

                  <div
                    className="
                      skeleton
                      h-2
                      rounded
                      w-16
                      mt-2
                    "
                  />
                </div>
              </div>
            </td>

            {/* Risk */}

            <td className="px-4 py-4">
              <div
                className="
                  skeleton
                  h-6
                  w-16
                  rounded-lg
                "
              />
            </td>

            {/* Confidence */}

            <td className="px-4 py-4">
              <div
                className="
                  skeleton
                  h-3
                  w-12
                  rounded
                "
              />
            </td>

            {/* Date */}

            <td className="px-4 py-4">
              <div
                className="
                  skeleton
                  h-3
                  w-20
                  rounded
                "
              />
            </td>
          </tr>
        )
      )}
    </>
  );
}

/* =========================================================
   Empty State
========================================================= */

function EmptyState() {
  return (
    <div
      className="
        min-h-[220px]
        flex
        flex-col
        items-center
        justify-center
        text-center
        px-6
      "
    >
      <div
        className="
          w-12
          h-12
          rounded-xl
          flex
          items-center
          justify-center
          mb-3
        "
        style={{
          color: "#60a5fa",

          background:
            "rgba(59,130,246,0.07)",

          border:
            "1px solid rgba(59,130,246,0.10)",
        }}
      >
        <FileSearch size={20} />
      </div>

      <p
        className="
          text-xs
          font-semibold
        "
        style={{
          color:
            "var(--text-secondary, #cbd5e1)",
        }}
      >
        No analyses found
      </p>

      <p
        className="
          text-[10px]
          mt-1.5
          max-w-[270px]
          leading-relaxed
        "
        style={{
          color:
            "var(--text-faint, #475569)",
        }}
      >
        Run a forest analysis from the
        dashboard to start building your
        analysis history.
      </p>
    </div>
  );
}

/* =========================================================
   Recent Analysis
========================================================= */

function RecentAnalysis({
  analyses = [],
  loading = false,
}) {
  /* =======================================================
     Empty State
  ======================================================= */

  if (
    !loading &&
    analyses.length === 0
  ) {
    return <EmptyState />;
  }

  return (
    <div className="w-full min-w-0">

      {/* ===================================================
          Desktop / Tablet Table
      =================================================== */}

      <div className="hidden sm:block overflow-x-auto">
        <table
          className="
            w-full
            min-w-[680px]
            border-collapse
          "
        >
          {/* =================================================
              Header
          ================================================= */}

          <thead>
            <tr
              style={{
                borderBottom:
                  "1px solid rgba(148,163,184,0.09)",
              }}
            >
              <th
                className="
                  text-left
                  px-4
                  py-3
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
                style={{
                  color:
                    "var(--text-faint, #64748b)",
                }}
              >
                Region
              </th>

              <th
                className="
                  text-left
                  px-4
                  py-3
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
                style={{
                  color:
                    "var(--text-faint, #64748b)",
                }}
              >
                Risk
              </th>

              <th
                className="
                  text-left
                  px-4
                  py-3
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
                style={{
                  color:
                    "var(--text-faint, #64748b)",
                }}
              >
                Confidence
              </th>

              <th
                className="
                  text-left
                  px-4
                  py-3
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
                style={{
                  color:
                    "var(--text-faint, #64748b)",
                }}
              >
                Analysis Date
              </th>
            </tr>
          </thead>

          {/* =================================================
              Body
          ================================================= */}

          <tbody>
            {loading ? (
              <LoadingRows />
            ) : (
              analyses.map((analysis) => {
                const riskLevel =
                  analysis
                    ?.riskClassification
                    ?.level ||
                  "Unknown";

                const risk =
                  getRiskConfig(
                    riskLevel
                  );

                return (
                  <tr
                    key={analysis._id}
                    className="
                      transition-colors
                      duration-150
                      hover:bg-slate-800/20
                    "
                    style={{
                      borderBottom:
                        "1px solid rgba(148,163,184,0.055)",
                    }}
                  >
                    {/* Region */}

                    <td className="px-4 py-3.5">
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                          "
                          style={{
                            color:
                              "#4ade80",

                            background:
                              "rgba(34,197,94,0.06)",

                            border:
                              "1px solid rgba(34,197,94,0.09)",
                          }}
                        >
                          <MapPinned
                            size={14}
                          />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                              text-[11px]
                              font-semibold
                              truncate
                              max-w-[220px]
                            "
                            style={{
                              color:
                                "var(--text-primary, #f8fafc)",
                            }}
                          >
                            {analysis.regionName ||
                              analysis
                                ?.region
                                ?.name ||
                              "Unknown Region"}
                          </p>

                          <p
                            className="
                              text-[9px]
                              mt-0.5
                            "
                            style={{
                              color:
                                "var(--text-faint, #475569)",
                            }}
                          >
                            Forest analysis
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Risk */}

                    <td className="px-4 py-3.5">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-2.5
                          py-1.5
                          rounded-lg
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                        "
                        style={{
                          color:
                            risk.color,

                          background:
                            risk.background,

                          border: `1px solid ${risk.border}`,
                        }}
                      >
                        <span
                          className="
                            w-1.5
                            h-1.5
                            rounded-full
                          "
                          style={{
                            background:
                              risk.color,
                          }}
                        />

                        {riskLevel}
                      </span>
                    </td>

                    {/* Confidence */}

                    <td className="px-4 py-3.5">
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <Activity
                          size={13}
                          style={{
                            color:
                              "#60a5fa",
                          }}
                        />

                        <span
                          className="
                            text-[11px]
                            font-semibold
                          "
                          style={{
                            color:
                              "var(--text-secondary, #cbd5e1)",
                          }}
                        >
                          {formatConfidence(
                            analysis.confidenceScore
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Date */}

                    <td className="px-4 py-3.5">
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <CalendarDays
                          size={13}
                          style={{
                            color:
                              "var(--text-faint, #64748b)",
                          }}
                        />

                        <span
                          className="text-[10px]"
                          style={{
                            color:
                              "var(--text-muted, #94a3b8)",
                          }}
                        >
                          {formatDate(
                            analysis.createdAt
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================
          Mobile Cards
      =================================================== */}

      <div className="sm:hidden space-y-2.5">
        {loading
          ? Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  rounded-xl
                  p-4
                "
                style={{
                  background:
                    "rgba(148,163,184,0.025)",

                  border:
                    "1px solid rgba(148,163,184,0.07)",
                }}
              >
                <div
                  className="
                    skeleton
                    h-3
                    w-32
                    rounded
                  "
                />

                <div
                  className="
                    skeleton
                    h-3
                    w-20
                    rounded
                    mt-3
                  "
                />

                <div
                  className="
                    skeleton
                    h-3
                    w-24
                    rounded
                    mt-3
                  "
                />
              </div>
            ))
          : analyses.map(
              (analysis) => {
                const riskLevel =
                  analysis
                    ?.riskClassification
                    ?.level ||
                  "Unknown";

                const risk =
                  getRiskConfig(
                    riskLevel
                  );

                return (
                  <div
                    key={analysis._id}
                    className="
                      rounded-xl
                      p-4
                    "
                    style={{
                      background:
                        "rgba(148,163,184,0.025)",

                      border:
                        "1px solid rgba(148,163,184,0.07)",
                    }}
                  >
                    {/* Header */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                          min-w-0
                        "
                      >
                        <div
                          className="
                            w-8
                            h-8
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                          "
                          style={{
                            color:
                              "#4ade80",

                            background:
                              "rgba(34,197,94,0.06)",
                          }}
                        >
                          <MapPinned
                            size={14}
                          />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                              text-xs
                              font-semibold
                              truncate
                            "
                            style={{
                              color:
                                "var(--text-primary, #f8fafc)",
                            }}
                          >
                            {analysis.regionName ||
                              analysis
                                ?.region
                                ?.name ||
                              "Unknown Region"}
                          </p>

                          <p
                            className="
                              text-[9px]
                              mt-0.5
                            "
                            style={{
                              color:
                                "var(--text-faint, #475569)",
                            }}
                          >
                            {formatDate(
                              analysis.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className="
                          px-2
                          py-1
                          rounded-lg
                          text-[8px]
                          font-bold
                          uppercase
                          flex-shrink-0
                        "
                        style={{
                          color:
                            risk.color,

                          background:
                            risk.background,

                          border: `1px solid ${risk.border}`,
                        }}
                      >
                        {riskLevel}
                      </span>
                    </div>

                    {/* Bottom */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mt-4
                        pt-3
                        border-t
                      "
                      style={{
                        borderColor:
                          "rgba(148,163,184,0.06)",
                      }}
                    >
                      <span
                        className="text-[9px]"
                        style={{
                          color:
                            "var(--text-faint, #64748b)",
                        }}
                      >
                        Confidence
                      </span>

                      <span
                        className="
                          text-[11px]
                          font-semibold
                        "
                        style={{
                          color:
                            "#60a5fa",
                        }}
                      >
                        {formatConfidence(
                          analysis.confidenceScore
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
      </div>
    </div>
  );
}

export default RecentAnalysis;