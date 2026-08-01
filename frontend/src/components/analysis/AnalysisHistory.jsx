import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  FileText,
  History,
  ShieldAlert,
} from "lucide-react";

import AnalysisDetailsModal from "./AnalysisDetailsModal";
import DeleteAnalysisModal from "./DeleteAnalysisModal";

import { generateAnalysisReport } from "../../utils/ReportGenerator";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function getRegionName(analysis) {
  return (
    analysis?.regionName ||
    analysis?.regionId?.name ||
    analysis?.region?.name ||
    "Unknown Region"
  );
}

function getRiskLevel(analysis) {
  return (
    analysis?.riskClassification?.riskLevel ||
    analysis?.riskClassification?.level ||
    analysis?.riskLevel ||
    "Unknown"
  );
}

function getNDVI(analysis) {
  const ndvi = analysis?.ndvi;

  // Current backend stores NDVI as [mean]
  if (Array.isArray(ndvi)) {
    return ndvi.length > 0 ? Number(ndvi[0]) : null;
  }

  // Compatibility with older/object-based records
  if (ndvi && typeof ndvi === "object") {
    return ndvi.mean != null ? Number(ndvi.mean) : null;
  }

  if (typeof ndvi === "number") {
    return ndvi;
  }

  return null;
}

function getConfidence(analysis) {
  const confidence =
    analysis?.riskClassification?.confidenceScore ??
    analysis?.confidenceScore ??
    0;

  const numericValue = Number(confidence);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  // Backend currently stores confidence between 0 and 1.
  // Compatibility for old records that may already contain percentage.
  return numericValue <= 1
    ? numericValue * 100
    : numericValue;
}

