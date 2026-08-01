import mongoose from "mongoose";

/**
 * Alert Model
 *
 * Alerts are created when ForestGuard detects a potentially
 * dangerous condition during forest analysis.
 *
 * Examples:
 * - Deforestation
 * - Fire risk
 * - Drought
 * - Flood
 * - General forest warning
 */
const alertSchema = new mongoose.Schema(
  {
    /* =====================================================
       REGION
    ===================================================== */

    // Region that generated this alert
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      index: true,
    },

    // Cached region name for faster UI rendering
    regionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /* =====================================================
       RISK
    ===================================================== */

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
      index: true,
    },

    /* =====================================================
       ALERT TYPE
    ===================================================== */

    type: {
      type: String,
      enum: ["deforestation", "fire_risk", "drought", "flood", "general"],
      default: "general",
    },

    /* =====================================================
       MESSAGE
    ===================================================== */

    message: {
      type: String,
      trim: true,
      default: "",
    },

    /* =====================================================
       RESOLUTION
    ===================================================== */

    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       SOURCE ANALYSIS
    ===================================================== */

    // Analysis responsible for generating the alert
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

/* =========================================================
   DATABASE INDEXES
========================================================= */

/*
 * Quickly retrieve alerts belonging to a region.
 */
alertSchema.index({
  region: 1,
  createdAt: -1,
});

/*
 * Dashboard query:
 * active alerts ordered newest first.
 */
alertSchema.index({
  resolved: 1,
  createdAt: -1,
});

/*
 * Filter alerts by severity.
 */
alertSchema.index({
  riskLevel: 1,
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
