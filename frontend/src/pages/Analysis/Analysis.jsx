import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Play,
  RotateCcw,
  Activity,
  Eye,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Leaf,
  ShieldAlert,
  MapPinned,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import { TableSkeleton } from "../../components/common/Loader";

import AnalysisDetailsModal from "../../components/analysis/AnalysisDetailsModal";
import AnalysisResultView from "../../components/analysis/AnalysisResultView";

import {
  createAnalysis,
  getAllAnalysis,
} from "../../services/analysis.service";

import {
  getRegions,
} from "../../services/region.service";

const LIMIT = 8;

/* ============================================================
   DUMMY ANALYSES  — shown when no real history exists yet
============================================================ */

const DUMMY_ANALYSES = [
  {
    _id: "dummy-001",
    regionName: "Kanha National Park",
    regionId: { regionId: "KNP-001", name: "Kanha National Park", status: "Critical" },
    riskClassification: { riskLevel: "Critical", riskScore: 0.88, vegetationLossPercentage: 34, confidenceScore: 0.96, level: "Critical" },
    ndvi: [0.21],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.41, nir: 0.52, ndvi: 0.21, cloudCover: 3, vegetationHealth: "Poor", captureDate: "2026-07-28T08:12:00.000Z", location: { latitude: 22.33, longitude: 80.61 } },
    changeDetection: { decreaseCount: 22150, stableCount: 38000, increaseCount: 4386 },
    explainability: {
      summary: "Critical deforestation activity detected. 34% vegetation loss confirms severe illegal logging and fire scarring over the last 30 days.",
      reasons: [
        { title: "Extreme NDVI Decline", explanation: "Mean NDVI dropped to 0.21, well below the critical threshold of 0.30, indicating near-total canopy loss.", metric: "NDVI 0.21", severity: "critical" },
        { title: "Illegal Logging Activity", explanation: "Change detection reveals 22,150 pixels with confirmed biomass decrease, matching logging corridor signatures.", metric: "22 150 px loss", severity: "critical" },
        { title: "Fire Scar Pattern", explanation: "Thermal band anomalies detected in 3 sub-clusters consistent with ground-level fire activity.", metric: "3 fire clusters", severity: "critical" },
        { title: "Soil Exposure Index", explanation: "Bare-earth spectral signature covers ~28% of the zone, indicating root-level clearing.", metric: "28% bare soil", severity: "critical" },
        { title: "Rapid Change Velocity", explanation: "Vegetation loss rate of 1.1% per day exceeds the emergency response threshold for this biome.", metric: "1.1%/day", severity: "critical" },
      ],
      primaryFactor: "Extreme NDVI Decline (0.21)",
      secondaryFactors: ["Dispatch ranger patrol immediately.", "Notify district forest officer.", "Enable real-time satellite alerts."],
    },
    confidenceScore: 0.96,
    cloudCoverage: 3,
    pixelConsistency: 0.97,
    detectionMethod: "ml",
    vegetationLossPercentage: 34,
    processingTime: 1820,
    executionTime: "1.82s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy001.pdf",
    createdAt: "2026-07-28T08:22:00.000Z",
    timestamp: "2026-07-28T08:22:00.000Z",
  },
  {
    _id: "dummy-002",
    regionName: "Pench Tiger Reserve",
    regionId: { regionId: "PTR-002", name: "Pench Tiger Reserve", status: "Critical" },
    riskClassification: { riskLevel: "High", riskScore: 0.74, vegetationLossPercentage: 22, confidenceScore: 0.91, level: "High" },
    ndvi: [0.31],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.35, nir: 0.58, ndvi: 0.31, cloudCover: 8, vegetationHealth: "Poor", captureDate: "2026-07-25T07:45:00.000Z", location: { latitude: 21.75, longitude: 79.42 } },
    changeDetection: { decreaseCount: 14400, stableCount: 45000, increaseCount: 6136 },
    explainability: {
      summary: "High-risk forest degradation detected. Significant biomass loss pattern consistent with selective felling and encroachment along the western buffer.",
      reasons: [
        { title: "Selective Canopy Felling", explanation: "Isolated high-value tree removal evident from sparse pixel-level loss scattered across 14 400 pixels.", metric: "14 400 px loss", severity: "high" },
        { title: "NDVI Below Warning Threshold", explanation: "Mean NDVI of 0.31 falls in the high-risk band, signalling degraded but partially intact canopy.", metric: "NDVI 0.31", severity: "high" },
        { title: "Buffer Zone Encroachment", explanation: "2.4 km² of encroachment detected along the western boundary per spatial overlap analysis.", metric: "2.4 km² encroached", severity: "high" },
        { title: "Monsoon Stress Amplifier", explanation: "Below-average rainfall this season reduced resilience, compounding the human-induced stress signal.", metric: "−18% rainfall", severity: "medium" },
        { title: "Moisture Deficit Index", explanation: "SWIR bands indicate soil moisture deficit across 19% of the zone, accelerating canopy thinning.", metric: "19% dry zone", severity: "medium" },
      ],
      primaryFactor: "Selective Canopy Felling",
      secondaryFactors: ["Increase patrol frequency in western sector.", "Deploy camera traps.", "File encroachment report with revenue authority."],
    },
    confidenceScore: 0.91,
    cloudCoverage: 8,
    pixelConsistency: 0.94,
    detectionMethod: "ml",
    vegetationLossPercentage: 22,
    processingTime: 1640,
    executionTime: "1.64s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy002.pdf",
    createdAt: "2026-07-25T10:30:00.000Z",
    timestamp: "2026-07-25T10:30:00.000Z",
  },
  {
    _id: "dummy-003",
    regionName: "Satpura Biosphere Reserve",
    regionId: { regionId: "SBR-003", name: "Satpura Biosphere Reserve", status: "Warning" },
    riskClassification: { riskLevel: "High", riskScore: 0.68, vegetationLossPercentage: 18, confidenceScore: 0.87, level: "High" },
    ndvi: [0.35],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.31, nir: 0.62, ndvi: 0.35, cloudCover: 12, vegetationHealth: "Fair", captureDate: "2026-07-22T09:00:00.000Z", location: { latitude: 22.57, longitude: 78.10 } },
    changeDetection: { decreaseCount: 11700, stableCount: 48000, increaseCount: 5836 },
    explainability: {
      summary: "High risk from combined drought stress and anthropogenic pressure. Vegetation loss of 18% concentrated in the core zone.",
      reasons: [
        { title: "Core Zone Vegetation Loss", explanation: "11 700 pixels in the protected core show biomass reduction, breaching the 10% alert threshold.", metric: "18% loss in core", severity: "high" },
        { title: "Drought Stress Signature", explanation: "Visible canopy browning in the red/NIR band ratio, consistent with sustained moisture deficit.", metric: "NDVI 0.35", severity: "high" },
        { title: "Cloud Interference", explanation: "12% cloud cover may slightly underestimate loss extent; ground verification recommended.", metric: "12% cloud cover", severity: "medium" },
        { title: "Grazing Pressure", explanation: "Understory depletion pattern consistent with unregulated livestock grazing in buffer fringe.", metric: "~6 km² affected", severity: "medium" },
        { title: "Road Expansion Signal", explanation: "Linear clearing 3.1 km in length detected, matching new road construction signature.", metric: "3.1 km linear cut", severity: "high" },
      ],
      primaryFactor: "Core Zone Vegetation Loss (18%)",
      secondaryFactors: ["Engage anti-encroachment team.", "Install canopy moisture sensors.", "Coordinate with highway authority."],
    },
    confidenceScore: 0.87,
    cloudCoverage: 12,
    pixelConsistency: 0.91,
    detectionMethod: "ml",
    vegetationLossPercentage: 18,
    processingTime: 1510,
    executionTime: "1.51s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy003.pdf",
    createdAt: "2026-07-22T11:10:00.000Z",
    timestamp: "2026-07-22T11:10:00.000Z",
  },
  {
    _id: "dummy-004",
    regionName: "Bori Wildlife Sanctuary",
    regionId: { regionId: "BWS-004", name: "Bori Wildlife Sanctuary", status: "Warning" },
    riskClassification: { riskLevel: "Medium", riskScore: 0.51, vegetationLossPercentage: 11, confidenceScore: 1.0, level: "Medium" },
    ndvi: [0.49],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.22, nir: 0.65, ndvi: 0.49, cloudCover: 5, vegetationHealth: "Good", captureDate: "2026-07-18T06:30:00.000Z", location: { latitude: 22.49, longitude: 77.97 } },
    changeDetection: { decreaseCount: 8192, stableCount: 52000, increaseCount: 5344 },
    explainability: {
      summary: "Moderate vegetation stress detected. NDVI is in the warning band. Monitoring recommended but no emergency response required.",
      reasons: [
        { title: "Moderate NDVI Reading", explanation: "Mean NDVI of 0.49 is in the moderate band — canopy is thinning but largely intact.", metric: "NDVI 0.49", severity: "medium" },
        { title: "Estimated 11% Vegetation Loss", explanation: "Approximately 11% of the observed area shows reduced vegetation cover compared to the baseline.", metric: "11% loss", severity: "medium" },
        { title: "Seasonal Variation Factor", explanation: "Partial leaf-shedding typical of deciduous species in pre-monsoon transition accounts for ~4% of the reduction.", metric: "~4% seasonal", severity: "low" },
        { title: "Minor Encroachment Detected", explanation: "Small-scale agricultural expansion (~0.8 km²) identified at the south-eastern fringe.", metric: "0.8 km² encroached", severity: "medium" },
        { title: "Stable Pixel Majority", explanation: "79% of total pixels remain stable, indicating the ecosystem is not in active decline.", metric: "79% stable", severity: "low" },
      ],
      primaryFactor: "Moderate NDVI of 0.49",
      secondaryFactors: ["Schedule follow-up analysis in 15 days.", "Monitor encroachment at SE boundary.", "Review seasonal baseline for this zone."],
    },
    confidenceScore: 1.0,
    cloudCoverage: 5,
    pixelConsistency: 0.993,
    detectionMethod: "ml",
    vegetationLossPercentage: 11,
    processingTime: 980,
    executionTime: "0.98s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy004.pdf",
    createdAt: "2026-07-18T08:45:00.000Z",
    timestamp: "2026-07-18T08:45:00.000Z",
  },
  {
    _id: "dummy-005",
    regionName: "Melghat Tiger Reserve",
    regionId: { regionId: "MTR-005", name: "Melghat Tiger Reserve", status: "Warning" },
    riskClassification: { riskLevel: "Medium", riskScore: 0.46, vegetationLossPercentage: 9, confidenceScore: 0.88, level: "Medium" },
    ndvi: [0.52],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.19, nir: 0.67, ndvi: 0.52, cloudCover: 7, vegetationHealth: "Good", captureDate: "2026-07-14T07:00:00.000Z", location: { latitude: 21.45, longitude: 77.29 } },
    changeDetection: { decreaseCount: 6850, stableCount: 54000, increaseCount: 4706 },
    explainability: {
      summary: "Low-medium risk. Vegetation index shows a healthy canopy in most of the reserve. A 9% localised loss zone requires periodic monitoring.",
      reasons: [
        { title: "Healthy Canopy NDVI", explanation: "NDVI of 0.52 indicates a healthy to moderate canopy condition across most of the reserve.", metric: "NDVI 0.52", severity: "low" },
        { title: "Localised 9% Loss Patch", explanation: "A ~9% loss cluster is concentrated in a 1.2 km² patch near the northern corridor.", metric: "9% in 1.2 km²", severity: "medium" },
        { title: "Wildlife Corridor Thinning", explanation: "Vegetation connectivity index dropped 6% along the tiger movement corridor since last assessment.", metric: "−6% connectivity", severity: "medium" },
        { title: "Low Cloud Interference", explanation: "7% cloud cover introduces minimal error; result confidence remains high.", metric: "7% cloud cover", severity: "low" },
        { title: "Natural Regeneration Signs", explanation: "4 706 pixels show positive NDVI growth, indicating natural recovery in cleared patches.", metric: "4 706 px growth", severity: "low" },
      ],
      primaryFactor: "Localised 9% Loss in Northern Corridor",
      secondaryFactors: ["Monitor northern corridor monthly.", "Support natural regeneration with water retention.", "No immediate intervention required."],
    },
    confidenceScore: 0.88,
    cloudCoverage: 7,
    pixelConsistency: 0.985,
    detectionMethod: "ml",
    vegetationLossPercentage: 9,
    processingTime: 1120,
    executionTime: "1.12s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy005.pdf",
    createdAt: "2026-07-14T09:20:00.000Z",
    timestamp: "2026-07-14T09:20:00.000Z",
  },
  {
    _id: "dummy-006",
    regionName: "Tadoba-Andhari Reserve",
    regionId: { regionId: "TAR-006", name: "Tadoba-Andhari Reserve", status: "Safe" },
    riskClassification: { riskLevel: "Low", riskScore: 0.18, vegetationLossPercentage: 3, confidenceScore: 0.94, level: "Low" },
    ndvi: [0.71],
    satelliteData: { dataSource: "Sentinel-2", fallbackUsed: false, red: 0.11, nir: 0.82, ndvi: 0.71, cloudCover: 2, vegetationHealth: "Excellent", captureDate: "2026-07-10T06:00:00.000Z", location: { latitude: 20.23, longitude: 79.41 } },
    changeDetection: { decreaseCount: 2100, stableCount: 60000, increaseCount: 3436 },
    explainability: {
      summary: "Excellent forest health. NDVI of 0.71 is well above the safe threshold. Minimal vegetation loss of 3% within natural seasonal variation.",
      reasons: [
        { title: "Excellent NDVI Reading", explanation: "Mean NDVI of 0.71 ranks this region in the top 10% of monitored zones, indicating dense, healthy canopy.", metric: "NDVI 0.71", severity: "low" },
        { title: "Minimal Vegetation Loss", explanation: "Only 3% estimated vegetation loss, attributable to natural tree-fall and seasonal shedding.", metric: "3% natural loss", severity: "low" },
        { title: "High Pixel Stability", explanation: "92% of all pixels remain stable — the highest stability score across all monitored regions.", metric: "92% stable", severity: "low" },
        { title: "Positive Regeneration", explanation: "3 436 pixels show active vegetation growth, indicating a healthy regeneration cycle.", metric: "3 436 px growth", severity: "low" },
        { title: "Minimal Cloud Interference", explanation: "2% cloud cover ensures the analysis has the highest possible spatial accuracy.", metric: "2% cloud cover", severity: "low" },
      ],
      primaryFactor: "Excellent NDVI of 0.71",
      secondaryFactors: ["Continue monthly monitoring schedule.", "This region can serve as a biodiversity offset reference.", "No intervention required."],
    },
    confidenceScore: 0.94,
    cloudCoverage: 2,
    pixelConsistency: 0.998,
    detectionMethod: "ml",
    vegetationLossPercentage: 3,
    processingTime: 890,
    executionTime: "0.89s",
    status: "completed",
    pdfReportPath: "reports/analysis_dummy006.pdf",
    createdAt: "2026-07-10T07:15:00.000Z",
    timestamp: "2026-07-10T07:15:00.000Z",
  },
];

