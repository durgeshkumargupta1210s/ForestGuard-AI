import * as alertService from "../services/alert.service.js";

/**
 * Get all alerts
 * Supports:
 * - Pagination
 * - Resolved filter
 * - Risk level filter
 * - Region filter
 * - Global alert statistics
 *
 * GET /api/alerts
 * GET /api/alerts?page=1&limit=10
 * GET /api/alerts?resolved=false
 * GET /api/alerts?riskLevel=Critical
 * GET /api/alerts?regionId=...
 */
export const getAllAlerts = async (req, res) => {
  try {
    const {
      page,
      limit,
      resolved,
      riskLevel,
      regionId,
    } = req.query;

    const result = await alertService.getAllAlerts({
      page,
      limit,
      resolved,
      riskLevel,
      regionId,
    });

    return res.status(200).json({
      success: true,

      // Paginated alerts
      data: result.alerts,

      // Pagination information
      pagination: result.pagination,

      // Global alert statistics
      stats: result.stats,
    });
  } catch (error) {
    console.error("Get alerts error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch alerts",
    });
  }
};

/**
 * Resolve an alert
 *
 * PUT /api/alerts/:id/resolve
 */
export const resolveAlert = async (req, res) => {
  try {
    const alert =
      await alertService.resolveAlert(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Alert resolved successfully",
      data: alert,
    });
  } catch (error) {
    console.error(
      "Resolve alert error:",
      error
    );

    const status =
      error.message
        ?.toLowerCase()
        .includes("not found")
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message:
        error.message ||
        "Failed to resolve alert",
    });
  }
};

/**
 * Delete an alert
 *
 * DELETE /api/alerts/:id
 */
export const deleteAlert = async (req, res) => {
  try {
    await alertService.deleteAlert(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Alert deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete alert error:",
      error
    );

    const status =
      error.message
        ?.toLowerCase()
        .includes("not found")
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message:
        error.message ||
        "Failed to delete alert",
    });
  }
};

/**
 * Trigger manual satellite monitoring scan
 *
 * POST /api/alerts/trigger-scan
 */
export const triggerAutomatedScan = async (req, res) => {
  try {
    const { runAutomatedSatelliteCheck } = await import("../services/scheduler.service.js");
    const userEmail = req.user?.email;
    runAutomatedSatelliteCheck(userEmail); // Run scan targeting logged-in user's email

    return res.status(200).json({
      success: true,
      message: `Automated Satellite Scan triggered successfully. Polling all monitored regions for ${userEmail || "active user"}...`,
    });
  } catch (error) {
    console.error("Trigger scan error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to trigger automated scan",
    });
  }
};