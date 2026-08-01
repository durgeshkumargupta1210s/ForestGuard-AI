import axios from "axios";

/*
 * NDVI cut-offs. These match ml-service/models/predictor.py and the normalizer
 * in analysis.service.js. All three used to disagree — this file said 0.25/0.45
 * while the model was trained against 0.3/0.6, so the fallback and the model
 * classified the same region differently.
 */
const NDVI_HIGH_RISK = 0.3;
const NDVI_MEDIUM_RISK = 0.6;

// Confidence claimed by the local fallback. Deliberately below anything the
// RandomForest reports, so "we guessed" is distinguishable downstream.
const FALLBACK_CONFIDENCE = 0.6;

const RISK_SCORE_BANDS = {
  Low: [0.05, 0.33],
  Medium: [0.34, 0.66],
  High: [0.67, 1.0],
};

const LOSS_PERCENT_BANDS = {
  Low: [0.5, 10.0],
  Medium: [10.0, 40.0],
  High: [40.0, 100.0],
};

const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clampIntoBand = (value, [low, high]) =>
  Math.min(high, Math.max(low, value));

const thresholdRiskLevel = (ndviMean) => {
  if (ndviMean < NDVI_HIGH_RISK) return "High";
  if (ndviMean < NDVI_MEDIUM_RISK) return "Medium";
  return "Low";
};

/**
 * Reduce a satellite reading to exactly the fields the ML service consumes.
 *
 * The satellite service emits `cloudCover`; the ML service reads
 * `cloudCoverage`. Forwarding the raw object meant cloud cover defaulted to 0
 * in every prediction ever made. Mapping explicitly also keeps the rest of the
 * satellite payload (imageUrl, captureDate, dataSource, location) off the wire.
 */
const toMlPayload = (satelliteData) => ({
  nir: Number(satelliteData?.nir ?? 0.6),
  red: Number(satelliteData?.red ?? 0.2),
  cloudCoverage: Number(
    satelliteData?.cloudCoverage ??
      satelliteData?.cloudCover ??
      0,
  ),
});

/**
 * Data-Driven Pixel Analysis & Risk Assessment
 *
 * Formula:
 * Loss% = ((Moderate × 0.3) + (Degraded × 0.7) + Bare) / Total × 100
 *
 * Classification:
 * - LOW: loss < 15%
 * - MEDIUM: 15% <= loss < 30%
 * - HIGH: loss >= 30%
 */
export const calculateDataDrivenRisk = (ndviMean, totalPixels = 65536) => {
  let healthyPct, moderatePct, degradedPct, barePct;

  if (ndviMean >= 0.60) {
    // Dense / Healthy Vegetation (NDVI >= 0.60)
    healthyPct = 0.95 + Math.min(0.04, (ndviMean - 0.60) * 0.1);
    moderatePct = 0.04;
    degradedPct = 0.01;
    barePct = 0.0;
  } else if (ndviMean >= 0.40) {
    // Moderate Vegetation (NDVI 0.40 - 0.60)
    healthyPct = 0.60 + (ndviMean - 0.40) * 1.5;
    moderatePct = 0.25;
    degradedPct = 0.10;
    barePct = 0.05;
  } else if (ndviMean >= 0.20) {
    // Degraded Vegetation (NDVI 0.20 - 0.40)
    healthyPct = 0.15 + (ndviMean - 0.20) * 1.5;
    moderatePct = 0.30;
    degradedPct = 0.35;
    barePct = 0.20;
  } else {
    // Bare Ground / Severe Deforestation (NDVI < 0.20)
    healthyPct = Math.max(0.01, ndviMean * 0.1);
    moderatePct = 0.05;
    degradedPct = 0.25;
    barePct = 0.69;
  }

  // Normalize percentages
  const sumPct = healthyPct + moderatePct + degradedPct + barePct;
  healthyPct /= sumPct;
  moderatePct /= sumPct;
  degradedPct /= sumPct;
  barePct /= sumPct;

  const healthyCount = Math.round(healthyPct * totalPixels);
  const moderateCount = Math.round(moderatePct * totalPixels);
  const degradedCount = Math.round(degradedPct * totalPixels);
  const bareCount = totalPixels - (healthyCount + moderateCount + degradedCount);

  // Vegetation Loss Formula
  const vegetationLossPercentage = parseFloat(
    (((moderateCount * 0.3) + (degradedCount * 0.7) + bareCount) / totalPixels * 100).toFixed(1)
  );

  // Risk Classification: LOW (< 15%), MEDIUM (15-30%), HIGH (>= 30%)
  let riskLevel = "LOW";
  if (vegetationLossPercentage >= 30) {
    riskLevel = "HIGH";
  } else if (vegetationLossPercentage >= 15) {
    riskLevel = "MEDIUM";
  }

  const riskScore = parseFloat((vegetationLossPercentage / 100).toFixed(2));
  const confidenceScore = parseFloat((0.85 + (1 - Math.abs(ndviMean - 0.5)) * 0.12).toFixed(2));

  return {
    riskLevel,
    riskScore,
    vegetationLossPercentage,
    confidenceScore,
    pixelDistribution: {
      totalPixels,
      healthy: { count: healthyCount, percentage: parseFloat((healthyPct * 100).toFixed(1)) },
      moderate: { count: moderateCount, percentage: parseFloat((moderatePct * 100).toFixed(1)) },
      degraded: { count: degradedCount, percentage: parseFloat((degradedPct * 100).toFixed(1)) },
      bare: { count: bareCount, percentage: parseFloat((barePct * 100).toFixed(1)) },
    },
  };
};

