import api from "./api";

/**
 * Get all alerts.
 *
 * Optional params:
 * page
 * limit
 * riskLevel
 * resolved
 * regionId
 */
export const getAllAlerts = async (params = {}) => {
  const response = await api.get("/alerts", {
    params,
  });

  return response.data;
};

/**
 * Resolve an alert.
 */
export const resolveAlert = async (alertId) => {
  if (!alertId) {
    throw new Error("Alert ID is required");
  }

  const response = await api.put(`/alerts/${alertId}/resolve`);

  return response.data;
};

/**
 * Delete an alert.
 */
export const deleteAlert = async (alertId) => {
  if (!alertId) {
    throw new Error("Alert ID is required");
  }

  const response = await api.delete(`/alerts/${alertId}`);

  return response.data;
};
