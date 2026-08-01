import mongoose from "mongoose";

/**
 * Stores custom reasons/explanations that can be
 * attached to an analysis report.
 */

const customReasonSchema = new mongoose.Schema(
    {
        // Title of the reason
        title: {
            type: String,
            required: true,
            trim: true,
        },

        // Detailed explanation
        description: {
            type: String,
            required: true,
            trim: true,
        },

        // Category of the reason
        category: {
            type: String,
            enum: [
                "Vegetation",
                "Mining",
                "Water",
                "Fire",
                "Urbanization",
                "Other",
            ],
            default: "Other",
        },

        // Whether this reason is active
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const CustomReason = mongoose.model(
    "CustomReason",
    customReasonSchema
);

export default CustomReason;