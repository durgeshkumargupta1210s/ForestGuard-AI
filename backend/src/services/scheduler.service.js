import Region from "../models/Region.js";
import { createAnalysis } from "./analysis.service.js";
import { sendRiskAlert } from "./notification.service.js";
import Alert from "../models/Alert.js";

let schedulerInterval = null;

/**
 * Executes a full satellite scan across all monitored forest reserves.
 */
export const runAutomatedSatelliteCheck = async (targetEmail) => {
  console.log("--------------------------------------------------");
  console.log(`⏱️ [${new Date().toISOString()}] Executing Automated Satellite Scan...`);
  console.log("--------------------------------------------------");

  try {
    const regions = await Region.find({});
    if (!regions.length) {
      console.log("ℹ️ No monitored forest regions found for automated check.");
      return;
    }

    let alertCount = 0;

    for (const region of regions) {
      try {
        console.log(`📡 Scanning satellite imagery for reserve: ${region.name} (${region.regionId || region._id})...`);
        const result = await createAnalysis({ regionId: region.regionId || region._id.toString() });
        const data = result?.data;

        if (!data) continue;

        const riskLevel = (data.riskClassification?.riskLevel || data.riskLevel || "LOW").toUpperCase();
        const lossPct = data.riskClassification?.vegetationLossPercentage ?? data.vegetationLossPercentage ?? 0;
        const ndvi = data.satelliteData?.ndvi ?? (Array.isArray(data.ndvi) ? data.ndvi[0] : 0.2);

        if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
          alertCount++;
          console.warn(`🚨 HIGH RISK DETECTED in ${region.name}! Vegetation Loss: ${lossPct}%, NDVI: ${ndvi}`);

          const summary = data.explainability?.summary ||
            `Automated hourly satellite scan detected severe vegetation loss (${lossPct}%) in ${region.name}. Immediate ranger verification is required.`;

          // Send Email Alert to the logged-in user's email or fallback
          await sendRiskAlert({
            to: targetEmail || process.env.EMAIL_USER,
            regionName: region.name,
            riskLevel,
            explanation: summary,
            lossPercentage: lossPct,
            ndvi,
            coordinates: region.coordinates?.[0],
          });
        }
      } catch (scanErr) {
        console.error(`❌ Error scanning region ${region.name}:`, scanErr.message);
      }
    }

    console.log(`✅ Automated Satellite Scan Complete. Analyzed ${regions.length} regions (${alertCount} high-risk alerts emitted).`);
  } catch (err) {
    console.error("❌ Scheduler error:", err.message);
  }
};

/**
 * Initializes the automated hourly satellite monitoring scheduler.
 * Default interval: 1 hour (3600000 ms), adjustable via MONITORING_INTERVAL_MS env.
 */
export const startHourlyMonitoringScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  const intervalMs = Number(process.env.MONITORING_INTERVAL_MS) || 3600000; // 1 hour
  console.log(`🌲 ForestGuard Automated Scheduler Active: Polling every ${(intervalMs / 60000).toFixed(0)} minutes.`);

  // Initial scan after server start (delayed by 10s)
  setTimeout(() => {
    runAutomatedSatelliteCheck();
  }, 10000);

  // Set recurring interval
  schedulerInterval = setInterval(() => {
    runAutomatedSatelliteCheck();
  }, intervalMs);
};
