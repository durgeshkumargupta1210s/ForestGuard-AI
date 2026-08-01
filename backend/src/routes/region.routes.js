import express from "express";

import {
    createRegion,
    getAllRegions,
    getRegionById,
    updateRegion,
    deleteRegion,
    getRegionStatistics,
    getCriticalRegions,
    toggleEmailAlerts,
    archiveRegion,
} from "../controllers/region.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ---------- Region Dashboard APIs ---------- */

// Get Region Statistics
router.get("/statistics", protect, getRegionStatistics);

// Get Critical Regions
router.get("/critical", protect, getCriticalRegions);

/* ---------- Region CRUD ---------- */

// Create Region
router.post("/", protect, createRegion);

// Get All Regions
router.get("/", protect, getAllRegions);

// Get Single Region
router.get("/:id", protect, getRegionById);

// Update Region
router.put("/:id", protect, updateRegion);

/* ---------- Region Actions ---------- */

// Toggle Email Alerts
router.patch("/:id/email-alert", protect, toggleEmailAlerts);

// Archive Region (Soft Delete)
router.patch("/:id/archive", protect, archiveRegion);

// Delete Region (Soft Delete)
router.delete("/:id", protect, deleteRegion);

export default router;