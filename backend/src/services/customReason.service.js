import CustomReason from "../models/CustomReason.js";
import Analysis from "../models/Analysis.js";

/**
 * Add custom reason for an analysis
 */
export const addCustomReason = async (data) => {

    // Verify analysis exists
    const analysis = await Analysis.findById(data.analysisId);

    if (!analysis) {
        throw new Error("Analysis not found");
    }

    // Save custom reason
    const reason = await CustomReason.create({
        analysisId: data.analysisId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        createdBy: data.createdBy
    });

    return reason;
};


/**
 * Get all custom reasons for an analysis
 */
export const getReasonsByAnalysis = async (analysisId) => {

    return await CustomReason.find({
        analysisId
    }).sort({
        createdAt: -1
    });

};