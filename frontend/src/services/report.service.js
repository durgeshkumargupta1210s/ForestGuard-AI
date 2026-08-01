import api from "./api";

/**
 * Get all reports (analyses that have a generated PDF).
 * Delegates to the analysis endpoint with optional filters.
 *
 * GET /api/analysis
 */
export const getReports = async (params = {}) => {
  const response = await api.get("/analysis", { params });
  return response.data;
};

/**
 * Get a single report by analysis ID.
 *
 * GET /api/analysis/:id
 */
export const getReportById = async (id) => {
  if (!id) throw new Error("Report ID is required");
  const response = await api.get(`/analysis/${id}`);
  return response.data.data;
};
