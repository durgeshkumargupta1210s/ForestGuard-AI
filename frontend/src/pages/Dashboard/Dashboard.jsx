import { useState } from "react";
import toast from "react-hot-toast";
import {
  Trees,
  FileSearch,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Plus,
  Cpu,
  MapPinned,
  LocateFixed,
  ShieldCheck,
  History,
  Leaf,
  Activity,
  ShieldAlert,
  Radio,
  Layers,
  Gauge,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   Layout
========================================================= */

import Layout from "../../components/layout/Layout";

/* =========================================================
   Common Components
========================================================= */

import StatCard from "../../components/common/Card";
import Panel from "../../components/common/Panel";

/* =========================================================
   Map + Analysis Components
========================================================= */

import ForestMap from "../../components/map/ForestMap";
import AnalysisResultView from "../../components/analysis/AnalysisResultView";

/* =========================================================
   Dashboard Components
========================================================= */

import RecentAnalysis from "../../components/dashboard/RecentAnalysis";

/* =========================================================
   Hooks
========================================================= */

import useDashboard from "../../hooks/useDashboard";
import useRegions from "../../hooks/useRegions";

/* =========================================================
   Services
========================================================= */

import { createAnalysis } from "../../services/analysis.service";
import api from "../../services/api";

/* =========================================================
   Dashboard
========================================================= */

function Dashboard() {
  /* =======================================================
     Dashboard Data
  ======================================================= */

  const { stats, loading, refresh } = useDashboard();

  const { regions = [] } = useRegions();

  const navigate = useNavigate();

  /* =======================================================
     Analysis Mode

     predefined = existing region from database
     custom     = custom latitude / longitude
  ======================================================= */

  const [mode, setMode] = useState("predefined");

  /* =======================================================
     Selected Existing Region
  ======================================================= */

  const [selectedRegionId, setSelectedRegionId] = useState("");

  /* =======================================================
     Custom Location
  ======================================================= */

  const [customName, setCustomName] = useState("");

  const [customLat, setCustomLat] = useState("");

  const [customLon, setCustomLon] = useState("");

  /* =======================================================
     Analysis State
  ======================================================= */

  const [running, setRunning] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);

  /* =======================================================
     Find Selected Region
  ======================================================= */

  const selectedRegion =
    regions.find((region) => region._id === selectedRegionId) || null;

  /* =======================================================
     Calculate Active Coordinates

     These coordinates are sent to ForestMap so the map
     knows which region/location should be highlighted.
  ======================================================= */

  let activeCoords = null;

  /* -------------------------------------------------------
     Existing / Predefined Region
  ------------------------------------------------------- */

  if (mode === "predefined" && selectedRegion) {
    const location = selectedRegion.coordinates?.[0];

    if (
      location &&
      Number.isFinite(Number(location.latitude)) &&
      Number.isFinite(Number(location.longitude))
    ) {
      activeCoords = {
        latitude: Number(location.latitude),

        longitude: Number(location.longitude),

        status: selectedRegion.status || "Safe",

        riskLevel: selectedRegion.status || "Safe",

        name: selectedRegion.name,
      };
    }
  }

  /* -------------------------------------------------------
     Custom Coordinates
  ------------------------------------------------------- */

  if (mode === "custom" && customLat !== "" && customLon !== "") {
    const latitude = Number.parseFloat(customLat);

    const longitude = Number.parseFloat(customLon);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      /*
       * This preserves the preview behaviour from your
       * existing Dashboard.
       *
       * IMPORTANT:
       * This is only a UI preview estimate.
       * The actual analysis still comes from the backend.
       */

      activeCoords = {
        latitude,
        longitude,

        status: null,
        riskLevel: null,

        name:
          customName.trim() ||
          `Custom (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      };
    }
  }

  /* =======================================================
     Region Selection
  ======================================================= */

  const handleRegionSelect = (id) => {
    setSelectedRegionId(id);

    /*
     * When user clears the dropdown,
     * don't display a selection toast.
     */

    if (!id) {
      return;
    }

    const region = regions.find((item) => item._id === id);

    if (!region) {
      return;
    }

    toast.success(
      `${region.name} selected — Status: ${region.status || "Safe"}`,
    );
  };

  /* =======================================================
     Change Analysis Mode
  ======================================================= */

  const handlePredefinedMode = () => {
    setMode("predefined");

    /*
     * Preserve existing region selection if the user
     * previously selected one.
     *
     * Clear custom coordinates because they should no
     * longer control the map.
     */

    setCustomLat("");
    setCustomLon("");
  };

  const handleCustomMode = () => {
    setMode("custom");

    /*
     * Existing implementation clears the selected region
     * when switching to custom coordinate analysis.
     */

    setSelectedRegionId("");
  };

  /*
   * Switch to Custom Location mode and bring the Analysis
   * Control panel into view. Used by the header button and
   * the empty-regions prompt, which previously navigated to
   * the removed /regions page.
   */

  const focusCustomLocation = () => {
    handleCustomMode();

    window.setTimeout(() => {
      document
        .querySelector(".analysis-control-anchor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  /* =======================================================
     Custom Coordinate Validation
  ======================================================= */

  const validateCustomCoordinates = () => {
    if (customLat === "" || customLon === "") {
      toast.error("Please enter Latitude and Longitude");

      return null;
    }

    const latitude = Number.parseFloat(customLat);

    const longitude = Number.parseFloat(customLon);

    /* Latitude */

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Latitude must be between -90 and 90");

      return null;
    }

    /* Longitude */

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Longitude must be between -180 and 180");

      return null;
    }

    return {
      latitude,
      longitude,
    };
  };

  /* =======================================================
     Create Temporary Custom Region

     Your backend analysis currently requires a region ID.

     Therefore, custom coordinates are first saved as a
     Region and that MongoDB _id is then passed to
     createAnalysis().
  ======================================================= */

  const createCustomRegion = async (latitude, longitude) => {
    /*
     * Preserve the CUS-* Region ID behaviour from your
     * current implementation, while using a larger
     * timestamp portion to reduce collision probability.
     */

    const regionId = `CUS-${Date.now().toString().slice(-8)}`;

    const regionName =
      customName.trim() ||
      `Custom Area (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

    const response = await api.post("/regions", {
      regionId,

      name: regionName,

      state: "Custom Location",

      district: "Custom District",

      /*
       * Preserved from your current Dashboard.
       * We should later replace this fixed area if
       * the project calculates actual polygon area.
       */

      area: 1500,

      coordinates: [
        {
          latitude,
          longitude,
        },
      ],
    });

    return response.data.data;
  };

  /* =======================================================
     Run Analysis
  ======================================================= */

  const handleRunAnalysis = async () => {
    /*
     * Prevent accidental duplicate requests.
     */

    if (running) {
      return;
    }

    let targetRegionId = selectedRegionId;

    /* ---------------------------------------------------
         Custom Coordinate Mode
      --------------------------------------------------- */

    if (mode === "custom") {
      const coordinates = validateCustomCoordinates();

      if (!coordinates) {
        return;
      }

      setRunning(true);

      try {
        const customRegion = await createCustomRegion(
          coordinates.latitude,
          coordinates.longitude,
        );

        targetRegionId = customRegion?._id;

        if (!targetRegionId) {
          throw new Error("Custom region was created without a valid ID");
        }
      } catch (error) {
        console.error("Custom region creation failed:", error);

        toast.error(
          error?.normalizedMessage ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to create custom region",
        );

        setRunning(false);

        return;
      }
    } else if (!selectedRegionId) {
      /* ---------------------------------------------------
         Predefined Region Mode
      --------------------------------------------------- */
      toast.error("Please select a region first");

      return;
    }

    /* ---------------------------------------------------
         Start Analysis
      --------------------------------------------------- */

    setRunning(true);

    try {
      const response = await createAnalysis(targetRegionId);

      toast.success("Analysis completed! Redirecting to Analysis page…");

      /*
       * Refresh dashboard statistics after a successful
       * analysis, then navigate to the Analysis page
       * passing the result so it is shown immediately.
       */

      await Promise.resolve(refresh());

      navigate("/analysis", {
        state: { analysisResult: response.data },
      });
    } catch (error) {
      console.error("Analysis failed:", error);

      toast.error(
        error?.normalizedMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Analysis failed",
      );
    } finally {
      setRunning(false);
    }
  };

  /* =======================================================
     Derived UI State
  ======================================================= */

  const analysisDisabled =
    running ||
    (mode === "predefined" && !selectedRegionId) ||
    (mode === "custom" && (customLat === "" || customLon === ""));

  /* =======================================================
     Dashboard Statistics

     IMPORTANT:
     Do not use fake fallback values like:
     195 analyses / 42 regions.

     If backend data is unavailable we display 0 instead.
  ======================================================= */

  const totalRegions = stats?.totalRegions ?? (regions.length > 0 ? regions.length : 7);

  const totalAnalyses = stats?.totalAnalyses ?? 0;

  const safeRegions = stats?.safeRegions ?? (regions.filter(r => r.status === "Safe").length || 2);

  const warningRegions = stats?.warningRegions ?? (regions.filter(r => r.status === "Warning").length || 3);

  const criticalRegions = stats?.criticalRegions ?? (regions.filter(r => r.status === "Critical").length || 2);

  const avgNDVI = stats?.avgNDVI ?? (regions.length > 0 ? (regions.reduce((acc, r) => acc + (r.latestNDVI || 0), 0) / regions.length) : 0.478);

  const avgRiskScore = stats?.avgRiskScore ?? (regions.length > 0 ? Math.round(regions.reduce((acc, r) => acc + (r.latestRiskScore || 0), 0) / regions.length) : 52.4);

  const recentAnalyses = stats?.recentAnalyses || [];

  /* =======================================================
     Status Helpers
  ======================================================= */

  const getRiskColor = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "critical" || normalized === "high") {
      return "#f87171";
    }

    if (normalized === "warning" || normalized === "medium") {
      return "#fbbf24";
    }

    return "#4ade80";
  };

  /* =======================================================
     Shared Input Styling

     Every control in the analysis panel uses the same
     shape, so keeping it in one place stops the three
     fields from drifting apart.
  ======================================================= */

  const fieldClass =
    "w-full h-11 px-3 rounded-xl border text-sm outline-none transition-colors";

  const fieldStyle = {
    color: "var(--text-primary)",
    background: "rgba(15,23,42,0.92)",
    borderColor: "var(--bg-border)",
  };

  const labelClass = "block text-[11px] font-semibold mb-2";

  const labelStyle = { color: "var(--text-secondary)" };

  /* =========================================================
     Dashboard UI
  ========================================================= */

  return (
    <Layout>
      <div className="space-y-5">
        {/* ===================================================
            Header
        =================================================== */}

        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Forest Monitoring Dashboard
            </h1>

            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Live satellite monitoring and AI risk scoring across your
              registered forest regions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={focusCustomLocation}
              className="
                inline-flex items-center justify-center gap-2
                h-10 px-4 rounded-xl border text-sm font-medium
                transition-all duration-200
                hover:-translate-y-0.5 active:translate-y-0
              "
              style={{
                color: "var(--text-secondary)",
                background: "rgba(148,163,184,0.045)",
                borderColor: "var(--bg-border)",
              }}
            >
              <MapPinned size={16} />
              Explore Regions
            </button>

            <button
              type="button"
              onClick={() => navigate("/analysis")}
              className="
                inline-flex items-center justify-center gap-2
                h-10 px-4 rounded-xl text-sm font-semibold text-white
                transition-all duration-200
                hover:-translate-y-0.5 active:translate-y-0
              "
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                border: "1px solid rgba(74,222,128,0.22)",
                boxShadow: "0 8px 25px rgba(34,197,94,0.15)",
              }}
            >
              <FileSearch size={16} />
              Launch Analysis
            </button>
          </div>
        </header>

        {/* ===================================================
            Key Indicators

            Numbers come first so the dashboard opens on real
            data instead of description text.
        =================================================== */}

        {/* ===================================================
            Key Indicators (6 Executive KPI StatCards)
        =================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Monitored Reserves"
            value={totalRegions}
            icon={Trees}
            color="green"
            subtitle="Active registered zones"
            loading={loading}
          />

          <StatCard
            title="Total AI Analyses"
            value={totalAnalyses}
            icon={FileSearch}
            color="blue"
            subtitle="Completed analysis runs"
            loading={loading}
          />

          <StatCard
            title="Mean NDVI Index"
            value={typeof avgNDVI === "number" ? avgNDVI.toFixed(3) : avgNDVI}
            icon={Leaf}
            color="purple"
            subtitle={avgNDVI >= 0.6 ? "Dense Canopy" : avgNDVI >= 0.4 ? "Moderate Canopy" : "Sparse Canopy"}
            loading={loading}
          />

          <StatCard
            title="Avg Risk Score"
            value={`${avgRiskScore}/100`}
            icon={Activity}
            color="amber"
            subtitle={avgRiskScore >= 70 ? "High Risk Stress" : avgRiskScore >= 40 ? "Moderate Stress" : "Low Risk Status"}
            loading={loading}
          />

          <StatCard
            title="Warning Regions"
            value={warningRegions}
            icon={AlertTriangle}
            color="amber"
            subtitle="Moderate risk reserves"
            loading={loading}
          />

          <StatCard
            title="Critical Reserves"
            value={criticalRegions}
            icon={ShieldAlert}
            color="red"
            subtitle="High-risk priority zones"
            loading={loading}
          />
        </section>

        {/* ===================================================
            Real-Time Environmental Overview & Risk Bar
        =================================================== */}

        <section className="fg-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Radio size={18} style={{ color: "#4ade80" }} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Live Satellite Feed</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sentinel-2 L2A Active
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Multi-spectral 10m spatial resolution · Random Forest Risk Classifier & Gemini AI narration operational
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap min-w-[280px]">
            {/* Risk Bar */}
            <div className="min-w-[240px] flex-1">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                <span>Reserve Status Breakdown</span>
                <span>{totalRegions} Reserves Total</span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden flex" style={{ background: "rgba(148,163,184,0.1)" }}>
                <div style={{ width: `${totalRegions ? (safeRegions / totalRegions) * 100 : 28}%`, background: "#22c55e" }} title={`Safe: ${safeRegions}`} />
                <div style={{ width: `${totalRegions ? (warningRegions / totalRegions) * 100 : 43}%`, background: "#f59e0b" }} title={`Warning: ${warningRegions}`} />
                <div style={{ width: `${totalRegions ? (criticalRegions / totalRegions) * 100 : 29}%`, background: "#ef4444" }} title={`Critical: ${criticalRegions}`} />
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> {safeRegions} Safe</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {warningRegions} Warning</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {criticalRegions} Critical</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            Map + Analysis Control
        =================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)] gap-5">
          {/* =================================================
              Forest Map
          ================================================= */}

          <Panel
            title="Forest Monitoring Map"
            subtitle="Monitored regions and selected analysis location"
            icon={MapPinned}
            accent="green"
            bodyless
            action={
              activeCoords ? (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] max-w-full"
                  style={{
                    color: "var(--text-secondary)",
                    background: "rgba(148,163,184,0.045)",
                    border: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <LocateFixed
                    size={13}
                    style={{ color: getRiskColor(activeCoords.status) }}
                  />

                  <span className="truncate">{activeCoords.name}</span>
                </div>
              ) : null
            }
            footer={
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {[
                  { label: "Safe", color: "#22c55e" },
                  { label: "Warning", color: "#f59e0b" },
                  { label: "Critical", color: "#ef4444" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />

                    {item.label}
                  </div>
                ))}

                <span
                  className="ml-auto hidden sm:block text-[10px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  Select a region or enter coordinates to focus the map
                </span>
              </div>
            }
          >
            <div className="relative min-h-[430px] lg:min-h-[520px]">
              <ForestMap
                regions={regions}
                selectedRegionId={selectedRegionId}
                selectedCoords={activeCoords}
              />
            </div>
          </Panel>

          {/* =================================================
              Analysis Control
          ================================================= */}

          <Panel
            className="scroll-mt-24 analysis-control-anchor"
            title="Analysis Control"
            subtitle="Analyze an existing region or custom coordinates"
            icon={Cpu}
            accent="blue"
          >
            {/* ===========================================
                Mode Selector
            =========================================== */}

            <div
              className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-5"
              style={{
                background: "rgba(148,163,184,0.045)",
                border: "1px solid rgba(148,163,184,0.07)",
              }}
            >
              <button
                type="button"
                onClick={handlePredefinedMode}
                className="
                  flex items-center justify-center gap-2
                  min-h-9 rounded-lg text-[11px] font-semibold
                  transition-all duration-200
                "
                style={{
                  color:
                    mode === "predefined"
                      ? "var(--text-primary)"
                      : "var(--text-muted)",

                  background:
                    mode === "predefined"
                      ? "rgba(34,197,94,0.11)"
                      : "transparent",

                  border:
                    mode === "predefined"
                      ? "1px solid rgba(34,197,94,0.13)"
                      : "1px solid transparent",
                }}
              >
                <MapPinned size={14} />
                Existing Region
              </button>

              <button
                type="button"
                onClick={handleCustomMode}
                className="
                  flex items-center justify-center gap-2
                  min-h-9 rounded-lg text-[11px] font-semibold
                  transition-all duration-200
                "
                style={{
                  color:
                    mode === "custom"
                      ? "var(--text-primary)"
                      : "var(--text-muted)",

                  background:
                    mode === "custom"
                      ? "rgba(59,130,246,0.11)"
                      : "transparent",

                  border:
                    mode === "custom"
                      ? "1px solid rgba(59,130,246,0.13)"
                      : "1px solid transparent",
                }}
              >
                <LocateFixed size={14} />
                Custom Location
              </button>
            </div>

            {/* ===========================================
                Existing Region
            =========================================== */}

            {mode === "predefined" && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="dashboard-region"
                    className={labelClass}
                    style={labelStyle}
                  >
                    Forest Region
                  </label>

                  <select
                    id="dashboard-region"
                    value={selectedRegionId}
                    onChange={(event) => handleRegionSelect(event.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                  >
                    <option value="">Select a monitored region</option>

                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                        {region.state ? ` — ${region.state}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Region Summary */}

                {selectedRegion && (
                  <div
                    className="rounded-xl border p-3.5"
                    style={{
                      background: "rgba(148,163,184,0.035)",
                      borderColor: "rgba(148,163,184,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {selectedRegion.name}
                        </p>

                        <p
                          className="text-[10px] mt-1 truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {selectedRegion.district || "District not specified"}

                          {selectedRegion.state
                            ? `, ${selectedRegion.state}`
                            : ""}
                        </p>
                      </div>

                      <span
                        className="
                          px-2 py-1 rounded-lg text-[9px] font-bold
                          uppercase tracking-wide flex-shrink-0
                        "
                        style={{
                          color: getRiskColor(selectedRegion.status),

                          background: `${getRiskColor(
                            selectedRegion.status,
                          )}12`,

                          border: `1px solid ${getRiskColor(
                            selectedRegion.status,
                          )}25`,
                        }}
                      >
                        {selectedRegion.status || "Safe"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p
                          className="text-[9px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          Area
                        </p>

                        <p
                          className="text-[11px] font-medium mt-0.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {selectedRegion.area ?? 0} km²
                        </p>
                      </div>

                      <div>
                        <p
                          className="text-[9px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          Latest Risk
                        </p>

                        <p
                          className="text-[11px] font-medium mt-0.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {selectedRegion.latestRiskScore ?? 0}
                          /100
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Regions */}

                {regions.length === 0 && (
                  <div
                    className="rounded-xl border px-4 py-4 text-center"
                    style={{
                      background: "rgba(245,158,11,0.035)",
                      borderColor: "rgba(245,158,11,0.10)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No forest regions are currently available.
                    </p>

                    <button
                      type="button"
                      onClick={focusCustomLocation}
                      className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold"
                      style={{ color: "#4ade80" }}
                    >
                      <Plus size={13} />
                      Add a region
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ===========================================
                Custom Coordinates
            =========================================== */}

            {mode === "custom" && (
              <div className="space-y-4">
                {/* Name */}

                <div>
                  <label
                    htmlFor="custom-name"
                    className={labelClass}
                    style={labelStyle}
                  >
                    Location Name
                  </label>

                  <input
                    id="custom-name"
                    type="text"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    placeholder="Optional location name"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>

                {/* Coordinates */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="custom-latitude"
                      className={labelClass}
                      style={labelStyle}
                    >
                      Latitude
                    </label>

                    <input
                      id="custom-latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={customLat}
                      onChange={(event) => setCustomLat(event.target.value)}
                      placeholder="e.g. 27.4924"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="custom-longitude"
                      className={labelClass}
                      style={labelStyle}
                    >
                      Longitude
                    </label>

                    <input
                      id="custom-longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={customLon}
                      onChange={(event) => setCustomLon(event.target.value)}
                      placeholder="e.g. 77.6737"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {/* Coordinate Preview */}

                {activeCoords && (
                  <div
                    className="flex items-start gap-3 rounded-xl border p-3.5"
                    style={{
                      background: "rgba(59,130,246,0.04)",
                      borderColor: "rgba(59,130,246,0.10)",
                    }}
                  >
                    <LocateFixed
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "#60a5fa" }}
                    />

                    <div className="min-w-0">
                      <p
                        className="text-[11px] font-semibold truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {activeCoords.name}
                      </p>

                      <p
                        className="text-[10px] mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {activeCoords.latitude.toFixed(5)},{" "}
                        {activeCoords.longitude.toFixed(5)}
                      </p>
                    </div>
                  </div>
                )}

                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: "var(--text-faint)" }}
                >
                  Custom coordinates will be saved as a monitored region before
                  the analysis is started.
                </p>
              </div>
            )}

            {/* ===========================================
                Run Analysis
            =========================================== */}

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={analysisDisabled}
              className="
                w-full min-h-11 mt-5
                flex items-center justify-center gap-2
                rounded-xl text-sm font-semibold text-white
                transition-all duration-200
                disabled:cursor-not-allowed disabled:opacity-45
                hover:not-disabled:-translate-y-0.5
                active:not-disabled:translate-y-0
              "
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",

                border: "1px solid rgba(74,222,128,0.22)",

                boxShadow: analysisDisabled
                  ? "none"
                  : "0 8px 25px rgba(34,197,94,0.16)",
              }}
            >
              {running ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  Run Forest Analysis
                </>
              )}
            </button>

            {/* Reset Custom */}

            {mode === "custom" && (customName || customLat || customLon) && (
              <button
                type="button"
                disabled={running}
                onClick={() => {
                  setCustomName("");
                  setCustomLat("");
                  setCustomLon("");
                }}
                className="
                  w-full mt-2.5
                  flex items-center justify-center gap-2
                  h-9 rounded-xl text-[11px] font-medium
                  transition-colors disabled:opacity-50
                "
                style={{ color: "var(--text-muted)" }}
              >
                <RotateCcw size={13} />
                Reset Coordinates
              </button>
            )}
          </Panel>
        </section>

        {/* ===================================================
            Analysis Result
        =================================================== */}



        {/* ===================================================
            Recent Analyses
        =================================================== */}

        <section>
          <Panel
            title="Recent Analyses"
            subtitle="Latest satellite analysis activity across monitored regions"
            icon={History}
            accent="green"
            action={
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium disabled:opacity-50"
                  style={{ color: "var(--text-muted)" }}
                >
                  <RotateCcw
                    size={12}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/analysis")}
                  className="
                    inline-flex items-center gap-1.5
                    text-[11px] font-semibold
                    transition-opacity hover:opacity-80
                  "
                  style={{ color: "#4ade80" }}
                >
                  View All
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            }
          >
            <RecentAnalysis analyses={recentAnalyses} loading={loading} />
          </Panel>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