/* ============================================================
   HELPERS
============================================================ */

/**
 * Supports:
 * riskClassification.riskLevel
 * riskClassification.level
 * analysis.riskLevel
 */
function getRiskLevel(analysis) {
  return (
    analysis?.riskClassification?.riskLevel ||
    analysis?.riskClassification?.level ||
    analysis?.riskLevel ||
    "Unknown"
  );
}

/**
 * Supports:
 * 0.92 -> 92%
 * 92   -> 92%
 */
function getConfidence(analysis) {
  const raw =
    analysis?.riskClassification
      ?.confidenceScore ??
    analysis?.confidenceScore ??
    0;

  const number = Number(raw);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number <= 1
    ? number * 100
    : number;
}

/**
 * Supports:
 * [0.52]
 * 0.52
 * { mean: 0.52 }
 */
function getNDVI(analysis) {
  const ndvi = analysis?.ndvi;

  if (Array.isArray(ndvi)) {
    const value = Number(ndvi[0]);

    return Number.isFinite(value)
      ? value
      : null;
  }

  if (
    ndvi &&
    typeof ndvi === "object"
  ) {
    const value = Number(ndvi.mean);

    return Number.isFinite(value)
      ? value
      : null;
  }

  const value = Number(ndvi);

  return Number.isFinite(value)
    ? value
    : null;
}

