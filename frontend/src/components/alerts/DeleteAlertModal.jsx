import { useState } from "react";
import toast from "react-hot-toast";

import { Trash2, AlertTriangle, MapPinned } from "lucide-react";

import Modal from "../common/Modal";
import { deleteAlert } from "../../services/alert.service";

function DeleteAlertModal({ open, onClose, alert, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!open || !alert) return null;

  /* =========================================================
     NORMALIZE ALERT DATA
  ========================================================= */

  const regionName = alert.region?.name || alert.regionName || "Unknown Region";

  const riskLevel =
    alert.riskLevel ||
    alert.riskClassification?.riskLevel ||
    alert.riskClassification?.level ||
    "Unknown";

  const normalizedRisk = String(riskLevel).toLowerCase();

  const riskColor =
    normalizedRisk === "critical" || normalizedRisk === "high"
      ? "#f87171"
      : normalizedRisk === "medium" || normalizedRisk === "warning"
        ? "#fbbf24"
        : "#4ade80";

  /* =========================================================
     DELETE ALERT
  ========================================================= */

  const handleDelete = async () => {
    // Prevent duplicate requests
    if (loading) return;

    if (!alert._id) {
      toast.error("Invalid alert ID");
      return;
    }

    try {
      setLoading(true);

      await deleteAlert(alert._id);

      toast.success(`Alert for "${regionName}" deleted`);

      /*
       * Alerts.jsx refreshes the alert table here.
       */
      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to delete alert:", error);

      toast.error(
        error?.normalizedMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete alert",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const handleClose = () => {
    // Do not close while deletion is running
    if (loading) return;

    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <div className="text-center">
        {/* Warning Icon */}

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
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.20)",
          }}
        >
          <AlertTriangle
            size={24}
            style={{
              color: "#f87171",
            }}
          />
        </div>

        {/* Title */}

        <h3
          className="text-lg font-bold mb-2"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Delete Alert
        </h3>

        {/* Description */}

        <p
          className="text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Permanently delete this alert for{" "}
          <span
            className="font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {regionName}
          </span>
          ?
        </p>

        {/* Alert Information */}

        <div
          className="
            mt-5
            rounded-xl
            p-4
            text-left
          "
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--bg-border)",
          }}
        >
          {/* Region */}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPinned
                size={14}
                style={{
                  color: "#60a5fa",
                }}
              />

              <span
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                Region
              </span>
            </div>

            <span
              className="text-xs font-semibold truncate"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {regionName}
            </span>
          </div>

          {/* Divider */}

          <div
            className="my-3 border-t"
            style={{
              borderColor: "var(--bg-border)",
            }}
          />

          {/* Risk */}

          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Risk Level
            </span>

            <span
              className="text-xs font-semibold"
              style={{
                color: riskColor,
              }}
            >
              {riskLevel}
            </span>
          </div>

          {/* Alert Type */}

          {alert.type && (
            <>
              <div
                className="my-3 border-t"
                style={{
                  borderColor: "var(--bg-border)",
                }}
              />

              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  Alert Type
                </span>

                <span
                  className="text-xs capitalize"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {alert.type}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Warning */}

        <div
          className="
            mt-4
            p-3
            rounded-xl
            text-left
          "
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <p
            className="text-xs leading-5"
            style={{
              color: "#fca5a5",
            }}
          >
            This action cannot be undone. The alert will be permanently removed
            from ForestGuard.
          </p>
        </div>

        {/* Buttons */}

        <div className="flex gap-3 mt-6">
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
            onClick={handleDelete}
            disabled={loading}
            className="
              btn
              btn-danger
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
                    border-red-300/30
                    border-t-red-300
                    rounded-full
                    animate-spin
                  "
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteAlertModal;
