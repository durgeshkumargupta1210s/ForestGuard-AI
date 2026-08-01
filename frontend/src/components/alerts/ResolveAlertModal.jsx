import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import Modal from "../common/Modal";
import { resolveAlert } from "../../services/alert.service";

function ResolveAlertModal({ open, onClose, alert, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!open || !alert) return null;

  /* =========================================================
     NORMALIZE DATA
  ========================================================= */

  const regionName = alert.region?.name || alert.regionName || "Unknown Region";

  const riskLevel =
    alert.riskLevel ||
    alert.riskClassification?.riskLevel ||
    alert.riskClassification?.level ||
    "Unknown";

  const alreadyResolved =
    alert.resolved === true ||
    String(alert.status || "").toLowerCase() === "resolved";

  /* =========================================================
     RESOLVE ALERT
  ========================================================= */

  const handleResolve = async () => {
    if (loading || alreadyResolved) return;

    if (!alert._id) {
      toast.error("Invalid alert ID");
      return;
    }

    try {
      setLoading(true);

      await resolveAlert(alert._id);

      toast.success(`Alert for "${regionName}" resolved`);

      /*
       * Parent Alerts.jsx reloads the alerts here.
       * Await it so the table updates before closing.
       */
      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to resolve alert:", error);

      toast.error(
        error?.normalizedMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to resolve alert",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = () => {
    if (loading) return;

    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <div className="text-center">
        {/* Icon */}

        <div
          className="
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            mx-auto
            mb-5
          "
          style={{
            background: alreadyResolved
              ? "rgba(59,130,246,0.10)"
              : "rgba(34,197,94,0.10)",

            border: alreadyResolved
              ? "1px solid rgba(59,130,246,0.20)"
              : "1px solid rgba(34,197,94,0.20)",
          }}
        >
          {alreadyResolved ? (
            <ShieldCheck
              size={24}
              style={{
                color: "#60a5fa",
              }}
            />
          ) : (
            <CheckCircle2
              size={24}
              style={{
                color: "#4ade80",
              }}
            />
          )}
        </div>

        {/* Title */}

        <h3
          className="text-lg font-bold mb-2"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {alreadyResolved ? "Alert Already Resolved" : "Resolve Alert"}
        </h3>

        {/* Description */}

        {alreadyResolved ? (
          <>
            <p
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              The alert for{" "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {regionName}
              </span>{" "}
              has already been resolved.
            </p>

            {alert.resolvedAt && (
              <p
                className="text-xs mt-2"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Resolved on {new Date(alert.resolvedAt).toLocaleString("en-IN")}
              </p>
            )}
          </>
        ) : (
          <>
            <p
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Mark the alert for{" "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {regionName}
              </span>{" "}
              as resolved?
            </p>

            {/* Risk information */}

            <div
              className="
                mt-4
                px-4
                py-3
                rounded-xl
                text-left
              "
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Current Risk Level
                </span>

                <span
                  className="text-xs font-semibold"
                  style={{
                    color:
                      riskLevel === "Critical" || riskLevel === "High"
                        ? "#f87171"
                        : riskLevel === "Medium" || riskLevel === "Warning"
                          ? "#fbbf24"
                          : "#4ade80",
                  }}
                >
                  {riskLevel}
                </span>
              </div>
            </div>

            <p
              className="text-xs mt-3"
              style={{
                color: "var(--text-muted)",
              }}
            >
              This will update the alert status to Resolved.
            </p>
          </>
        )}

        {/* Buttons */}

        <div className="flex gap-3 mt-6">
          {alreadyResolved ? (
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-primary flex-1"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="
                  btn
                  btn-secondary
                  flex-1
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResolve}
                disabled={loading}
                className="
                  btn
                  btn-primary
                  flex-1
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <span
                      className="
                        w-4
                        h-4
                        border-2
                        border-white/30
                        border-t-white
                        rounded-full
                        animate-spin
                      "
                    />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Resolve
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ResolveAlertModal;
