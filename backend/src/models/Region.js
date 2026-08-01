import mongoose from "mongoose";

const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false }
);

const regionSchema = new mongoose.Schema(
  {
    regionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    forestType: {
      type: String,
      enum: [
        "Tropical",
        "Temperate",
        "Boreal",
        "Mangrove",
        "Grassland",
        "Mixed",
        "Other",
      ],
      default: "Other",
    },

    coordinates: {
      type: [coordinateSchema],
      default: [],
    },

    area: {
      type: Number,
      default: 0,
      min: 0,
    },

    latestNDVI: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },

    latestRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["Safe", "Warning", "Critical"],
      default: "Safe",
    },

    emailAlertEnabled: {
      type: Boolean,
      default: true,
    },

    lastAnalysisDate: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// --------------------
// Virtual Fields
// --------------------

regionSchema.virtual("coordinateCount").get(function () {
  // `coordinates` is undefined on any query that projects it away — e.g. the
  // dashboard's .select("name latestNDVI ...") or alert.service's populate.
  // With toJSON virtuals enabled this getter runs during serialization, so an
  // unguarded .length turned both endpoints into a 500.
  return this.coordinates?.length ?? 0;
});

// --------------------
// Database Indexes
// --------------------

// No explicit regionId index here: `unique: true` on the field already builds
// one, and declaring both made Mongoose warn about a duplicate on every boot.

regionSchema.index({ state: 1 });

regionSchema.index({ status: 1 });

regionSchema.index({ state: 1, district: 1 });

regionSchema.index({ latestRiskScore: -1 });

regionSchema.index({ createdAt: -1 });

const Region = mongoose.model("Region", regionSchema);

export default Region;