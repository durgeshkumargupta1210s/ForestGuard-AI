import {
  MapPinned, Ruler, ShieldCheck, Activity,
  LocateFixed, Bell, Clock, BarChart3,
} from "lucide-react";
import Modal from "../common/Modal";

function InfoRow({ label, value, mono = false }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b"
      style={{ borderColor: "var(--bg-border)" }}
    >
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span
        className={`text-sm font-medium ${mono ? "font-mono" : ""}`}
        style={{ color: "var(--text-primary)" }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Safe:     "badge-safe",
    Warning:  "badge-warning",
    Critical: "badge-critical",
  };
  return (
    <span className={`badge ${map[status] || "badge-info"}`}>
      <span className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: status === "Safe" ? "#4ade80" : status === "Warning" ? "#fbbf24" : "#f87171" }} />
      {status}
    </span>
  );
}

function NdviMeter({ value = 0 }) {
  const pct = Math.round(((value + 1) / 2) * 100);
  const color = value > 0.4 ? "#22c55e" : value > 0.1 ? "#f59e0b" : "#ef4444";
  const label = value > 0.4 ? "Healthy" : value > 0.1 ? "Moderate" : "Stressed";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold" style={{ color }}>NDVI: {value?.toFixed(3)}</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div className="fg-progress">
        <div className="fg-progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function RiskMeter({ score = 0 }) {
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const label = score >= 70 ? "High Risk" : score >= 40 ? "Moderate Risk" : "Low Risk";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold" style={{ color }}>Risk Score: {score}/100</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div className="fg-progress">
        <div className="fg-progress-bar" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function RegionDetailsModal({ open, onClose, region }) {
  if (!open || !region) return null;
  const coord = region.coordinates?.[0];
  const created = region.createdAt ? new Date(region.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—";
  const updated = region.updatedAt ? new Date(region.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={region.name}
      subtitle={`${region.regionId} · ${region.state}${region.district ? ` · ${region.district}` : ""}`}
      size="lg"
    >
      <div className="space-y-5">

        {/* Status + NDVI + Risk row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Status</p>
            <StatusBadge status={region.status} />
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Vegetation (NDVI)</p>
            <NdviMeter value={region.latestNDVI} />
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Risk Level</p>
            <RiskMeter score={region.latestRiskScore} />
          </div>
        </div>

        {/* General info */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bg-border)" }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--bg-primary)" }}>
            <MapPinned size={14} style={{ color: "#4ade80" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Region Information
            </span>
          </div>
          <div className="px-4 pb-1">
            <InfoRow label="Region ID"   value={region.regionId}      mono />
            <InfoRow label="Name"        value={region.name}              />
            <InfoRow label="State"       value={region.state}             />
            <InfoRow label="District"    value={region.district || "N/A"} />
            <InfoRow label="Area"        value={region.area ? `${region.area.toLocaleString()} km²` : "—"} />
            <InfoRow label="Email Alerts" value={region.emailAlertEnabled ? "Enabled" : "Disabled"} />
          </div>
        </div>

        {/* Coordinates */}
        {coord && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bg-border)" }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--bg-primary)" }}>
              <LocateFixed size={14} style={{ color: "#60a5fa" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Coordinates
              </span>
            </div>
            <div className="px-4 pb-1">
              <InfoRow label="Latitude"  value={coord.latitude?.toFixed(6)}  mono />
              <InfoRow label="Longitude" value={coord.longitude?.toFixed(6)} mono />
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Created</span>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{created}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={13} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Last Updated</span>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{updated}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default RegionDetailsModal;