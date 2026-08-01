import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboard.service";

export default function useDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, error, refresh: fetchDashboard };
}