/**
 * Region name compatibility.
 */
function getRegionName(analysis) {
  return (
    analysis?.regionName ||
    analysis?.regionId?.name ||
    analysis?.region?.name ||
    "Unknown Region"
  );
}

/* ============================================================
   RISK BADGE
============================================================ */

function RiskBadge({ level }) {
  const normalized = String(
    level || "Unknown"
  )
    .trim()
    .toLowerCase();

  let badgeClass = "badge-info";
  let label = level || "Unknown";

  if (
    normalized === "high" ||
    normalized === "critical"
  ) {
    badgeClass = "badge-critical";

    label =
      normalized === "critical"
        ? "Critical"
        : "High";
  } else if (
    normalized === "medium" ||
    normalized === "warning"
  ) {
    badgeClass = "badge-warning";

    label =
      normalized === "warning"
        ? "Warning"
        : "Medium";
  } else if (
    normalized === "low" ||
    normalized === "safe"
  ) {
    badgeClass = "badge-safe";

    label =
      normalized === "safe"
        ? "Safe"
        : "Low";
  }

  return (
    <span
      className={`badge ${badgeClass}`}
    >
      {label}
    </span>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Analysis() {
  /* ---------------- Data ---------------- */

  const [regions, setRegions] =
    useState([]);

  const [analyses, setAnalyses] =
    useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [page, setPage] =
    useState(1);

  /* ---------------- Analysis ---------------- */

  const [
    selectedRegion,
    setSelectedRegion,
  ] = useState("");

  const [running, setRunning] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  /* ---------------- Modal ---------------- */

  const [selected, setSelected] =
    useState(null);

  const [showDetail, setShowDetail] =
    useState(false);

  /* ---------------- Latest result ---------------- */

  const [
    latestResult,
    setLatestResult,
  ] = useState(null);

  const resultRef = useRef(null);

  /* ============================================================
     PRE-LOAD RESULT FROM DASHBOARD (router state)
  ============================================================ */

  const location = useLocation();

  useEffect(() => {
    const incoming = location.state?.analysisResult;

    if (incoming) {
      setLatestResult(incoming);

      /* Scroll to result panel after the component has rendered */
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);

      /* Clear the router state so a browser-back + forward
         doesn't re-inject the stale result */
      window.history.replaceState(
        { ...window.history.state, state: undefined },
        ""
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================================================
     LOAD REGIONS
  ============================================================ */

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await getRegions({
          limit: 100,
        });

        /*
         * Supports:
         * { data: [...] }
         * { data: { regions: [...] } }
         * [...]
         */

        const regionList =
          Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(
                    res?.data?.regions
                  )
                ? res.data.regions
                : [];

        setRegions(regionList);
      } catch (error) {
        console.error(
          "Failed to load regions:",
          error
        );

        toast.error(
          "Failed to load forest regions"
        );
      }
    };

    loadRegions();
  }, []);

  /* ============================================================
     LOAD ANALYSIS HISTORY
  ============================================================ */

  const fetchHistory =
    useCallback(async () => {
      try {
        setLoading(true);

        const res =
          await getAllAnalysis({
            page,
            limit: LIMIT,
          });

        /*
         * Support multiple backend response shapes.
         */

        const list =
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(
                  res?.data?.analyses
                )
              ? res.data.analyses
              : Array.isArray(
                    res?.analyses
                  )
                ? res.analyses
                : [];

        const paginationData =
          res?.pagination ||
          res?.data?.pagination ||
          null;

        setAnalyses(list);

        setPagination(
          paginationData
        );
      } catch (error) {
        console.error(
          "Failed to load analysis history:",
          error
        );

        toast.error(
          "Failed to load analysis history"
        );
      } finally {
        setLoading(false);
      }
    }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* ============================================================
     RUN ANALYSIS
  ============================================================ */

  const runAnalysis = async () => {
    if (!selectedRegion) {
      toast.error(
        "Please select a region first"
      );

      return;
    }

    try {
      setRunning(true);

      setLatestResult(null);

      const res =
        await createAnalysis(
          selectedRegion
        );

      /*
       * analysis.service currently returns:
       *
       * response.data
       *
       * usually:
       * {
       *   success,
       *   message,
       *   data
       * }
       */

      const result =
        res?.data ||
        res?.analysis ||
        res;

      setLatestResult(result);

      toast.success(
        "Analysis completed successfully"
      );

      /*
       * If user was on another page,
       * return to page 1 so newest
       * analysis is visible.
       */

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchHistory();
      }
    } catch (error) {
      console.error(
        "Analysis failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.normalizedMessage ||
        error?.message ||
        "Analysis failed"
      );
    } finally {
      setRunning(false);
    }
  };

  /* ============================================================
     DETAILS MODAL
  ============================================================ */

  const openDetail = (
    analysis
  ) => {
    setSelected(analysis);

    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);

    setSelected(null);
  };

  /* ============================================================
     LATEST RESULT VALUES
  ============================================================ */

  const latestRisk =
    latestResult
      ? getRiskLevel(latestResult)
      : "Unknown";

  const latestConfidence =
    latestResult
      ? getConfidence(latestResult)
      : 0;

  const latestNDVI =
    latestResult
      ? getNDVI(latestResult)
      : null;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Layout>

      {/* ========================================================
          RUN ANALYSIS
      ======================================================== */}

      <div className="fg-card p-6 mb-6">

        {/* Header */}

        <div
          className="
            flex
            items-center
            gap-3
            mb-5
          "
        >
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
                "rgba(34,197,94,0.10)",

              border:
                "1px solid rgba(34,197,94,0.20)",
            }}
          >
            <Cpu
              size={18}
              style={{
                color: "#4ade80",
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
              Run New Analysis
            </h2>

            <p
              className="text-xs"
              style={{
                color:
                  "var(--text-muted)",
              }}
            >
              Sentinel Satellite → ML
              Models → Gemini AI → PDF
              Report
            </p>
          </div>
        </div>

        {/* Controls */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
          "
        >
          <div
            className="
              relative
              flex-1
            "
          >
            <MapPinned
              size={15}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                pointer-events-none
              "
              style={{
                color:
                  "var(--text-muted)",
              }}
            />

            <select
              value={
                selectedRegion
              }
              onChange={(e) =>
                setSelectedRegion(
                  e.target.value
                )
              }
              disabled={running}
              className="
                fg-input
                fg-select
                text-sm
                w-full
                pl-9
              "
            >
              <option value="">
                Select a forest
                region...
              </option>

              {regions.map(
                (region) => (
                  <option
                    key={region._id}
                    value={region._id}
                  >
                    {region.name}
                    {region.state
                      ? ` — ${region.state}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={runAnalysis}
            disabled={
              running ||
              !selectedRegion
            }
            className="
              btn
              btn-primary
              min-w-36
            "
          >
            {running ? (
              <>
                <span
                  className="
                    w-4
                    h-4
                    border-2
                    border-white/30
                    border-t-white
                    rounded-full
                  "
                  style={{
                    animation:
                      "spin 0.75s linear infinite",
                  }}
                />

                Analyzing...
              </>
            ) : (
              <>
                <Play size={15} />

                Run Analysis
              </>
            )}
          </button>
        </div>

        {/* Running Pipeline */}

        {running && (
          <div
            className="
              mt-5
              p-4
              rounded-xl
            "
            style={{
              background:
                "rgba(34,197,94,0.04)",

              border:
                "1px solid rgba(34,197,94,0.12)",
            }}
          >
            <p
              className="
                text-xs
                font-semibold
                mb-3
              "
              style={{
                color: "#4ade80",
              }}
            >
              ForestGuard analysis
              pipeline running...
            </p>

            <div className="space-y-2">
              {[
                "Fetching Sentinel satellite data...",
                "Running NDVI vegetation model...",
                "Running change detection model...",
                "Classifying forest risk...",
                "Generating Gemini AI explanation...",
                "Creating analysis report...",
              ].map(
                (step, index) => (
                  <div
                    key={step}
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                    "
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    <span
                      className="
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-green-500
                      "
                      style={{
                        animation:
                          `pulse-dot 1.5s ease ${
                            index *
                            0.2
                          }s infinite`,
                      }}
                    />

                    {step}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          LATEST ANALYSIS RESULT
      ======================================================== */}

      {latestResult && (
        <div ref={resultRef} className="mb-6 animate-fade-in">
          <AnalysisResultView analysis={latestResult} />
        </div>
      )}

      {/* ========================================================
          HISTORY
      ======================================================== */}

      <div className="fg-card overflow-hidden">

        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            p-5
            border-b
          "
          style={{
            borderColor:
              "var(--bg-border)",
          }}
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <FileSearch
              size={16}
              style={{
                color:
                  "var(--text-muted)",
              }}
            />

            <h3
              className="
                text-sm
                font-semibold
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            >
              Analysis History
            </h3>

            {analyses.length > 0 ? (
              <span className="badge badge-info">
                {pagination?.total || analyses.length} total
              </span>
            ) : (
              <span className="badge badge-warning">
                {DUMMY_ANALYSES.length} sample records
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="
              btn
              btn-ghost
              w-8
              h-8
              p-0
              rounded-xl
              disabled:opacity-50
            "
            title="Refresh analysis history"
            style={{
              border:
                "1px solid var(--bg-border)",
            }}
          >
            <RotateCcw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
              style={{
                color:
                  "var(--text-muted)",
              }}
            />
          </button>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="fg-table">

            <thead>
              <tr>
                <th>Region</th>

                <th>
                  Risk Level
                </th>

                <th>
                  Confidence
                </th>

                <th>
                  NDVI
                </th>

                <th>
                  Status
                </th>

                <th>
                  Date
                </th>

                <th
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <TableSkeleton
                  rows={LIMIT}
                  cols={7}
                />
              ) : (
                (() => {
                  const displayAnalyses = analyses.length > 0 ? analyses : DUMMY_ANALYSES;
                  const isDummy = analyses.length === 0;

                  return displayAnalyses.map(
                  (analysis) => {
                    const risk =
                      getRiskLevel(
                        analysis
                      );

                    const confidence =
                      getConfidence(
                        analysis
                      );

                    const ndvi =
                      getNDVI(
                        analysis
                      );

                    const regionName =
                      getRegionName(
                        analysis
                      );

                    return (
                      <tr
                        key={
                          analysis._id
                        }
                        className="animate-fade-in"
                      >

                        {/* Region */}

                        <td>
                          <div>
                            <p
                              className="
                                font-medium
                                text-sm
                              "
                              style={{
                                color:
                                  "var(--text-primary)",
                              }}
                            >
                              {
                                regionName
                              }
                            </p>

                            <p
                              className="text-xs"
                              style={{
                                color:
                                  "var(--text-muted)",
                              }}
                            >
                              {analysis
                                .regionId
                                ?.regionId ||
                                ""}
                            </p>
                          </div>
                        </td>

                        {/* Risk */}

                        <td>
                          <RiskBadge
                            level={
                              risk
                            }
                          />
                        </td>

                        {/* Confidence */}

                        <td>
                          <span
                            className="
                              font-medium
                              text-sm
                            "
                            style={{
                              color:
                                confidence >=
                                80
                                  ? "#4ade80"
                                  : confidence >=
                                      50
                                    ? "#fbbf24"
                                    : "#f87171",
                            }}
                          >
                            {confidence.toFixed(
                              1
                            )}
                            %
                          </span>
                        </td>

                        {/* NDVI */}

                        <td>
                          <span
                            className="
                              font-mono
                              text-sm
                            "
                            style={{
                              color:
                                "var(--text-secondary)",
                            }}
                          >
                            {ndvi !==
                            null
                              ? ndvi.toFixed(
                                  3
                                )
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}

                        <td>
                          <span
                            className={`badge ${
                              analysis.status ===
                              "completed"
                                ? "badge-safe"
                                : analysis.status ===
                                    "failed"
                                  ? "badge-critical"
                                  : "badge-info"
                            }`}
                          >
                            {analysis.status ||
                              "unknown"}
                          </span>
                        </td>

                        {/* Date */}

                        <td
                          style={{
                            color:
                              "var(--text-muted)",

                            fontSize:
                              "13px",
                          }}
                        >
                          {analysis.createdAt ||
                          analysis.timestamp
                            ? new Date(
                                analysis.createdAt ||
                                  analysis.timestamp
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month:
                                    "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}

                        <td>
                          <div
                            className="
                              flex
                              justify-end
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openDetail(
                                  analysis
                                )
                              }
                              className="
                                w-8
                                h-8
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                transition-colors
                              "
                              title="View analysis"
                              style={{
                                color:
                                  "var(--text-muted)",
                              }}
                              onMouseEnter={(
                                e
                              ) => {
                                e.currentTarget.style.background =
                                  "rgba(96,165,250,0.10)";

                                e.currentTarget.style.color =
                                  "#60a5fa";
                              }}
                              onMouseLeave={(
                                e
                              ) => {
                                e.currentTarget.style.background =
                                  "transparent";

                                e.currentTarget.style.color =
                                  "var(--text-muted)";
                              }}
                            >
                              <Eye
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  });
                })()
              )}

            </tbody>
          </table>

        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {pagination &&
          pagination.totalPages >
            1 && (
            <div
              className="
                flex
                items-center
                justify-between
                px-5
                py-3
                border-t
              "
              style={{
                borderColor:
                  "var(--bg-border)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color:
                    "var(--text-muted)",
                }}
              >
                Page {page} of{" "}
                {
                  pagination.totalPages
                }{" "}
                · {pagination.total}{" "}
                analyses
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                    )
                  }
                  disabled={
                    page === 1
                  }
                  className="
                    btn
                    btn-ghost
                    w-8
                    h-8
                    p-0
                    rounded-lg
                    disabled:opacity-30
                  "
                  style={{
                    border:
                      "1px solid var(--bg-border)",
                  }}
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        pagination.totalPages,
                        p + 1
                      )
                    )
                  }
                  disabled={
                    page ===
                    pagination.totalPages
                  }
                  className="
                    btn
                    btn-ghost
                    w-8
                    h-8
                    p-0
                    rounded-lg
                    disabled:opacity-30
                  "
                  style={{
                    border:
                      "1px solid var(--bg-border)",
                  }}
                >
                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

      </div>

      {/* ========================================================
          ANALYSIS DETAILS
      ======================================================== */}

      <AnalysisDetailsModal
        open={showDetail}
        onClose={closeDetail}
        analysis={selected}
      />

    </Layout>
  );
}

export default Analysis;