import express from "express";
import cors from "cors";

import {
  REPORTS_DIR,
  UPLOADS_DIR,
} from "./config/paths.js";

import regionRoutes from "./routes/region.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import customReasonRoutes from "./routes/customReason.routes.js";
import userRoutes from "./routes/user.routes.js";
import alertRoutes from "./routes/alert.routes.js";

const app = express();

/* =========================================================
   GLOBAL MIDDLEWARES
========================================================= */

/*
 * Allow frontend ↔ backend communication.
 *
 * `origin` is a function rather than a string because ESM `import` statements
 * are hoisted above the `dotenv.config()` call in server.js: reading
 * process.env at module scope here would always see undefined and silently
 * pin CORS to the fallback origin. The function runs per request, by which
 * time the .env file has been loaded.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";

      callback(null, allowed);
    },
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   STATIC FILES
========================================================= */

/*
 * These mounts used to live in server.js, which imports this module — so they
 * were registered *after* the catch-all 404 below and every generated report
 * answered 404. Anything served statically has to be registered here, above
 * the catch-all.
 */

/**
 * Uploaded files
 *
 * Example:
 * http://localhost:5000/uploads/example.jpg
 */
app.use(
  "/uploads",
  express.static(UPLOADS_DIR)
);

/**
 * Generated analysis reports
 *
 * Example:
 * http://localhost:5000/reports/analysis_123.pdf
 */
app.use(
  "/reports",
  express.static(REPORTS_DIR)
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ForestGuard API Running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend healthy",
    data: {
      backend: "running",
      mlService: process.env.ML_SERVICE_URL || "http://localhost:8000/predict",
    },
  });
});

/* =========================================================
   API ROUTES
========================================================= */

// Authentication
app.use("/api/auth", authRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Regions
app.use("/api/regions", regionRoutes);

// Analysis
app.use("/api/analysis", analysisRoutes);

// Alerts
app.use("/api/alerts", alertRoutes);

// Custom Reasons
app.use(
  "/api/custom-reasons",
  customReasonRoutes
);

// Users
app.use("/api/users", userRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

/*
 * Last line of defence. Without this, Express' default handler leaks stack
 * traces and turns known failures (a duplicate key, a bad ObjectId, a failed
 * validation) into an indistinguishable 500.
 *
 * Must take four arguments and be registered last — that signature is how
 * Express recognises an error handler.
 */
app.use((err, req, res, next) => {
  console.error(
    `❌ ${req.method} ${req.originalUrl}:`,
    err
  );

  // Mongoose schema validation
  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // Malformed ObjectId in a path parameter
  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Unique index violation
  if (err?.code === 11000) {
    const field = Object.keys(
      err.keyPattern || {}
    )[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `A record with that ${field} already exists.`
        : "Duplicate record.",
    });
  }

  const status =
    err?.statusCode || err?.status || 500;

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Internal server error"
        : err?.message || "Request failed",
  });
});

export default app;