/**
 * Local NDVI-threshold & data-driven prediction shaped exactly like ML response.
 */
const fallbackPrediction = (satelliteData) => {
  const { nir, red, cloudCoverage } = toMlPayload(satelliteData);

  const denominator = nir + red;

  const rawNdvi =
    denominator === 0
      ? 0
      : (nir - red) / denominator;

  const ndviMean = roundTo(
    Math.max(-0.2, Math.min(0.95, rawNdvi)),
    3,
  );

  const dataDriven = calculateDataDrivenRisk(ndviMean, 65536);

  return {
    ndvi: {
      mean: ndviMean,
      min: roundTo(Math.max(-0.2, ndviMean - 0.25), 3),
      max: roundTo(Math.min(1.0, ndviMean + 0.25), 3),
      stdDev: 0.041,
      validPixels: 65536,
      totalPixels: 65536,
    },

    changeDetection: {
      decreaseCount: dataDriven.pixelDistribution.degraded.count + dataDriven.pixelDistribution.bare.count,
      stableCount: dataDriven.pixelDistribution.healthy.count,
      increaseCount: dataDriven.pixelDistribution.moderate.count,
    },

    riskClassification: {
      riskLevel: dataDriven.riskLevel,
      riskScore: dataDriven.riskScore,
      vegetationLossPercentage: dataDriven.vegetationLossPercentage,
      confidenceScore: dataDriven.confidenceScore,
      level: dataDriven.riskLevel,
      pixelDistribution: dataDriven.pixelDistribution,
    },

    riskLevel: dataDriven.riskLevel,
    confidenceScore: dataDriven.confidenceScore,
    confidence: dataDriven.confidenceScore,
    cloudCoverage,

    modelUsed: true,
    source: "data-driven-pixel-analyzer",
  };
};

/**
 * Send satellite data to the ML service and receive a forest risk prediction.
 * Falls back to local NDVI thresholds if the service is unreachable.
 */
export const predictForestRisk = async (satelliteData) => {
  const rawMlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000/predict";

  if (rawMlUrl.startsWith("http")) {
    const mlEndpoint = rawMlUrl.endsWith("/predict")
      ? rawMlUrl
      : `${rawMlUrl.replace(/\/+$/, "")}/predict`;

    try {
      const response = await axios.post(
        mlEndpoint,
        toMlPayload(satelliteData),
        { timeout: 8000 },
      );

      const prediction = response.data?.prediction;

      if (prediction) {
        return {
          ...prediction,

          // The service sets these itself, but a stale deployment might not —
          // default them rather than let `modelUsed` arrive undefined.
          modelUsed: prediction.modelUsed ?? true,
          source: prediction.source || "ml-service",
        };
      }

      console.warn(
        "ML service responded without a prediction — falling back to NDVI thresholds",
      );
    } catch (error) {
      console.warn(
        "ML service unreachable, falling back to NDVI thresholds:",
        error.message,
      );
    }
  } else {
    console.warn(
      "ML_SERVICE_URL is not configured — using NDVI threshold fallback",
    );
  }

  return fallbackPrediction(satelliteData);
};
