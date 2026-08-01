import { useState } from "react";
import {
  Trash2,
  TriangleAlert,
  X,
  Loader2,
} from "lucide-react";

import {
  deleteAnalysis,
} from "../../services/analysis.service";

function DeleteAnalysisModal({
  open,
  onClose,
  analysis,
  onSuccess,
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!open || !analysis) return null;

  /* =====================================================
     NORMALIZE ANALYSIS DATA
  ===================================================== */

  const regionName =
    analysis.regionName ||
    analysis.region?.name ||
    analysis.regionId?.name ||
    "Unknown Region";

  const riskLevel =
    analysis.riskClassification?.riskLevel ||
    analysis.riskClassification?.level ||
    analysis.riskLevel ||
    "Unknown";

  const analysisDate =
    analysis.createdAt ||
    analysis.timestamp;

  /* =====================================================
     DELETE ANALYSIS
  ===================================================== */

  const handleDelete = async () => {
    // Prevent duplicate delete requests
    if (deleting) return;

    // Validate analysis ID
    if (!analysis?._id) {
      setError("Invalid analysis ID.");
      return;
    }

    try {
      setDeleting(true);
      setError("");

      /* -----------------------------------------------
         Use analysis service instead of direct API call
      ------------------------------------------------ */

      await deleteAnalysis(analysis._id);

      /* -----------------------------------------------
         Refresh parent analysis list
      ------------------------------------------------ */

      if (typeof onSuccess === "function") {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error(
        "Unable to delete analysis:",
        error
      );

      const message =
        error?.normalizedMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to delete analysis. Please try again.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const handleClose = () => {
    // Prevent modal closing while delete is running
    if (deleting) return;

    setError("");
    onClose();
  };

  /* =====================================================
     BACKDROP CLICK
  ===================================================== */

  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !deleting
    ) {
      handleClose();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
        bg-black/70
        backdrop-blur-sm
      "
      onClick={handleBackdropClick}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          overflow-hidden
          shadow-2xl
        "
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
          "
          style={{
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
                background:
                  "rgba(239,68,68,0.10)",
                border:
                  "1px solid rgba(239,68,68,0.20)",
              }}
            >
              <Trash2
                size={19}
                style={{
                  color: "#f87171",
                }}
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-semibold
                "
                style={{
                  color:
                    "var(--text-primary)",
                }}
              >
                Delete Analysis
              </h2>

              <p
                className="
                  text-xs
                  mt-0.5
                "
                style={{
                  color:
                    "var(--text-muted)",
                }}
              >
                Permanently remove analysis
              </p>
            </div>

          </div>

          {/* Close Button */}

          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="
              w-8
              h-8
              rounded-lg
              flex
              items-center
              justify-center
              transition-colors
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="px-6 py-6">

          {/* Warning */}

          <div
            className="
              flex
              items-start
              gap-3
              p-4
              rounded-xl
            "
            style={{
              background:
                "rgba(239,68,68,0.07)",
              border:
                "1px solid rgba(239,68,68,0.18)",
            }}
          >
            <TriangleAlert
              size={19}
              className="
                flex-shrink-0
                mt-0.5
              "
              style={{
                color: "#f87171",
              }}
            />

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
                Are you sure?
              </p>

              <p
                className="
                  text-xs
                  leading-5
                  mt-1
                "
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                You are about to permanently
                delete the analysis for{" "}

                <span
                  className="font-semibold"
                  style={{
                    color: "#f1f5f9",
                  }}
                >
                  {regionName}
                </span>
                .
              </p>
            </div>
          </div>

          {/* =================================================
              ANALYSIS INFORMATION
          ================================================= */}

          <div
            className="
              mt-4
              rounded-xl
              overflow-hidden
            "
            style={{
              border:
                "1px solid var(--bg-border)",
            }}
          >

            <InfoRow
              label="Region"
              value={regionName}
            />

            <InfoRow
              label="Risk Level"
              value={riskLevel}
            />

            <InfoRow
              label="Analysis Date"
              value={
                analysisDate
                  ? new Date(
                      analysisDate
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "—"
              }
            />

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div
              className="
                mt-4
                p-3
                rounded-lg
                text-xs
              "
              style={{
                color: "#f87171",
                background:
                  "rgba(239,68,68,0.08)",
                border:
                  "1px solid rgba(239,68,68,0.18)",
              }}
            >
              {error}
            </div>
          )}

          {/* Permanent Warning */}

          <p
            className="
              text-[11px]
              leading-5
              mt-4
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            This action cannot be undone. The
            analysis record will be permanently
            removed from the ForestGuard system.
          </p>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            px-6
            py-4
            border-t
          "
          style={{
            borderColor:
              "var(--bg-border)",
            background:
              "var(--bg-primary)",
          }}
        >

          {/* Cancel */}

          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            style={{
              color:
                "var(--text-secondary)",
              background:
                "var(--bg-card)",
              border:
                "1px solid var(--bg-border)",
            }}
          >
            Cancel
          </button>

          {/* Delete */}

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
            style={{
              color: "white",
              background: deleting
                ? "#991b1b"
                : "#dc2626",
            }}
          >

            {deleting ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />

                Delete Analysis
              </>
            )}

          </button>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFORMATION ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        px-4
        py-3
        border-b
        last:border-b-0
      "
      style={{
        background:
          "var(--bg-primary)",
        borderColor:
          "var(--bg-border)",
      }}
    >
      <span
        className="text-xs"
        style={{
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>

      <span
        className="
          text-xs
          font-semibold
          text-right
        "
        style={{
          color:
            "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default DeleteAnalysisModal;