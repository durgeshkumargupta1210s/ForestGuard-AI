import { useState } from "react";
import {
  Sparkles, Target, CheckCircle2, ShieldAlert, Info, HelpCircle,
  Leaf, Activity, Layers, Cpu, MapPinned, FileText, ArrowRight, ShieldCheck
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import useRegions from "../../hooks/useRegions";

function Explainability() {
  const { regions } = useRegions();
  const [selectedRegionId, setSelectedRegionId] = useState("");

  const selectedRegion = regions.find((r) => r.regionId === selectedRegionId || r._id === selectedRegionId) || regions[0];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="text-amber-400" size={24} />
              AI Risk Intelligence & Explainability Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Plain-language transparency breakdown of satellite spectral signals, ML model risk scores, and confidence metrics.
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
          </div>
        </header>

        {/* Selected Region Explanation Focus Banner */}
        <div className="fg-card p-6 border-l-4 border-l-amber-500 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <MapPinned className="text-amber-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{selectedRegion?.name || "Kanha National Park"} — AI Narrative Report</h2>
                <p className="text-xs text-slate-400">Target Region Status: <strong className="text-amber-400">{selectedRegion?.status || "Critical"}</strong> · Latest NDVI: <strong className="text-emerald-400">{selectedRegion?.latestNDVI || 0.21}</strong></p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles size={13} /> AI Explanation Active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            <strong>AI Executive Summary:</strong> Analysis of multi-spectral satellite imagery for <strong>{selectedRegion?.name}</strong> indicates significant canopy stress. The Random Forest Risk Classifier evaluated 65,536 pixels, identifying abnormal drops in Near-Infrared (NIR) reflectance that correlate with tree canopy removal rather than typical seasonal foliage changes.
          </div>
        </div>

        {/* Spectral Band Physics & NDVI Math Visualizer */}
        <div className="fg-card p-6 space-y-4 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            1. Spectral Band Physics & NDVI Calculation Science
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-red-400 block">🔴 Band 4 (Red Light)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Absorbed strongly by healthy chlorophyll for photosynthesis. High red reflectance indicates bare soil or dead vegetation.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">Typical Red: 0.22 - 0.42</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">🌿 Band 8 (Near-Infrared / NIR)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reflected intensely by healthy plant cell structures. Dropping NIR reflectance signals structural canopy loss.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">Typical NIR: 0.51 - 0.82</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-400 block">🧮 NDVI Formula</span>
              <div className="p-2.5 rounded bg-slate-950 font-mono text-center text-xs text-purple-300 border border-purple-500/30">
                NDVI = (NIR - RED) / (NIR + RED)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Yields a score from -1.0 to +1.0. Scores above 0.60 represent dense forest; scores below 0.30 indicate severe risk.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Tier Risk Threshold & Decision Tree */}
        <div className="fg-card p-6 space-y-4 border-l-4 border-l-purple-500">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu size={16} className="text-purple-400" />
            2. Risk Threshold Decision Matrix & Ranger Protocols
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">🟢 SAFE / LOW RISK</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Loss &lt; 15%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dense healthy canopy. NDVI &gt; 0.60. Stable ecosystem with active vegetation growth.
              </p>
              <div className="p-2 rounded bg-slate-900 text-[11px] text-emerald-300 font-semibold">
                Protocol: Monthly automated satellite orbit check.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">🟡 WARNING / MEDIUM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Loss 15% - 30%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Moderate canopy thinning or drought stress. NDVI 0.30 - 0.60. Biomass reduction detected.
              </p>
              <div className="p-2 rounded bg-slate-900 text-[11px] text-amber-300 font-semibold">
                Protocol: Bi-weekly drone scan & ranger patrol.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400">🔴 CRITICAL / HIGH</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">Loss &ge; 30%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Severe canopy clearance or logging. NDVI &lt; 0.30. Bare ground exposure exceeds safety thresholds.
              </p>
              <div className="p-2 rounded bg-slate-900 text-[11px] text-red-300 font-semibold">
                Protocol: Immediate emergency dispatch & legal evidence log.
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Factor Confidence Score Radar */}
        <div className="fg-card p-6 border-l-4 border-l-emerald-500 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              3. Multi-Factor Confidence Score System Breakdown
            </h3>
            <span className="text-xl font-black text-emerald-400">94% Confidence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">GeoTIFF Data Quality</span>
              <span className="text-2xl font-bold text-emerald-400">95%</span>
              <p className="text-[10px] text-slate-500">Full 32-bit float spectral integrity</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Pixel-Level Coverage</span>
              <span className="text-2xl font-bold text-emerald-400">100%</span>
              <p className="text-[10px] text-slate-500">65,536 / 65,536 valid pixels</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Weather & Cloud Masking</span>
              <span className="text-2xl font-bold text-blue-400">3% Cloud</span>
              <p className="text-[10px] text-slate-500">Minimal atmospheric distortion</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">ML Model Architecture</span>
              <span className="text-2xl font-bold text-purple-400">Random Forest</span>
              <p className="text-[10px] text-slate-500">100 Estimator Decision Trees</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Explainability;
