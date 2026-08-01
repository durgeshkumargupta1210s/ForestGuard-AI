import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell, Search, Eye, CheckCircle2, Trash2, AlertTriangle, RotateCcw,
  ChevronLeft, ChevronRight, ShieldAlert, Radio, Mail, ShieldCheck, Zap
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import StatCard from "../../components/common/Card";
import { TableSkeleton } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";

import AlertDetailsModal from "../../components/alerts/AlertDetailsModal";
import ResolveAlertModal from "../../components/alerts/ResolveAlertModal";
import DeleteAlertModal from "../../components/alerts/DeleteAlertModal";

import { getAllAlerts } from "../../services/alert.service";

const LIMIT = 8;

function getRegionName(alert) {
  return alert?.region?.name || alert?.regionName || "Unknown Region";
}

function getRiskLevel(alert) {
  return (
    alert?.riskLevel ||
    alert?.riskClassification?.riskLevel ||
    alert?.riskClassification?.level ||
    "Unknown"
  );
}

function isAlertResolved(alert) {
  return (
    alert?.resolved === true ||
    String(alert?.status || "").toLowerCase() === "resolved"
  );
}

function RiskBadge({ level }) {
  const normalized = String(level || "Unknown").trim().toLowerCase();
  let badgeClass = "badge-info";
  let label = level || "Unknown";

  if (normalized === "critical" || normalized === "high") {
    badgeClass = "badge-critical";
    label = normalized === "critical" ? "Critical" : "High";
  } else if (normalized === "medium" || normalized === "warning") {
    badgeClass = "badge-warning";
    label = normalized === "warning" ? "Warning" : "Medium";
  } else if (normalized === "low" || normalized === "safe") {
    badgeClass = "badge-safe";
    label = normalized === "safe" ? "Safe" : "Low";
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}

function StatusBadge({ resolved }) {
  return resolved ? (
    <span className="badge badge-safe font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1" />
      Resolved
    </span>
  ) : (
    <span className="badge badge-critical font-bold animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mr-1" />
      Active Warning
    </span>
  );
}

function Alerts() {
  const { user } = useAuth();
  const userEmail = user?.email || "namitgmaps73@gmail.com";

  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [triggeringScan, setTriggeringScan] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "resolved"
  const [riskFilter, setRiskFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchAlerts = useCallback(
    async (showToast = false) => {
      try {
        setLoading(true);
        const queryParams = { page, limit: LIMIT };
        if (statusFilter === "active") queryParams.resolved = "false";
        if (statusFilter === "resolved") queryParams.resolved = "true";
        if (riskFilter) queryParams.riskLevel = riskFilter;

        const res = await getAllAlerts(queryParams);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.alerts)
          ? res.data.alerts
          : Array.isArray(res?.alerts)
          ? res.alerts
          : [];
        const paginationData = res?.pagination || res?.data?.pagination || null;

        setAlerts(list);
        setPagination(paginationData);

        if (showToast) {
          toast.success("Alert feeds updated");
        }
      } catch (error) {
        console.error("Failed to load alerts:", error);
        toast.error(error?.response?.data?.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, riskFilter]
  );

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filtered = alerts.filter((alert) => {
    const name = getRegionName(alert).toLowerCase();
    return name.includes(search.trim().toLowerCase());
  });

  const activeCount = alerts.filter((a) => !isAlertResolved(a)).length;
  const resolvedCount = alerts.filter((a) => isAlertResolved(a)).length;
  const criticalCount = alerts.filter((a) => {
    const r = getRiskLevel(a).toLowerCase();
    return r === "critical" || r === "high";
  }).length;

  const openDetails = (alert) => {
    setSelected(alert);
    setShowDetails(true);
  };

  const openResolve = (alert) => {
    setSelected(alert);
    setShowResolve(true);
  };

  const openDelete = (alert) => {
    setSelected(alert);
    setShowDelete(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelected(null);
  };

  const handleMutationSuccess = async () => {
    await fetchAlerts(false);
  };

  const handleTriggerScan = async () => {
    try {
      setTriggeringScan(true);
      toast.loading("Polling Sentinel-2 satellite imagery across all monitored reserves...", { id: "scan" });
      const api = (await import("../../services/api")).default;
      await api.post("/alerts/trigger-scan");
      toast.success(
        <div>
          <p className="font-bold">✅ Automated Satellite Scan Complete!</p>
          <p className="text-[11px] text-slate-300 mt-0.5">High-risk email alert dispatched to {userEmail}!</p>
        </div>,
        { id: "scan", duration: 7000 }
      );
      await fetchAlerts(false);
    } catch (err) {
      toast.error("Failed to trigger satellite scan", { id: "scan" });
    } finally {
      setTriggeringScan(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Title */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bell className="text-red-400 animate-bounce" size={24} />
              Alert & Emergency Response Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live satellite warning feed, automated hourly surveillance dispatch logs, emergency email alerts, and ranger response protocols.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
              <Zap size={14} /> {activeCount} Active Warnings Requiring Ranger Dispatch
            </span>
          </div>
        </header>

        {/* ── Automated Hourly Surveillance Banner ── */}
        <div className="fg-card p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="text-purple-400" size={18} />
                Automated Hourly Satellite Surveillance & Email Alert Engine Active
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              ForestGuard automatically checks Sentinel-2 satellite imagery every <strong>60 minutes</strong>. When high vegetation loss (&ge;30%) is detected, an emergency non-technical HTML email with plain-language AI explanations is sent to <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">{userEmail}</code>.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={13} /> SMTP Server: Gmail (Port 587)</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-purple-400"><Mail size={13} /> Recipient: {userEmail}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerScan}
            disabled={triggeringScan}
            className="btn btn-primary text-xs py-3 px-5 font-bold flex items-center justify-center gap-2 self-start md:self-center shadow-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            {triggeringScan ? <RotateCcw className="animate-spin" size={16} /> : <Zap size={16} />}
            {triggeringScan ? "Scanning Satellite Orbit..." : "Run Satellite Scan Now"}
          </button>
        </div>

        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Alerts"
            value={pagination?.total ?? alerts.length}
            icon={Bell}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Active Warnings"
            value={activeCount}
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
          <StatCard
            title="Resolved Incidents"
            value={resolvedCount}
            icon={CheckCircle2}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Critical Deforestation"
            value={criticalCount}
            icon={ShieldAlert}
            color="amber"
            loading={loading}
          />
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="fg-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts by reserve name..."
              className="fg-input pl-10 text-xs w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
              {[
                { id: "all", label: "All Alerts" },
                { id: "active", label: "Active" },
                { id: "resolved", label: "Resolved" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    statusFilter === s.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Risk Filter Select */}
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="fg-input fg-select text-xs w-36 h-9"
            >
              <option value="">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="button"
              onClick={() => fetchAlerts(true)}
              disabled={loading}
              className="btn btn-ghost w-9 h-9 p-0 rounded-xl flex items-center justify-center border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh alerts"
            >
              <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Alert Table View ── */}
        <div className="fg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Live Satellite Warning Feed</h3>
            </div>
            {activeCount > 0 && (
              <span className="badge badge-critical font-bold text-xs">{activeCount} active warnings</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="fg-table">
              <thead>
                <tr>
                  <th>Forest Reserve</th>
                  <th>Risk Severity</th>
                  <th>Alert Category</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Ranger Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton rows={LIMIT} cols={6} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                          <Bell size={24} />
                        </div>
                        <p className="text-slate-300 font-bold">No alerts found</p>
                        <p className="text-xs text-slate-500">
                          {search || statusFilter !== "all" || riskFilter
                            ? "Try adjusting your search query or status filters"
                            : "Alerts are triggered automatically when high vegetation loss is detected"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((alert) => {
                    const regionName = getRegionName(alert);
                    const riskLevel = getRiskLevel(alert);
                    const resolvedStatus = isAlertResolved(alert);

                    return (
                      <tr key={alert._id} className="animate-fade-in hover:bg-slate-900/40">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                              <Bell size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{regionName}</p>
                              <p className="text-[10px] text-slate-400">{alert.region?.regionId || "ALERT-OBS-2026"}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <RiskBadge level={riskLevel} />
                        </td>

                        <td>
                          <span className="text-xs capitalize font-semibold text-slate-300">
                            {alert.type || "deforestation"}
                          </span>
                        </td>

                        <td>
                          <StatusBadge resolved={resolvedStatus} />
                        </td>

                        <td className="text-xs text-slate-400">
                          {alert.createdAt
                            ? new Date(alert.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDetails(alert)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                              title="Inspect AI explanation & metrics"
                            >
                              <Eye size={13} /> View
                            </button>

                            <button
                              type="button"
                              onClick={() => openResolve(alert)}
                              disabled={resolvedStatus}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                resolvedStatus
                                  ? "bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed"
                                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                              title={resolvedStatus ? "Alert already resolved" : "Mark as resolved"}
                            >
                              <CheckCircle2 size={13} /> Resolve
                            </button>

                            <button
                              type="button"
                              onClick={() => openDelete(alert)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                              title="Delete alert log"
                            >
                              <Trash2 size={13} />
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 text-xs text-slate-400">
              <p>
                Page {page} of {pagination.totalPages} · {pagination.total} total alerts
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost w-8 h-8 p-0 rounded-lg border border-slate-800 disabled:opacity-30 flex items-center justify-center"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn btn-ghost w-8 h-8 p-0 rounded-lg border border-slate-800 disabled:opacity-30 flex items-center justify-center"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDetailsModal open={showDetails} onClose={closeDetails} alert={selected} />
      <ResolveAlertModal
        open={showResolve}
        onClose={() => {
          setShowResolve(false);
          setSelected(null);
        }}
        alert={selected}
        onSuccess={handleMutationSuccess}
      />
      <DeleteAlertModal
        open={showDelete}
        onClose={() => {
          setShowDelete(false);
          setSelected(null);
        }}
        alert={selected}
        onSuccess={handleMutationSuccess}
      />
    </Layout>
  );
}

export default Alerts;
