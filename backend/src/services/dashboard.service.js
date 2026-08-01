import Region from "../models/Region.js";
import Analysis from "../models/Analysis.js";

/*
 * Archived regions are soft-deleted (isActive: false) rather than removed, so
 * every count and average below has to filter on it. Without this an archived
 * region kept inflating the totals, the risk donut, and both averages — the
 * dashboard reported regions the user could no longer see anywhere in the UI.
 */
const ACTIVE = { isActive: true };

/**
 * Get full dashboard statistics.
 * Returns counts, risk distribution, NDVI data, and recent analyses.
 */
export const getDashboardStats = async () => {
  const [
    totalRegions,
    totalAnalyses,
    safeRegions,
    warningRegions,
    criticalRegions,
    recentAnalyses,
    topRegions,
  ] = await Promise.all([
    // Total regions
    Region.countDocuments(ACTIVE),

    // Total analyses performed
    Analysis.countDocuments(),

    // Breakdown by status
    Region.countDocuments({ ...ACTIVE, status: "Safe" }),
    Region.countDocuments({ ...ACTIVE, status: "Warning" }),
    Region.countDocuments({ ...ACTIVE, status: "Critical" }),

    // Latest 6 analyses (populate regionId to get name)
    Analysis.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("regionId", "name regionId status"),

    // Top 6 regions sorted by latestRiskScore (for chart)
    Region.find(ACTIVE)
      .sort({ latestRiskScore: -1 })
      .limit(6)
      .select("name latestNDVI latestRiskScore status"),
  ]);

  // Risk distribution for donut chart
  const riskDistribution = [
    { name: "Safe", value: safeRegions, color: "#22c55e" },
    { name: "Warning", value: warningRegions, color: "#f59e0b" },
    { name: "Critical", value: criticalRegions, color: "#ef4444" },
  ];

  // Averages across active regions
  const [ndviAgg, riskAgg] = await Promise.all([
    Region.aggregate([
      { $match: ACTIVE },
      { $group: { _id: null, avg: { $avg: "$latestNDVI" } } },
    ]),

    Region.aggregate([
      { $match: ACTIVE },
      { $group: { _id: null, avg: { $avg: "$latestRiskScore" } } },
    ]),
  ]);

  const avgNDVI = Number(ndviAgg[0]?.avg ?? 0);

  const avgRiskScore = Number(riskAgg[0]?.avg ?? 0);

  return {
    totalRegions,
    totalAnalyses,
    safeRegions,
    warningRegions,
    criticalRegions,
    avgNDVI: parseFloat(avgNDVI.toFixed(3)),
    avgRiskScore: parseFloat(avgRiskScore.toFixed(1)),
    riskDistribution,
    recentAnalyses,
    topRegions,
  };
};