function getRiskBadgeClass(level) {
  const normalized = String(level || "").toLowerCase();

  if (
    normalized === "high" ||
    normalized === "critical"
  ) {
    return "badge-critical";
  }

  if (
    normalized === "medium" ||
    normalized === "warning"
  ) {
    return "badge-warning";
  }

  if (
    normalized === "low" ||
    normalized === "safe"
  ) {
    return "badge-safe";
  }

  return "badge-info";
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

function AnalysisHistory({
  analyses = [],
  onRefresh,
}) {
  const [search, setSearch] = useState("");

  const [selectedAnalysis, setSelectedAnalysis] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showDelete, setShowDelete] =
    useState(false);

  /* -----------------------------------------------------
     Search
  ----------------------------------------------------- */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return analyses;
    }

    return analyses.filter((analysis) => {
      const regionName =
        getRegionName(analysis).toLowerCase();

      const riskLevel =
        getRiskLevel(analysis).toLowerCase();

      return (
        regionName.includes(query) ||
        riskLevel.includes(query)
      );
    });
  }, [analyses, search]);

  /* -----------------------------------------------------
     Modal handlers
  ----------------------------------------------------- */

  const openDetails = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedAnalysis(null);
  };

  const openDelete = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDelete(true);
  };

  const closeDelete = () => {
    setShowDelete(false);
    setSelectedAnalysis(null);
  };

  /* -----------------------------------------------------
     Report
  ----------------------------------------------------- */

  const handleReport = (analysis) => {
    try {
      generateAnalysisReport(analysis);
    } catch (error) {
      console.error(
        "Unable to generate analysis report:",
        error
      );
    }
  };

  return (
    <>
      <div className="fg-card overflow-hidden">

        {/* =================================================
            Header
        ================================================= */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            justify-between
            gap-4
            px-5
            py-5
            border-b
          "
          style={{
            borderColor: "var(--bg-border)",
          }}
        >
          {/* Title */}

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
                background:
                  "rgba(34,197,94,0.10)",
                border:
                  "1px solid rgba(34,197,94,0.20)",
              }}
            >
              <History
                size={19}
                style={{ color: "#4ade80" }}
              />
            </div>

            <div>
              <h2
                className="text-base font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Analysis History
              </h2>

              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {analyses.length} analysis
                {analyses.length !== 1 ? " records" : " record"}
              </p>
            </div>
          </div>

          {/* Search */}

          <div className="relative w-full md:w-72">
            <Search
              size={15}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
              "
              style={{
                color: "var(--text-muted)",
              }}
            />

            <input
              type="text"
              placeholder="Search region or risk..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="fg-input w-full pl-9"
            />
          </div>
        </div>

        {/* =================================================
            Table
        ================================================= */}

        <div className="overflow-x-auto">
          <table className="w-full">

            {/* Table Header */}

            <thead>
              <tr
                style={{
                  background:
                    "var(--bg-primary)",
                  borderBottom:
                    "1px solid var(--bg-border)",
                }}
              >
                <th
                  className="
                    text-left
                    px-5
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Region
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Risk
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  NDVI
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Confidence
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Date
                </th>

                <th
                  className="
                    text-center
                    px-5
                    py-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                  "
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-14"
                  >
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
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
                          background:
                            "var(--bg-primary)",
                          border:
                            "1px solid var(--bg-border)",
                        }}
                      >
                        <ShieldAlert
                          size={20}
                          style={{
                            color:
                              "var(--text-muted)",
                          }}
                        />
                      </div>

                      <p
                        className="
                          text-sm
                          font-medium
                        "
                        style={{
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        No analysis found
                      </p>

                      <p
                        className="text-xs mt-1"
                        style={{
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        {search
                          ? "Try a different search term."
                          : "Run your first forest analysis to see results here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((analysis) => {
                  const regionName =
                    getRegionName(analysis);

                  const riskLevel =
                    getRiskLevel(analysis);

                  const ndvi =
                    getNDVI(analysis);

                  const confidence =
                    getConfidence(analysis);

                  return (
                    <tr
                      key={analysis._id}
                      className="
                        transition-colors
                        hover:bg-slate-800/30
                      "
                      style={{
                        borderBottom:
                          "1px solid var(--bg-border)",
                      }}
                    >

                      {/* Region */}

                      <td className="px-5 py-4">
                        <div>
                          <p
                            className="
                              text-sm
                              font-semibold
                            "
                            style={{
                              color:
                                "var(--text-primary)",
                            }}
                          >
                            {regionName}
                          </p>

                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            {analysis.detectionMethod ===
                            "fallback"
                              ? "Algorithmic fallback"
                              : "Satellite analysis"}
                          </p>
                        </div>
                      </td>

                      {/* Risk */}

                      <td className="px-4 py-4">
                        <span
                          className={`badge ${getRiskBadgeClass(
                            riskLevel
                          )}`}
                        >
                          {riskLevel}
                        </span>
                      </td>

                      {/* NDVI */}

                      <td className="px-4 py-4">
                        <span
                          className="
                            text-sm
                            font-mono
                            font-semibold
                          "
                          style={{
                            color:
                              ndvi != null &&
                              ndvi >= 0.4
                                ? "#4ade80"
                                : "#fbbf24",
                          }}
                        >
                          {ndvi != null
                            ? ndvi.toFixed(3)
                            : "—"}
                        </span>
                      </td>

                      {/* Confidence */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                          <div
                            className="
                              hidden
                              lg:block
                              w-16
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
                              "
                              style={{
                                width: `${Math.min(
                                  confidence,
                                  100
                                )}%`,
                                background:
                                  confidence >= 80
                                    ? "#22c55e"
                                    : confidence >= 50
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            />
                          </div>

                          <span
                            className="
                              text-sm
                              font-semibold
                            "
                            style={{
                              color:
                                "var(--text-secondary)",
                            }}
                          >
                            {confidence.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Date */}

                      <td className="px-4 py-4">
                        <div>
                          <p
                            className="text-sm"
                            style={{
                              color:
                                "var(--text-secondary)",
                            }}
                          >
                            {analysis.createdAt
                              ? new Date(
                                  analysis.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </p>

                          {analysis.createdAt && (
                            <p
                              className="text-xs mt-0.5"
                              style={{
                                color:
                                  "var(--text-muted)",
                              }}
                            >
                              {new Date(
                                analysis.createdAt
                              ).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                          "
                        >

                          {/* View */}

                          <button
                            type="button"
                            onClick={() =>
                              openDetails(analysis)
                            }
                            title="View analysis"
                            className="
                              w-8
                              h-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              transition-colors
                              hover:bg-green-500/10
                              hover:text-green-400
                            "
                            style={{
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Report */}

                          <button
                            type="button"
                            onClick={() =>
                              handleReport(analysis)
                            }
                            title="Generate report"
                            className="
                              w-8
                              h-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              transition-colors
                              hover:bg-blue-500/10
                              hover:text-blue-400
                            "
                            style={{
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            <FileText size={16} />
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              openDelete(analysis)
                            }
                            title="Delete analysis"
                            className="
                              w-8
                              h-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              transition-colors
                              hover:bg-red-500/10
                              hover:text-red-400
                            "
                            style={{
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Search result footer */}

        {filtered.length > 0 && (
          <div
            className="
              px-5
              py-3
              border-t
              flex
              items-center
              justify-between
            "
            style={{
              borderColor: "var(--bg-border)",
            }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Showing {filtered.length} of{" "}
              {analyses.length} analyses
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          Details Modal
      ================================================= */}

      <AnalysisDetailsModal
        open={showDetails}
        onClose={closeDetails}
        analysis={selectedAnalysis}
      />

      {/* =================================================
          Delete Modal
      ================================================= */}

      <DeleteAnalysisModal
        open={showDelete}
        onClose={closeDelete}
        analysis={selectedAnalysis}
        onSuccess={() => {
          closeDelete();

          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    </>
  );
}

export default AnalysisHistory;