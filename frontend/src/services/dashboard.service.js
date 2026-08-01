import api from "./api";

/**
 * Fetch dashboard statistics from backend.
 */
export const getDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data.data;
};