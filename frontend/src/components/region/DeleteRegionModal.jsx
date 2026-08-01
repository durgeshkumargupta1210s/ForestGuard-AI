import { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "../common/Modal";
import { deleteRegion } from "../../services/region.service";

function DeleteRegionModal({ open, onClose, region, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRegion(region._id);
      toast.success(`Region "${region.name}" deleted`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.normalizedMessage || "Failed to delete region");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !region) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Warning Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={24} style={{ color: "#f87171" }} />
        </div>

        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Delete Region
        </h3>

        <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to delete{" "}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {region.name}
          </span>
          ?
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          All associated analyses and alerts will also be removed.
          <br />This action cannot be undone.
        </p>

        {/* Region info chip */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-4 text-xs"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#f87171",
          }}
        >
          <span className="font-mono">{region.regionId}</span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span>{region.state}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-danger flex-1"
            style={{
              background: loading ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.15)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 border-2 rounded-full inline-block"
                  style={{
                    borderColor: "rgba(248,113,113,0.3)",
                    borderTopColor: "#f87171",
                    animation: "spin 0.75s linear infinite",
                  }}
                />
                Deleting...
              </>
            ) : (
              <><Trash2 size={14} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteRegionModal;