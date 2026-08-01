/**
 * Entry point of the backend.
 *
 * Flow:
 * 1. Load environment variables
 * 2. Verify the required ones are present
 * 3. Connect MongoDB
 * 4. Start Express server
 *
 * Static file serving lives in src/app.js, not here: this module imports app.js,
 * so anything registered below runs *after* app.js' catch-all 404 and would
 * never be reached.
 */

import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { seedInitialRegions } from "./src/services/region.service.js";

/* =========================================================
   ENVIRONMENT CHECK
========================================================= */

/*
 * Fail fast rather than at first use. Without JWT_SECRET every login throws
 * deep inside jsonwebtoken; without MONGODB_URI mongoose reports a confusing
 * parse error. Both are far from the actual cause.
 */
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
];

const missingEnv = REQUIRED_ENV.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variable(s): ${missingEnv.join(
      ", "
    )}`
  );

  console.error(
    "   Add them to backend/.env and restart."
  );

  process.exit(1);
}

/* =========================================================
   SERVER CONFIGURATION
========================================================= */

const PORT =
  process.env.PORT || 5000;

/* =========================================================
   DATABASE + SERVER
========================================================= */

import { startHourlyMonitoringScheduler } from "./src/services/scheduler.service.js";

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialRegions();
    startHourlyMonitoringScheduler();

    app.listen(PORT, () => {
      console.log(
        `🚀 ForestGuard server running on port ${PORT}`
      );

      console.log(
        `📄 Reports available at http://localhost:${PORT}/reports`
      );
    });
  } catch (error) {
    console.error(
      "❌ Unable to start ForestGuard server"
    );

    console.error(error);

    process.exit(1);
  }
};

startServer();
