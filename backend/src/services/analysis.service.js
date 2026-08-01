import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import Analysis from "../models/Analysis.js";
import Region from "../models/Region.js";
import Alert from "../models/Alert.js";

import { REPORTS_DIR } from "../config/paths.js";

import { getSatelliteData } from "./sentinel.service.js";
import { predictForestRisk } from "./ml.service.js";
import { generateExplanation } from "./gemini.service.js";
import { generateReport, getRecommendations } from "./report.service.js";
import { createAlert } from "./alert.service.js";
import { sendRiskAlert } from "./notification.service.js";

/* =========================================================
   HELPERS
========================================================= */

const roundNum = (num, decimals = 2) => {
  const value = Number(num);

  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

const clamp = (num, min, max) => {
  const value = Number(num);

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
};

/**
 * Map an ML risk level onto the Region.status enum ("Safe" | "Warning" |
 * "Critical").
 */
const regionStatusFor = (riskLevel) => {
  if (riskLevel === "High" || riskLevel === "Critical") {
    return "Critical";
  }

  if (riskLevel === "Medium") {
    return "Warning";
  }

  return "Safe";
};

/**
 * Build a deterministic explanation for when Gemini is unconfigured or
 * unreachable, so `explainability` is never left empty on the document.
 *
 * The advice itself comes from the existing getRecommendations helper in
 * report.service.js — the PDF and the stored explanation stay in agreement.
 */
const fallbackExplanation = ({
  riskLevel,
  ndviMean,
  vegetationLossPercentage,
  cloudCoverage,
}) => {
  const recommendations = getRecommendations(riskLevel) || [];

  const reasons = [
    {
      title: "Vegetation index reading",
      explanation:
        ndviMean < 0.3
          ? "Mean NDVI is in the severe-stress band, consistent with canopy loss or clearing."
          : ndviMean < 0.6
            ? "Mean NDVI is in the moderate band, indicating thinning or stressed canopy."
            : "Mean NDVI is in the healthy band, consistent with intact canopy.",
      metric: `NDVI ${roundNum(ndviMean, 3)}`,
      severity: ndviMean < 0.3 ? "high" : ndviMean < 0.6 ? "medium" : "low",
    },

    {
      title: "Estimated vegetation loss",
      explanation: `Approximately ${roundNum(vegetationLossPercentage, 1)}% of the observed area shows reduced vegetation cover.`,
      metric: `${roundNum(vegetationLossPercentage, 1)}% loss`,
      severity:
        vegetationLossPercentage >= 40
          ? "high"
          : vegetationLossPercentage >= 10
            ? "medium"
            : "low",
    },
  ];

  if (cloudCoverage >= 30) {
    reasons.push({
      title: "Reduced reading reliability",
      explanation:
        "Cloud coverage over this scene is high enough to degrade the spectral reading. Confirm with a clearer capture before acting.",
      metric: `${roundNum(cloudCoverage, 1)}% cloud`,
      severity: "medium",
    });
  }

  return {
    summary:
      `Automated assessment classified this region as ${riskLevel} risk ` +
      `from a mean NDVI of ${roundNum(ndviMean, 3)} and an estimated ` +
      `${roundNum(vegetationLossPercentage, 1)}% vegetation loss. ` +
      `Generated without AI narration.`,

    primaryFactor: `Mean NDVI of ${roundNum(ndviMean, 3)}`,

    secondaryFactors: recommendations.slice(0, 3),

    reasons,
  };
};

/**
 * Safely resolve region owner email without throwing CastError on string IDs.
 */
const resolveOwnerEmail = async (regionId) => {
  try {
    const isObjId = mongoose.Types.ObjectId.isValid(regionId);
    const populated = await Region.findOne(isObjId ? { _id: regionId } : { regionId })
      .select("createdBy")
      .populate("createdBy", "email");

    return populated?.createdBy?.email || null;
  } catch (error) {
    console.warn("Could not resolve region owner email:", error.message);

    return null;
  }
};

/* =========================================================
   CREATE ANALYSIS
========================================================= */

/**
 * Run a full analysis for a region.
 *
 * Pipeline:
 *   Region lookup
 *      -> Sentinel satellite data
 *      -> ML prediction (with algorithmic fallback)
 *      -> Gemini explanation (with deterministic fallback)
 *      -> Save Analysis
 *      -> PDF report, attached to the saved document
 *      -> Alert + email to the region owner
 *      -> Region rollup
 *
 * The document is created *before* the PDF is generated: report.service.js
 * names the file after `analysis._id`, and passing it an unsaved object meant
 * every report landed as `analysis_<timestamp>.pdf`, which no download URL
 * could ever resolve.
 */
export const createAnalysis = async (analysisData = {}) => {
  const startTime = Date.now();

  /* ---------------------------------------------------------
     1. FIND REGION
  --------------------------------------------------------- */

  const regionId = typeof analysisData === "string"
    ? analysisData
    : (analysisData?.regionId || analysisData?.id);

  if (!regionId) {
    const error = new Error("regionId is required");
    error.statusCode = 400;
    throw error;
  }

  let region = null;
  if (mongoose.Types.ObjectId.isValid(regionId)) {
    region = await Region.findById(regionId);
  }
  if (!region) {
    region = await Region.findOne({ regionId: String(regionId).toUpperCase() });
  }
  if (!region) {
    region = await Region.findOne({ regionId: String(regionId) });
  }

  /* Auto-create sample region if passed from frontend fallback */
  if (!region && String(regionId).startsWith("sample-reg-")) {
    const sampleDetails = {
      "sample-reg-001": { regionId: "KNP-001", name: "Kanha National Park", lat: 22.33, lon: 80.61 },
      "sample-reg-002": { regionId: "PTR-002", name: "Pench Tiger Reserve", lat: 21.75, lon: 79.42 },
      "sample-reg-003": { regionId: "SBR-003", name: "Satpura Biosphere Reserve", lat: 22.57, lon: 78.10 },
      "sample-reg-004": { regionId: "BWS-004", name: "Bori Wildlife Sanctuary", lat: 22.49, lon: 77.97 },
      "sample-reg-005": { regionId: "MTR-005", name: "Melghat Tiger Reserve", lat: 21.45, lon: 77.29 },
      "sample-reg-006": { regionId: "TAR-006", name: "Tadoba-Andhari Reserve", lat: 20.23, lon: 79.41 },
    };

    const details = sampleDetails[regionId] || {
      regionId: `REG-${Date.now().toString().slice(-6)}`,
      name: `Sample Region ${regionId}`,
      lat: 22.0,
      lon: 80.0,
    };

    region = await Region.create({
      regionId: details.regionId,
      name: details.name,
      state: "Madhya Pradesh",
      forestType: "Tropical",
      coordinates: [{ latitude: details.lat, longitude: details.lon }],
    });
  }

  if (!region) {
    const error = new Error(`Region '${regionId}' not found`);
    error.statusCode = 404;
    throw error;
  }

  /* ---------------------------------------------------------
     2. SATELLITE DATA
  --------------------------------------------------------- */

  const lat = region.coordinates?.[0]?.latitude ?? 20.0;

  const lon = region.coordinates?.[0]?.longitude ?? 78.0;

  const satelliteData = await getSatelliteData({
    latitude: lat,
    longitude: lon,
  });

  /* ---------------------------------------------------------
     3. ML PREDICTION
  --------------------------------------------------------- */

  /*
   * predictForestRisk always resolves to the same shape — a real model
   * response or its algorithmic fallback — so the `|| {...}` patches that used
   * to guard every field below are gone.
   */
  const mlResult = await predictForestRisk(satelliteData);

  /* ---------------------------------------------------------
     4. NORMALIZE RESULTS
  --------------------------------------------------------- */

  const ndviObj = mlResult.ndvi || {};

  const ndviMean = Number(ndviObj.mean ?? 0);

  const changeDetection = mlResult.changeDetection || {};

  const riskClass = mlResult.riskClassification || {};

  const riskLevel = riskClass.riskLevel || mlResult.riskLevel || "Low";

  /*
   * No default confidence here. A crashed or unreachable model used to be
   * recorded at 0.92 confidence, which made a total failure look like a
   * near-certain reading; ml.service.js now reports its own fallback
   * confidence explicitly.
   */
  const confidenceScore = clamp(
    riskClass.confidenceScore ?? mlResult.confidence ?? 0,
    0,
    1,
  );

  const riskScore = clamp(riskClass.riskScore ?? 0, 0, 1);

  const vegetationLossPercentage = clamp(
    riskClass.vegetationLossPercentage ?? 0,
    0,
    100,
  );

  const cloudCoverage = clamp(
    mlResult.cloudCoverage ?? satelliteData?.cloudCoverage ?? satelliteData?.cloudCover ?? 0,
    0,
    100,
  );

  /*
   * Share of pixels the model could actually read. Falls back to 1 when the
   * model does not report pixel counts, rather than being left unset.
   */
  const pixelConsistency =
    Number(ndviObj.totalPixels) > 0
      ? clamp(Number(ndviObj.validPixels) / Number(ndviObj.totalPixels), 0, 1)
      : 1;

  const normalizedRiskClass = {
    ...riskClass,

    // Both keys are kept: the frontend reads `level` in places and `riskLevel`
    // in others.
    riskLevel,
    level: riskLevel,

    riskScore,

    confidenceScore,

    vegetationLossPercentage,
  };

  /* ---------------------------------------------------------
     5. EXPLANATION
  --------------------------------------------------------- */

  /*
   * generateExplanation returns a structured object or null — never a bare
   * string, which is why `explainability.reasons` used to be empty on every
   * analysis (the caller read `.reasons` off a string).
   */
  let explanation = null;

  try {
    explanation = await generateExplanation({
      regionName: region.name,
      riskLevel,
      ndvi: ndviMean,
      confidence: confidenceScore,
      vegetationLossPercentage,
      cloudCoverage,
    });
  } catch (error) {
    console.warn("Gemini explanation unavailable:", error.message);
  }

  if (!explanation) {
    explanation = fallbackExplanation({
      riskLevel,
      ndviMean,
      vegetationLossPercentage,
      cloudCoverage,
    });
  }

  const executionTimeMs = Date.now() - startTime;

  /* ---------------------------------------------------------
     6. SAVE ANALYSIS
  --------------------------------------------------------- */

  /*
   * Every field is set explicitly. Spreading `analysisData` here let a client
   * write `status`, `detectionMethod`, `confidenceScore` or any other schema
   * field straight through the API.
   */
  const analysis = await Analysis.create({
    regionId: region._id,

    regionName: region.name,

    timestamp: new Date(),

    ndvi: [roundNum(ndviMean, 4)],

    changeDetection,

    riskClassification: normalizedRiskClass,

    satelliteData,

    confidenceScore,

    vegetationLossPercentage,

    cloudCoverage,

    pixelConsistency,

    /*
     * True multi-date confirmation needs two captures to compare. The current
     * Sentinel integration returns a single scene, so this stays false until
     * that changes rather than claiming a corroboration that never happened.
     */
    multiDateConfirmed: false,

    explainability: {
      summary: explanation.summary || "",

      reasons: explanation.reasons || [],

      primaryFactor: explanation.primaryFactor || "",

      secondaryFactors: explanation.secondaryFactors || [],
    },

    /*
     * Reflects whether the ML model actually answered. This used to be keyed
     * off `satelliteData.fallbackUsed`, so a dead ML service still recorded
     * "ml" as long as the satellite feed responded.
     */
    detectionMethod: mlResult.modelUsed ? "ml" : "fallback",

    processed: true,

    processingTime: executionTimeMs,

    executionTime: `${(executionTimeMs / 1000).toFixed(2)}s`,

    status: "completed",
  });

  /* ---------------------------------------------------------
     7. PDF REPORT
  --------------------------------------------------------- */

  try {
    const reportPath = await generateReport(analysis);

    if (reportPath) {
      analysis.pdfReportPath = reportPath;
      analysis.reportGeneratedAt = new Date();

      await analysis.save();
    }
  } catch (error) {
    // A missing PDF must not invalidate a completed analysis.
    console.warn("PDF report generation failed:", error.message);
  }

  /* ---------------------------------------------------------
     8. ALERT
  --------------------------------------------------------- */

  const needsAlert =
    riskLevel === "High" || riskLevel === "Critical" || riskLevel === "Medium";

  if (needsAlert) {
    try {
      await createAlert({
        region: region._id,

        regionName: region.name,

        riskLevel:
          riskLevel === "High" || riskLevel === "Critical"
            ? "Critical"
            : "Medium",

        message:
          explanation.summary ||
          `Risk level ${riskLevel} detected for ${region.name}`,

        type: "deforestation",

        analysisId: analysis._id,
      });
    } catch (error) {
      // An un-created alert should not discard the analysis behind it.
      console.warn("Alert creation failed:", error.message);
    }

    /* -------------------------------------------------------
       9. EMAIL THE REGION OWNER
    ------------------------------------------------------- */

    if (region.emailAlertEnabled !== false) {
      try {
        const ownerEmail = await resolveOwnerEmail(region._id);

        await sendRiskAlert({
          to: ownerEmail,

          regionName: region.name,

          riskLevel,

          explanation: explanation.summary,
        });
      } catch (error) {
        console.warn("Email notification failed:", error.message);
      }
    }
  }

  /* ---------------------------------------------------------
     10. REGION ROLLUP
  --------------------------------------------------------- */

  try {
    await Region.findByIdAndUpdate(region._id, {
      latestNDVI: clamp(ndviMean, -1, 1),

      /*
       * Risk score, not confidence — they measure different things. A
       * confident reading of a healthy forest is not a high-risk region.
       */
      latestRiskScore: Math.round(riskScore * 100),

      status: regionStatusFor(riskLevel),

      // Declared on the Region schema but never written before, so the
      // dashboard could not tell a stale region from a fresh one.
      lastAnalysisDate: new Date(),
    });
  } catch (error) {
    console.warn("Region rollup failed:", error.message);
  }

  return analysis;
};

/* =========================================================
   GET ALL ANALYSES
========================================================= */

export const getAllAnalysis = async ({
  page = 1,
  limit = 10,
  regionId,
  status,
} = {}) => {
  const query = {};

  if (regionId) {
    query.regionId = regionId;
  }

  if (status) {
    query.status = status;
  }

  const currentPage = Math.max(1, Number(page) || 1);

  const pageLimit = Math.max(1, Number(limit) || 10);

  const skip = (currentPage - 1) * pageLimit;

  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit)
      .populate("regionId", "name regionId status state"),

    Analysis.countDocuments(query),
  ]);

  return {
    analyses,

    pagination: {
      total,

      page: currentPage,

      limit: pageLimit,

      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

/* =========================================================
   GET ANALYSIS BY ID
========================================================= */

export const getAnalysisById = async (id) => {
  return await Analysis.findById(id).populate(
    "regionId",
    "name regionId status state",
  );
};

/* =========================================================
   GET REGION ANALYSES
========================================================= */

export const getRegionAnalysis = async (regionId) => {
  return await Analysis.find({
    regionId,
  })
    .sort({
      timestamp: -1,
    })
    .populate("regionId", "name regionId status state");
};

/* =========================================================
   GET LATEST REGION ANALYSIS
========================================================= */

export const getLatestAnalysis = async (regionId) => {
  return await Analysis.findOne({
    regionId,
  })
    .sort({
      timestamp: -1,
    })
    .populate("regionId", "name regionId status state");
};

/* =========================================================
   DELETE ANALYSIS
========================================================= */

/**
 * Delete an analysis, its generated PDF, and any alerts raised from it.
 */
export const deleteAnalysis = async (analysisId) => {
  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    const error = new Error("Analysis not found");
    error.statusCode = 404;
    throw error;
  }

  /* ---------------------------------------------------------
     DELETE GENERATED PDF
  --------------------------------------------------------- */

  if (analysis.pdfReportPath) {
    try {
      const reportPath = path.resolve(
        path.isAbsolute(analysis.pdfReportPath)
          ? analysis.pdfReportPath
          : path.join(REPORTS_DIR, analysis.pdfReportPath),
      );

      /*
       * pdfReportPath comes out of the database, so treat it as untrusted:
       * only unlink files that actually sit inside the reports directory. A
       * stored value of "../../.env" would otherwise be deleted verbatim.
       */
      const reportsRoot = path.resolve(REPORTS_DIR);

      const isContained =
        reportPath === reportsRoot ||
        reportPath.startsWith(reportsRoot + path.sep);

      if (!isContained) {
        console.warn(
          `Refusing to delete report outside the reports directory: ${reportPath}`,
        );
      } else if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath);

        console.log(`Deleted report: ${reportPath}`);
      }
    } catch (error) {
      // A leftover file on disk should not block the delete.
      console.warn("Unable to delete analysis PDF:", error.message);
    }
  }

  /* ---------------------------------------------------------
     DELETE ASSOCIATED ALERTS
  --------------------------------------------------------- */

  await Alert.deleteMany({
    analysisId: analysis._id,
  });

  await Analysis.findByIdAndDelete(analysis._id);

  return true;
};
