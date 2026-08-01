import api from "./api";

/**
 * Get all regions
 * Query params:
 * search
 * state
 * status
 * forestType
 * page
 * limit
 * sortBy
 * order
 */
export const getRegions = async (params = {}) => {
  const response = await api.get("/regions", {
    params,
  });

  return response.data;
};

/**
 * Get region by ID
 */
export const getRegionById = async (id) => {
  const response = await api.get(`/regions/${id}`);
  return response.data.data;
};

/**
 * Create region
 */
export const createRegion = async (regionData) => {
  const response = await api.post("/regions", regionData);
  return response.data;
};

/**
 * Update region
 */
export const updateRegion = async (id, regionData) => {
  const response = await api.put(`/regions/${id}`, regionData);
  return response.data;
};

/**
 * Archive (Soft Delete) region
 */
export const deleteRegion = async (id) => {
  const response = await api.delete(`/regions/${id}`);
  return response.data;
};

/**
 * Get Region Statistics
 */
export const getRegionStatistics = async () => {
  const response = await api.get("/regions/statistics");
  return response.data.data;
};

/**
 * Get Critical Regions
 */
export const getCriticalRegions = async () => {
  const response = await api.get("/regions/critical");
  return response.data.data;
};

/**
 * Toggle Email Alert
 */
export const toggleEmailAlert = async (id) => {
  const response = await api.patch(`/regions/${id}/email-alert`);
  return response.data;
};

/**
 * Archive Region
 */
export const archiveRegion = async (id) => {
  const response = await api.patch(`/regions/${id}/archive`);
  return response.data;
};