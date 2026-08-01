import jsPDF from "jspdf";

/* ============================================================
   Helper Functions
============================================================ */

/**
 * Supports:
 * riskClassification.riskLevel
 * riskClassification.level
 * riskLevel
 */
const getRiskLevel = (analysis) => {
  return (
    analysis?.riskClassification?.riskLevel ||
    analysis?.riskClassification?.level ||
    analysis?.riskLevel ||
    "Unknown"
  );
};

/**
 * Supports:
 * regionName
 * regionId.name
 * region.name
 */
const getRegionName = (analysis) => {
  return (
    analysis?.regionName ||
    analysis?.regionId?.name ||
    analysis?.region?.name ||
    "Unknown Region"
  );
};

/**
 * Supports confidence:
 * 0.92 -> 92%
 * 92   -> 92%
 */
const getConfidence = (analysis) => {
  const raw =
    analysis?.riskClassification?.confidenceScore ??
    analysis?.confidenceScore ??
    0;

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value <= 1 ? value * 100 : value;
};

/**
 * Supports:
 * [0.52]
 * 0.52
 * { mean: 0.52 }
 */
const getNDVI = (analysis) => {
  const ndvi = analysis?.ndvi;

  if (Array.isArray(ndvi)) {
    const value = Number(ndvi[0]);

    return Number.isFinite(value) ? value : null;
  }

  if (ndvi && typeof ndvi === "object") {
    const value = Number(ndvi.mean);

    return Number.isFinite(value) ? value : null;
  }

  const value = Number(ndvi);

  return Number.isFinite(value) ? value : null;
};

/**
 * Vegetation loss compatibility.
 */
const getVegetationLoss = (analysis) => {
  const value = Number(
    analysis?.riskClassification?.vegetationLossPercentage ??
      analysis?.vegetationLossPercentage ??
      0,
  );

  return Number.isFinite(value) ? value : 0;
};

/**
 * Risk score compatibility.
 */
const getRiskScore = (analysis) => {
  const raw = Number(analysis?.riskClassification?.riskScore ?? 0);

  if (!Number.isFinite(raw)) {
    return 0;
  }

  return raw <= 1 ? raw * 100 : raw;
};

/* ============================================================
   PDF REPORT GENERATOR
============================================================ */

