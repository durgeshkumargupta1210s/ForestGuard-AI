import express from "express";

import {
  getAllAlerts,
  resolveAlert,
  deleteAlert,
  triggerAutomatedScan,
} from "../controllers/alert.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* GET /api/alerts — Get all alerts (paginated + filterable) */
router.get("/", protect, getAllAlerts);

/* POST /api/alerts/trigger-scan — Trigger manual satellite check */
router.post("/trigger-scan", protect, triggerAutomatedScan);

/* PUT /api/alerts/:id/resolve — Resolve an alert */
router.put("/:id/resolve", protect, resolveAlert);

/* DELETE /api/alerts/:id — Delete an alert */
router.delete("/:id", protect, deleteAlert);

export default router;
