import express from "express";

import {
    createReason,
    getReasons
} from "../controllers/customReason.controller.js";

import {
    protect
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Add a custom reason
router.post("/", protect, createReason);

// Get reasons for an analysis
router.get("/:analysisId", protect, getReasons);

export default router;