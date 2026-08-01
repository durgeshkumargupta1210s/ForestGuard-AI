import * as analysisService from "../services/analysis.service.js";

/**
 * Map a thrown error onto an HTTP status.
 *
 * Prefers the explicit `statusCode` the service sets, falling back to the old
 * message sniffing for anything that predates it.
 */
const statusFor = (error) =>
  error?.statusCode ||
  (error?.message?.toLowerCase().includes("not found") ? 404 : 500);

/**
 * Create new analysis for a region
 */
export const createAnalysis = async (req, res) => {
  try {
    const analysis = await analysisService.createAnalysis(req.body);

    return res.status(201).json({
      success: true,
      message: "Analysis created successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Create analysis error:", error);

    return res.status(statusFor(error)).json({
      success: false,
      message: error.message || "Failed to create analysis",
    });
  }
};

/**
 * Get all analyses
 * Supports pagination + filtering
 */
export const getAllAnalysis = async (req, res) => {
  try {
    const { page, limit, regionId, status } = req.query;

    const result = await analysisService.getAllAnalysis({
      page,
      limit,
      regionId,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result.analyses,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get analyses error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analyses",
    });
  }
};

/**
 * Get single analysis by ID
 */
export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await analysisService.getAnalysisById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Get analysis by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analysis",
    });
  }
};

/**
 * Get all analyses of a specific region
 */
export const getRegionAnalysis = async (req, res) => {
  try {
    const analyses = await analysisService.getRegionAnalysis(
      req.params.regionId,
    );

    return res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    console.error("Get region analysis error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch region analyses",
    });
  }
};

/**
 * Get latest analysis of a region
 */
export const getLatestAnalysis = async (req, res) => {
  try {
    const analysis = await analysisService.getLatestAnalysis(
      req.params.regionId,
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Get latest analysis error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch latest analysis",
    });
  }
};

/**
 * Delete analysis
 *
 * DELETE /api/analysis/:id
 */
export const deleteAnalysis = async (req, res) => {
  try {
    await analysisService.deleteAnalysis(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete analysis error:", error);

    return res.status(statusFor(error)).json({
      success: false,
      message: error.message || "Failed to delete analysis",
    });
  }
};

