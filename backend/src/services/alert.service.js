import Alert from "../models/Alert.js";

/**
 * Get all alerts
 * Supports:
 * - Pagination
 * - Resolved filter
 * - Risk level filter
 * - Region filter
 * - Global alert statistics
 */
export const getAllAlerts = async ({
  page = 1,
  limit = 10,
  resolved,
  riskLevel,
  regionId,
} = {}) => {
  /* ================================================
     BUILD QUERY
  ================================================= */

  const query = {};

  // Filter by resolved status
  if (resolved !== undefined && resolved !== "") {
    query.resolved =
      resolved === true ||
      resolved === "true";
  }

  // Filter by risk level
  if (riskLevel) {
    query.riskLevel = riskLevel;
  }

  // Filter by region
  if (regionId) {
    query.region = regionId;
  }

  /* ================================================
     PAGINATION
  ================================================= */

  const currentPage = Math.max(
    1,
    Number(page) || 1
  );

  const pageLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 10)
  );

  const skip =
    (currentPage - 1) * pageLimit;

  /* ================================================
     FETCH ALERTS + STATISTICS
  ================================================= */

  const [
    alerts,
    total,
    totalAlerts,
    activeAlerts,
    resolvedAlerts,
    criticalAlerts,
  ] = await Promise.all([
    // Current filtered/paginated alerts
    Alert.find(query)
      .populate(
        "region",
        "name regionId state status"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageLimit),

    // Number of records matching current filters
    Alert.countDocuments(query),

    // Total alerts in database
    Alert.countDocuments(),

    // All active alerts
    Alert.countDocuments({
      resolved: false,
    }),

    // All resolved alerts
    Alert.countDocuments({
      resolved: true,
    }),

    // Critical + High alerts
    Alert.countDocuments({
      riskLevel: {
        $in: ["Critical", "High"],
      },
    }),
  ]);

  /* ================================================
     RESPONSE
  ================================================= */

  return {
    alerts,

    pagination: {
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages:
        Math.ceil(total / pageLimit),
    },

    stats: {
      total: totalAlerts,
      active: activeAlerts,
      resolved: resolvedAlerts,
      critical: criticalAlerts,
    },
  };
};

/**
 * Create a new alert.
 */
export const createAlert = async (
  alertData
) => {
  const alert = await Alert.create(
    alertData
  );

  return await Alert.findById(
    alert._id
  ).populate(
    "region",
    "name regionId state status"
  );
};

/**
 * Resolve an alert.
 */
export const resolveAlert = async (
  alertId
) => {
  const alert = await Alert.findById(
    alertId
  );

  if (!alert) {
    throw new Error("Alert not found");
  }

  /*
   * If already resolved, return existing alert.
   * Prevents unnecessary database writes.
   */
  if (alert.resolved) {
    return await Alert.findById(
      alert._id
    ).populate(
      "region",
      "name regionId state status"
    );
  }

  alert.resolved = true;
  alert.resolvedAt = new Date();

  await alert.save();

  /*
   * Return populated alert so frontend
   * receives complete region information.
   */
  return await Alert.findById(
    alert._id
  ).populate(
    "region",
    "name regionId state status"
  );
};

/**
 * Delete an alert.
 */
export const deleteAlert = async (
  alertId
) => {
  const alert =
    await Alert.findByIdAndDelete(
      alertId
    );

  if (!alert) {
    throw new Error("Alert not found");
  }

  return true;
};

/**
 * Get alerts belonging to a specific region.
 */
export const getAlertsByRegion = async (
  regionId
) => {
  return await Alert.find({
    region: regionId,
  })
    .populate(
      "region",
      "name regionId state status"
    )
    .sort({
      createdAt: -1,
    });
};