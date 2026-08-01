import express from "express";

import { dashboard } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
    Dashboard API
*/
router.get("/", protect, dashboard);

export default router;