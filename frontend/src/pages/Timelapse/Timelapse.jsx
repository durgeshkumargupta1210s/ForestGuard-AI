import { useState, useEffect } from "react";
import {
  Clock, Play, Pause, RotateCcw, Leaf, ShieldAlert, Activity,
  MapPinned, Radio, CheckCircle2, Sliders, Layers, Download,
  TrendingDown, AlertTriangle, Eye, Sparkles, FastForward
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import ForestMap from "../../components/map/ForestMap";
import useRegions from "../../hooks/useRegions";
import toast from "react-hot-toast";

function Timelapse() {
  const { regions, loading } = useRegions();
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(4); // 0 to 4
  const [speed, setSpeed] = useState(1300); // 1300ms, 800ms, 400ms

  const selectedRegion = regions.find((r) => r.regionId === selectedRegionId || r._id === selectedRegionId) || regions[0];

  const historicalSteps = [
    {
      label: "6 Months Ago (Baseline)",
      date: "August 2025",
      ndvi: 0.76,
      loss: 1.8,
      status: "Safe",
      bareSoil: "2%",
      canopyArea: "921 km²",
      event: "Routine Satellite Orbit · Dense Intact Canopy",
      bgGradient: "from-emerald-950 via-green-900/60 to-slate-950",
      accentColor: "#22c55e",
    },
    {
      label: "4 Months Ago",
      date: "October 2025",
      ndvi: 0.68,
      loss: 5.2,
      status: "Safe",
      bareSoil: "5%",
      canopyArea: "895 km²",
      event: "Minor Monsoon Leaf Loss · Normal Seasonal Shift",
      bgGradient: "from-emerald-950/80 via-green-900/40 to-slate-950",
      accentColor: "#22c55e",
    },
    {
      label: "2 Months Ago",
      date: "December 2025",
      ndvi: 0.52,
      loss: 14.1,
      status: "Warning",
      bareSoil: "12%",
      canopyArea: "812 km²",
      event: "Biomass Thinning Signal Detected · Road Access Cut",
      bgGradient: "from-amber-950/80 via-yellow-900/40 to-slate-950",
      accentColor: "#f59e0b",
    },
    {
      label: "1 Month Ago",
      date: "January 2026",
      ndvi: 0.38,
      loss: 26.4,
      status: "Warning",
      bareSoil: "21%",
      canopyArea: "695 km²",
      event: "Accelerated Logging Activity in Buffer Corridor",
      bgGradient: "from-amber-950 via-orange-950/60 to-slate-950",
      accentColor: "#f59e0b",
    },
    {
      label: "Current Orbit (Latest)",
      date: "February 2026",
      ndvi: selectedRegion?.latestNDVI || 0.21,
      loss: selectedRegion?.latestRiskScore || 34.0,
      status: selectedRegion?.status || "Critical",
      bareSoil: "28%",
      canopyArea: "620 km²",
      event: "Emergency Critical Alert · Severe Canopy Clearing",
      bgGradient: "from-red-950 via-slate-950 to-red-950/80",
      accentColor: "#ef4444",
    },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((prev) => (prev >= 4 ? 0 : prev + 1));
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const current = historicalSteps[step];

  const mapCoords = selectedRegion ? {
    latitude: selectedRegion.coordinates?.[0]?.latitude ?? 22.33,
    longitude: selectedRegion.coordinates?.[0]?.longitude ?? 80.61,
    name: selectedRegion.name,
    status: current.status
  } : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="text-purple-400" size={24} />
              Multi-Temporal Time-Lapse Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              High-resolution orbital animation & canopy degradation timeline player across monitored reserves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              {regions.map((r) => (
                <option key={r.regionId || r._id} value={r.regionId || r._id}>
                  {r.name} ({r.state})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => toast.success("Exporting Time-Lapse Data Reel...")}
              className="btn btn-ghost text-xs h-10 px-3 rounded-xl border border-slate-700 text-slate-200 flex items-center gap-1.5"
            >
              <Download size={14} /> Export Reel
            </button>
          </div>
        </header>

        {/* Main Time-Lapse Player & Map Split View */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)] gap-6">
          {/* Left: Time-Lapse Canvas & Player */}
          <div className="fg-card p-6 border-l-4 border-l-purple-500 space-y-6 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <MapPinned className="text-purple-400" size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedRegion?.name || "Kanha National Park"}</h2>
                  <p className="text-xs text-slate-400">Coordinates: {mapCoords?.latitude}°N, {mapCoords?.longitude}°E</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed Controls */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setSpeed(1300)}
                    className={`px-2 py-0.5 rounded font-bold ${speed === 1300 ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => setSpeed(700)}
                    className={`px-2 py-0.5 rounded font-bold ${speed === 700 ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    1.5x
                  </button>
                  <button
                    onClick={() => setSpeed(350)}
                    className={`px-2 py-0.5 rounded font-bold ${speed === 350 ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    2.0x
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(0); setIsPlaying(false); }}
                  className="btn btn-ghost text-xs p-2 rounded-xl border border-slate-700 text-slate-300"
                  title="Reset to baseline"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Satellite Time-Lapse Canvas Frame */}
            <div className={`relative min-h-[280px] rounded-2xl bg-gradient-to-br ${current.bgGradient} border border-slate-800 p-6 flex flex-col justify-between overflow-hidden transition-all duration-700 shadow-2xl`}>
              <div className="flex items-center justify-between text-xs font-bold z-10">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-md">
                  <Radio size={12} className="animate-pulse text-purple-400" />
                  ORBIT PASS {step + 1} / 5 · {current.date}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold shadow-md" style={{ background: `${current.accentColor}20`, color: current.accentColor, border: `1px solid ${current.accentColor}40` }}>
                  {current.status.toUpperCase()} STATUS
                </span>
              </div>

              {/* Event Description Badge */}
              <div className="my-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-sm space-y-2 z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Sparkles size={15} />
                  Orbital Event: {current.event}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mean NDVI</span>
                    <span className="text-xl font-black text-emerald-400">{current.ndvi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Vegetation Loss</span>
                    <span className="text-xl font-black text-red-400">{current.loss}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Bare Soil</span>
                    <span className="text-xl font-black text-amber-400">{current.bareSoil}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Canopy Area</span>
                    <span className="text-xl font-black text-purple-300">{current.canopyArea}</span>
                  </div>
                </div>
              </div>

              {/* Scrubber Progress Bar */}
              <div className="space-y-2 z-10">
                <div className="h-3 w-full rounded-full bg-slate-900 p-0.5 relative overflow-hidden flex border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${((step + 1) / 5) * 100}%`,
                      background: "linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)",
                    }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                  {historicalSteps.map((s, idx) => (
                    <button
                      key={s.label}
                      onClick={() => { setStep(idx); setIsPlaying(false); }}
                      className={`py-1 rounded text-[10px] font-semibold transition-all ${
                        step === idx ? "text-purple-300 font-bold bg-purple-500/25 border border-purple-500/40" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {s.date.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Map Centering on Selected Region */}
          <div className="fg-card overflow-hidden border border-purple-500/20 flex flex-col">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Eye size={14} /> Active Orbit Focus Map
              </span>
              <span className="text-[10px] text-slate-400">{selectedRegion?.name}</span>
            </div>
            <div className="relative flex-1 min-h-[360px]">
              <ForestMap
                regions={regions}
                selectedRegionId={selectedRegion?.regionId || selectedRegion?._id}
                selectedCoords={mapCoords}
              />
            </div>
          </div>
        </div>

        {/* Historical Orbital Event Log */}
        <div className="fg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={16} className="text-purple-400" />
            Historical Orbital Pass Event Audit Log
          </h3>

          <div className="space-y-2.5">
            {historicalSteps.map((s, idx) => (
              <div
                key={s.label}
                onClick={() => { setStep(idx); setIsPlaying(false); }}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                  step === idx
                    ? "bg-purple-950/30 border-purple-500/50 shadow-lg"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === idx ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{s.label} · {s.date}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.event}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>NDVI: <strong className="text-emerald-400">{s.ndvi}</strong></span>
                  <span>Loss: <strong className="text-red-400">{s.loss}%</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === "Critical" ? "bg-red-500/20 text-red-400" : s.status === "Warning" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Timelapse;
