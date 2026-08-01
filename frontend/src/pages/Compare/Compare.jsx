import { useState } from "react";
import { Sliders, Leaf, AlertTriangle, MapPinned, CheckCircle2, ArrowRight, Play, Activity, Sparkles, RefreshCw } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ForestMap from "../../components/map/ForestMap";
import useRegions from "../../hooks/useRegions";
import { createAnalysis } from "../../services/analysis.service";
import toast from "react-hot-toast";

function Compare() {
  const { regions, loading } = useRegions();
  const [region1Id, setRegion1Id] = useState("");
  const [region2Id, setRegion2Id] = useState("");

  const [region1Analysis, setRegion1Analysis] = useState(null);
  const [region2Analysis, setRegion2Analysis] = useState(null);
  const [analyzing1, setAnalyzing1] = useState(false);
  const [analyzing2, setAnalyzing2] = useState(false);

  // Region 1 object
  const r1 = regions.find((r) => r.regionId === region1Id || r._id === region1Id) || regions[0];
  // Region 2 object
  const r2 = regions.find((r) => r.regionId === region2Id || r._id === region2Id) || (regions[5] || regions[1] || regions[0]);

  // Coords for Map 1
  const coords1 = r1 ? {
    latitude: r1.coordinates?.[0]?.latitude ?? 22.33,
    longitude: r1.coordinates?.[0]?.longitude ?? 80.61,
    name: r1.name,
    status: r1.status || "Critical"
  } : null;

  // Coords for Map 2
  const coords2 = r2 ? {
    latitude: r2.coordinates?.[0]?.latitude ?? 20.23,
    longitude: r2.coordinates?.[0]?.longitude ?? 79.41,
    name: r2.name,
    status: r2.status || "Safe"
  } : null;

  const handleAnalyze1 = async () => {
    if (!r1) return;
    try {
      setAnalyzing1(true);
      const res = await createAnalysis(r1.regionId || r1._id);
      setRegion1Analysis(res.data);
      toast.success(`Analysis completed for ${r1.name}!`);
    } catch (err) {
      toast.error(`Analysis failed for ${r1.name}`);
    } finally {
      setAnalyzing1(false);
    }
  };

  const handleAnalyze2 = async () => {
    if (!r2) return;
    try {
      setAnalyzing2(true);
      const res = await createAnalysis(r2.regionId || r2._id);
      setRegion2Analysis(res.data);
      toast.success(`Analysis completed for ${r2.name}!`);
    } catch (err) {
      toast.error(`Analysis failed for ${r2.name}`);
    } finally {
      setAnalyzing2(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="text-blue-400" size={24} />
              Dual-Map Regional Comparison Mode
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compare satellite map coordinates, NDVI spectral signals, and AI risk predictions side-by-side.
            </p>
          </div>
        </header>

        {/* Dual Map Control Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region 1 Control */}
          <div className="fg-card p-4 border-l-4 border-l-emerald-500 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <MapPinned size={15} /> MAP 1: PRIMARY REGION
              </span>
              <button
                type="button"
                onClick={handleAnalyze1}
                disabled={analyzing1}
                className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
              >
                {analyzing1 ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                Run Map 1 Analysis
              </button>
            </div>
            <select
              value={region1Id}
              onChange={(e) => setRegion1Id(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              {regions.map((r) => (
                <option key={r.regionId || r._id} value={r.regionId || r._id}>
                  {r.name} — {r.state} [{r.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Region 2 Control */}
          <div className="fg-card p-4 border-l-4 border-l-blue-500 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <MapPinned size={15} /> MAP 2: COMPARISON REGION
              </span>
              <button
                type="button"
                onClick={handleAnalyze2}
                disabled={analyzing2}
                className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
              >
                {analyzing2 ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                Run Map 2 Analysis
              </button>
            </div>
            <select
              value={region2Id}
              onChange={(e) => setRegion2Id(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              {regions.map((r) => (
                <option key={r.regionId || r._id} value={r.regionId || r._id}>
                  {r.name} — {r.state} [{r.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map 1 */}
          <div className="fg-card overflow-hidden border border-emerald-500/20">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">{r1?.name || "Kanha National Park"}</span>
              <span className="text-[10px] text-slate-400">{coords1?.latitude}°N, {coords1?.longitude}°E</span>
            </div>
            <div className="relative min-h-[380px]">
              <ForestMap
                regions={regions}
                selectedRegionId={r1?.regionId || r1?._id}
                selectedCoords={coords1}
              />
            </div>
            {/* Map 1 Details Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Status</span>
                <span className={`font-bold ${r1?.status === "Critical" ? "text-red-400" : r1?.status === "Warning" ? "text-amber-400" : "text-emerald-400"}`}>
                  {region1Analysis?.riskClassification?.riskLevel || r1?.status || "Critical"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">NDVI</span>
                <span className="font-bold text-emerald-400">{region1Analysis?.satelliteData?.ndvi ?? r1?.latestNDVI ?? 0.21}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Biomass Loss</span>
                <span className="font-bold text-red-400">{region1Analysis?.riskClassification?.vegetationLossPercentage ?? r1?.latestRiskScore ?? 34}%</span>
              </div>
            </div>
          </div>

          {/* Map 2 */}
          <div className="fg-card overflow-hidden border border-blue-500/20">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-400">{r2?.name || "Tadoba-Andhari Reserve"}</span>
              <span className="text-[10px] text-slate-400">{coords2?.latitude}°N, {coords2?.longitude}°E</span>
            </div>
            <div className="relative min-h-[380px]">
              <ForestMap
                regions={regions}
                selectedRegionId={r2?.regionId || r2?._id}
                selectedCoords={coords2}
              />
            </div>
            {/* Map 2 Details Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Status</span>
                <span className={`font-bold ${r2?.status === "Critical" ? "text-red-400" : r2?.status === "Warning" ? "text-amber-400" : "text-emerald-400"}`}>
                  {region2Analysis?.riskClassification?.riskLevel || r2?.status || "Safe"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">NDVI</span>
                <span className="font-bold text-emerald-400">{region2Analysis?.satelliteData?.ndvi ?? r2?.latestNDVI ?? 0.71}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Biomass Loss</span>
                <span className="font-bold text-red-400">{region2Analysis?.riskClassification?.vegetationLossPercentage ?? r2?.latestRiskScore ?? 12}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Metrics Table */}
        <div className="fg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            Side-by-Side Analytical Comparison Table
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3 text-emerald-400">{r1?.name || "Region 1"}</th>
                  <th className="py-2.5 px-3 text-blue-400">{r2?.name || "Region 2"}</th>
                  <th className="py-2.5 px-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-400">Risk Classification</td>
                  <td className="py-2.5 px-3 font-bold text-red-400">{region1Analysis?.riskClassification?.riskLevel || r1?.status || "Critical"}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{region2Analysis?.riskClassification?.riskLevel || r2?.status || "Safe"}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">High Delta</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-400">Mean NDVI Index</td>
                  <td className="py-2.5 px-3 font-mono">{region1Analysis?.satelliteData?.ndvi ?? r1?.latestNDVI ?? 0.21}</td>
                  <td className="py-2.5 px-3 font-mono">{region2Analysis?.satelliteData?.ndvi ?? r2?.latestNDVI ?? 0.71}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-400">
                    +{( (region2Analysis?.satelliteData?.ndvi ?? r2?.latestNDVI ?? 0.71) - (region1Analysis?.satelliteData?.ndvi ?? r1?.latestNDVI ?? 0.21) ).toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-400">Biomass Loss %</td>
                  <td className="py-2.5 px-3 text-red-400 font-bold">{region1Analysis?.riskClassification?.vegetationLossPercentage ?? r1?.latestRiskScore ?? 34}%</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{region2Analysis?.riskClassification?.vegetationLossPercentage ?? r2?.latestRiskScore ?? 12}%</td>
                  <td className="py-2.5 px-3 text-red-400 font-bold">
                    {Math.abs( (region1Analysis?.riskClassification?.vegetationLossPercentage ?? r1?.latestRiskScore ?? 34) - (region2Analysis?.riskClassification?.vegetationLossPercentage ?? r2?.latestRiskScore ?? 12) )}% Difference
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-400">Satellite Sensor</td>
                  <td className="py-2.5 px-3">Sentinel-2 L2A (10m)</td>
                  <td className="py-2.5 px-3">Sentinel-2 L2A (10m)</td>
                  <td className="py-2.5 px-3 text-emerald-400">Calibrated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Compare;
