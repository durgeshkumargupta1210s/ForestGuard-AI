import api from "./api";

/* =========================================================
   CREATE ANALYSIS
========================================================= */

/**
 * Create a new forest analysis for a region.
 *
 * POST /api/analysis
 */
export const createAnalysis = async (regionId) => {
  if (!regionId) {
    throw new Error("Region ID is required");
  }

  const response = await api.post(
    "/analysis",
    {
      regionId,
    }
  );

  // Returns:
  // {
  //   success: true,
  //   message: "...",
  //   data: analysis
  // }

  return response.data;
};

/* =========================================================
   GET ALL ANALYSES
========================================================= */

/**
 * Get all analyses.
 *
 * Supports:
 * page
 * limit
 * regionId
 * status
 *
 * GET /api/analysis
 */
export const getAllAnalysis = async (
  params = {}
) => {
  const response = await api.get(
    "/analysis",
    {
      params,
    }
  );

  // Returns:
  // {
  //   success: true,
  //   data: [...],
  //   pagination: {...}
  // }

  return response.data;
};

/* =========================================================
   GET REGION ANALYSES
========================================================= */

/**
 * Get complete analysis history
 * for a particular region.
 *
 * GET /api/analysis/region/:regionId
 */
export const getRegionAnalysis = async (
  regionId
) => {
  if (!regionId) {
    throw new Error("Region ID is required");
  }

  const response = await api.get(
    `/analysis/region/${regionId}`
  );

  return response.data.data || [];
};

/* =========================================================
   GET SINGLE ANALYSIS
========================================================= */

/**
 * Get analysis by MongoDB ID.
 *
 * GET /api/analysis/:id
 */
export const getAnalysisById = async (
  id
) => {
  if (!id) {
    throw new Error("Analysis ID is required");
  }

  const response = await api.get(
    `/analysis/${id}`
  );

  return response.data.data;
};

/* =========================================================
   GET LATEST ANALYSIS
========================================================= */

/**
 * Get latest analysis for a region.
 *
 * GET /api/analysis/latest/:regionId
 */
export const getLatestAnalysis = async (
  regionId
) => {
  if (!regionId) {
    throw new Error("Region ID is required");
  }

  const response = await api.get(
    `/analysis/latest/${regionId}`
  );

  return response.data.data;
};

/* =========================================================
   DELETE ANALYSIS
========================================================= */

/**
 * Delete an analysis.
 *
 * Backend also removes:
 * - associated PDF report
 * - associated alert(s)
 *
 * DELETE /api/analysis/:id
 */
export const deleteAnalysis = async (
  analysisId
) => {
  if (!analysisId) {
    throw new Error(
      "Analysis ID is required"
    );
  }

  const response = await api.delete(
    `/analysis/${analysisId}`
  );

  // Returns:
  // {
  //   success: true,
  //   message: "Analysis deleted successfully"
  // }

  return response.data;
};

/* =========================================================
   REPORT URL HELPER
========================================================= */

/**
 * Convert backend pdfReportPath into
 * a browser-accessible report URL.
 *
 * Example stored path:
 * reports/analysis_123.pdf
 *
 * Browser URL:
 * http://localhost:5000/reports/analysis_123.pdf
 */
export const getAnalysisReportUrl = (
  analysis
) => {
  if (!analysis?.pdfReportPath) {
    return null;
  }

  const normalizedPath =
    analysis.pdfReportPath.replace(
      /\\/g,
      "/"
    );

  const fileName =
    normalizedPath.split("/").pop();

  if (!fileName) {
    return null;
  }

  /*
   * VITE_API_URL:
   * http://localhost:5000/api
   *
   * We need:
   * http://localhost:5000
   */

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const backendUrl =
    apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}/reports/${encodeURIComponent(
    fileName
  )}`;
};