export const generateAnalysisReport = (analysis) => {
  if (!analysis) return;

  const doc = new jsPDF();

  /* ==========================================================
     Normalize Data
  ========================================================== */

  const regionName = getRegionName(analysis);

  const riskLevel = getRiskLevel(analysis);

  const confidence = getConfidence(analysis);

  const ndvi = getNDVI(analysis);

  const vegetationLoss = getVegetationLoss(analysis);

  const riskScore = getRiskScore(analysis);

  const summary =
    analysis?.explainability?.summary ||
    analysis?.explainability?.primaryFactor ||
    "No AI explanation available.";

  const analysisDate =
    analysis?.createdAt || analysis?.timestamp
      ? new Date(analysis.createdAt || analysis.timestamp).toLocaleString(
          "en-IN",
        )
      : "Not available";

  const detectionMethod = analysis?.detectionMethod || "Unknown";

  const processingTime = analysis?.processingTime
    ? `${(analysis.processingTime / 1000).toFixed(2)} seconds`
    : analysis?.executionTime || "Not available";

  /* ==========================================================
     HEADER
  ========================================================== */

  doc.setFillColor(15, 23, 42);

  doc.rect(0, 0, 210, 38, "F");

  doc.setFontSize(22);

  doc.setTextColor(34, 197, 94);

  doc.text("ForestGuard", 20, 17);

  doc.setFontSize(13);

  doc.setTextColor(226, 232, 240);

  doc.text("AI Forest Monitoring & Risk Analysis Report", 20, 27);

  doc.setFontSize(9);

  doc.setTextColor(148, 163, 184);

  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 20, 34);

  /* ==========================================================
     REGION INFORMATION
  ========================================================== */

  let y = 52;

  doc.setTextColor(15, 23, 42);

  doc.setFontSize(15);

  doc.text("Region Information", 20, y);

  doc.setDrawColor(34, 197, 94);

  doc.setLineWidth(0.8);

  doc.line(20, y + 3, 190, y + 3);

  y += 13;

  doc.setFontSize(11);

  doc.setTextColor(71, 85, 105);

  doc.text("Region:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(String(regionName), 62, y);

  y += 8;

  doc.setTextColor(71, 85, 105);

  doc.text("Analysis Date:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(analysisDate, 62, y);

  y += 8;

  doc.setTextColor(71, 85, 105);

  doc.text("Detection:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(String(detectionMethod), 62, y);

  y += 8;

  doc.setTextColor(71, 85, 105);

  doc.text("Processing Time:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(String(processingTime), 62, y);

  /* ==========================================================
     ANALYSIS RESULTS
  ========================================================== */

  y += 17;

  doc.setFontSize(15);

  doc.setTextColor(15, 23, 42);

  doc.text("Analysis Results", 20, y);

  doc.setDrawColor(34, 197, 94);

  doc.line(20, y + 3, 190, y + 3);

  y += 14;

  /* Risk Level */

  doc.setFontSize(11);

  doc.setTextColor(71, 85, 105);

  doc.text("Risk Level:", 20, y);

  const normalizedRisk = String(riskLevel).toLowerCase();

  if (normalizedRisk === "high" || normalizedRisk === "critical") {
    doc.setTextColor(220, 38, 38);
  } else if (normalizedRisk === "medium" || normalizedRisk === "warning") {
    doc.setTextColor(217, 119, 6);
  } else {
    doc.setTextColor(22, 163, 74);
  }

  doc.text(String(riskLevel), 70, y);

  /* Risk Score */

  y += 9;

  doc.setTextColor(71, 85, 105);

  doc.text("Risk Score:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(`${riskScore.toFixed(1)}/100`, 70, y);

  /* Confidence */

  y += 9;

  doc.setTextColor(71, 85, 105);

  doc.text("Confidence:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(`${confidence.toFixed(1)}%`, 70, y);

  /* NDVI */

  y += 9;

  doc.setTextColor(71, 85, 105);

  doc.text("Mean NDVI:", 20, y);

  doc.setTextColor(15, 23, 42);

  doc.text(ndvi !== null ? ndvi.toFixed(3) : "Not available", 70, y);

  /* Vegetation Loss */

  y += 9;

  doc.setTextColor(71, 85, 105);

  doc.text("Vegetation Loss:", 20, y);

  doc.setTextColor(
    vegetationLoss > 10 ? 220 : 22,
    vegetationLoss > 10 ? 38 : 163,
    vegetationLoss > 10 ? 38 : 74,
  );

  doc.text(`${vegetationLoss.toFixed(1)}%`, 70, y);

  /* ==========================================================
     CHANGE DETECTION
  ========================================================== */

  const change = analysis?.changeDetection;

  if (change) {
    y += 18;

    doc.setFontSize(15);

    doc.setTextColor(15, 23, 42);

    doc.text("Satellite Change Detection", 20, y);

    doc.setDrawColor(59, 130, 246);

    doc.line(20, y + 3, 190, y + 3);

    y += 14;

    doc.setFontSize(10);

    doc.setTextColor(220, 38, 38);

    doc.text(`Decreased Pixels: ${change.decreaseCount ?? 0}`, 20, y);

    doc.setTextColor(37, 99, 235);

    doc.text(`Stable Pixels: ${change.stableCount ?? 0}`, 80, y);

    doc.setTextColor(22, 163, 74);

    doc.text(`Increased Pixels: ${change.increaseCount ?? 0}`, 135, y);
  }

  /* ==========================================================
     GEMINI AI SUMMARY
  ========================================================== */

  y += 20;

  /*
   * Start a new page if necessary.
   */
  if (y > 220) {
    doc.addPage();

    y = 25;
  }

  doc.setFontSize(15);

  doc.setTextColor(15, 23, 42);

  doc.text("Gemini AI Explanation", 20, y);

  doc.setDrawColor(168, 85, 247);

  doc.line(20, y + 3, 190, y + 3);

  y += 13;

  doc.setFontSize(10.5);

  doc.setTextColor(71, 85, 105);

  const wrappedSummary = doc.splitTextToSize(String(summary), 170);

  doc.text(wrappedSummary, 20, y);

  y += wrappedSummary.length * 6 + 10;

  /* ==========================================================
     RECOMMENDATIONS
  ========================================================== */

  if (y > 235) {
    doc.addPage();

    y = 25;
  }

  doc.setFontSize(15);

  doc.setTextColor(15, 23, 42);

  doc.text("Recommended Actions", 20, y);

  doc.setDrawColor(34, 197, 94);

  doc.line(20, y + 3, 190, y + 3);

  y += 14;

  doc.setFontSize(10.5);

  doc.setTextColor(71, 85, 105);

  /*
   * Using "-" instead of bullet character
   * improves PDF font compatibility.
   */

  let recommendations;

  if (normalizedRisk === "high" || normalizedRisk === "critical") {
    recommendations = [
      "Immediately notify the responsible forest monitoring authority.",
      "Prioritize this region for field inspection and verification.",
      "Continue high-frequency satellite monitoring.",
      "Run follow-up analysis to confirm vegetation-loss trends.",
    ];
  } else if (normalizedRisk === "medium" || normalizedRisk === "warning") {
    recommendations = [
      "Increase monitoring frequency for this region.",
      "Schedule another AI analysis during the next monitoring cycle.",
      "Review vegetation-loss trends and satellite change detection.",
      "Notify authorities if the risk level increases.",
    ];
  } else {
    recommendations = [
      "Continue routine satellite monitoring.",
      "Schedule periodic AI analysis.",
      "Maintain this analysis as a baseline for future comparison.",
      "Review the region if significant NDVI changes are detected.",
    ];
  }

  recommendations.forEach((item, index) => {
    /*
     * Check page space before
     * writing each recommendation.
     */

    if (y > 265) {
      doc.addPage();

      y = 25;
    }

    const text = `${index + 1}. ${item}`;

    const wrapped = doc.splitTextToSize(text, 165);

    doc.text(wrapped, 25, y);

    y += wrapped.length * 6 + 3;
  });

  /* ==========================================================
     FOOTER ON ALL PAGES
  ========================================================== */

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setDrawColor(203, 213, 225);

    doc.line(20, 278, 190, 278);

    doc.setFontSize(8.5);

    doc.setTextColor(100, 116, 139);

    doc.text("ForestGuard - AI Powered Forest Monitoring System", 20, 285);

    doc.text(`Page ${page} of ${pageCount}`, 165, 285);
  }

  /* ==========================================================
     SAVE PDF
  ========================================================== */

  const safeRegionName = String(regionName)
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_");

  doc.save(`ForestGuard_${safeRegionName}_Analysis_Report.pdf`);
};
