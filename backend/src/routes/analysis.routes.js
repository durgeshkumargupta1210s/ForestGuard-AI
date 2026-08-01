import express from "express";

import {
  createAnalysis,
  getAllAnalysis,
  getRegionAnalysis,
  getLatestAnalysis,
  getAnalysisById,
  deleteAnalysis,
} from "../controllers/analysis.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* =========================================================
   CREATE ANALYSIS
========================================================= */

/* POST /api/analysis */
router.post("/", protect, createAnalysis);

/* =========================================================
   GET ALL ANALYSES
========================================================= */

/* GET /api/analysis */
router.get("/", protect, getAllAnalysis);

/* =========================================================
   REGION ANALYSIS
========================================================= */

/* GET /api/analysis/region/:regionId */
router.get("/region/:regionId", protect, getRegionAnalysis);

/* =========================================================
   LATEST REGION ANALYSIS
========================================================= */

/* GET /api/analysis/latest/:regionId */
router.get("/latest/:regionId", protect, getLatestAnalysis);

/* =========================================================
   SINGLE ANALYSIS
========================================================= */

/* GET /api/analysis/:id */
router.get("/:id", protect, getAnalysisById);

/* =========================================================
   DELETE ANALYSIS
========================================================= */

/* DELETE /api/analysis/:id */
router.delete("/:id", protect, deleteAnalysis);

export default router;
