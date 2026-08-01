import mongoose from "mongoose";

/**
 * Stores every analysis performed on a forest region.
 * Each document represents one complete analysis run.
 */

const analysisSchema = new mongoose.Schema(
  {
    /* =========================================================
       REGION INFORMATION
    ========================================================= */

    // Reference to Region document
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      index: true,
    },

    // Cached region name for faster frontend access
    regionName: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================================================
       CORE ANALYSIS
    ========================================================= */

    // Time when analysis was performed
    timestamp: {
      type: Date,
      default: Date.now,
    },

    /**
     * NDVI values.
     *
     * Currently the service stores:
     * [meanNDVI]
     */
    ndvi: {
      type: [Number],
      default: [],
    },

    // Satellite change detection result
    changeDetection: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * Risk classification result.
     *
     * Expected structure:
     *
     * {
     *   riskLevel: "High",
     *   level: "High",
     *   riskScore: 0.75,
     *   confidenceScore: 0.92,
     *   vegetationLossPercentage: 20
     * }
     */
    riskClassification: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Raw Sentinel / fallback satellite data
    satelliteData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* =========================================================
       AI CONFIDENCE
    ========================================================= */

    /**
     * Stored as decimal:
     *
     * 0.92 = 92%
     */
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    /* =========================================================
       AI EXPLAINABILITY
    ========================================================= */

    explainability: {
      summary: {
        type: String,
        default: "",
      },

      reasons: [
        {
          title: {
            type: String,
            default: "",
          },

          explanation: {
            type: String,
            default: "",
          },

          metric: {
            type: String,
            default: "",
          },

          severity: {
            type: String,
            enum: ["low", "medium", "high"],
          },
        },
      ],

      primaryFactor: {
        type: String,
        default: "",
      },

      secondaryFactors: {
        type: [String],
        default: [],
      },
    },

    /* =========================================================
       ANALYSIS COMPARISON
    ========================================================= */

    comparisonWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      default: null,
    },

    /* =========================================================
       QUALITY METRICS
    ========================================================= */

    cloudCoverage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    pixelConsistency: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    multiDateConfirmed: {
      type: Boolean,
      default: false,
    },

    /* =========================================================
       DETECTION SOURCE
    ========================================================= */

    /**
     * ml       -> real ML/Satellite pipeline
     * fallback -> algorithmic/mock fallback
     */
    detectionMethod: {
      type: String,
      enum: ["ml", "fallback"],
      default: "fallback",
    },

    /* =========================================================
       PDF REPORT
    ========================================================= */

    pdfReportPath: {
      type: String,
      default: null,
    },

    reportGeneratedAt: {
      type: Date,
      default: null,
    },

    /* =========================================================
       PROCESSING INFORMATION
    ========================================================= */

    processed: {
      type: Boolean,
      default: true,
    },

    /**
     * Execution time in milliseconds.
     *
     * Example:
     * 1420
     */
    processingTime: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * Human-readable execution time.
     *
     * Example:
     * "1.42s"
     */
    executionTime: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
      ],
      default: "completed",
    },

    /* =========================================================
       ERROR INFORMATION
    ========================================================= */

    error: {
      type: String,
      default: null,
    },

    /* =========================================================
       VEGETATION METRICS
    ========================================================= */

    vegetationLossPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },

  {
    // Automatically creates createdAt and updatedAt
    timestamps: true,
  }
);

/* =========================================================
   DATABASE INDEXES
========================================================= */

/**
 * Quickly fetch analysis history for a region.
 */
analysisSchema.index({
  regionId: 1,
  timestamp: -1,
});

/**
 * Quickly retrieve latest analyses.
 */
analysisSchema.index({
  timestamp: -1,
});

/**
 * Filter analyses by risk level.
 *
 * Updated analysis.service.js stores:
 *
 * riskClassification.level
 * riskClassification.riskLevel
 */
analysisSchema.index({
  "riskClassification.level": 1,
});

/**
 * Analysis status filtering.
 */
analysisSchema.index({
  status: 1,
});

/* =========================================================
   MODEL
========================================================= */

const Analysis = mongoose.model(
  "Analysis",
  analysisSchema
);

export default Analysis;