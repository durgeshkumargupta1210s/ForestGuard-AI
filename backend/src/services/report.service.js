import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import { REPORTS_DIR } from "../config/paths.js";

/**
 * Generate PDF report for forest analysis.
 */
export const generateReport = async (analysis) => {
  try {
    /* =====================================================
       REPORT DIRECTORY
    ===================================================== */

    /*
     * Shared with the /reports static mount in app.js. It used to be
     * path.resolve("reports"), which is relative to process.cwd() — so the PDF
     * landed somewhere the static mount wasn't looking whenever the server was
     * started from anywhere but backend/.
     */
    const reportFolder = REPORTS_DIR;

    if (!fs.existsSync(reportFolder)) {
      fs.mkdirSync(reportFolder, {
        recursive: true,
      });
    }

    /* =====================================================
       FILE NAME
    ===================================================== */

    const idStr = analysis?._id
      ? analysis._id.toString()
      : `${Date.now()}`;

    const fileName = `analysis_${idStr}.pdf`;

    const filePath = path.join(
      reportFolder,
      fileName
    );

    /* =====================================================
       NORMALIZE ANALYSIS DATA
    ===================================================== */

    const regionName =
      analysis?.regionName ||
      analysis?.regionId?.name ||
      analysis?.region?.name ||
      "N/A";

    const riskLevel =
      analysis?.riskClassification?.riskLevel ||
      analysis?.riskClassification?.level ||
      analysis?.riskLevel ||
      "Unknown";

    const rawConfidence =
      analysis?.riskClassification?.confidenceScore ??
      analysis?.confidenceScore ??
      0;

    const confidence =
      Number(rawConfidence) <= 1
        ? Number(rawConfidence) * 100
        : Number(rawConfidence);

    let ndvi = null;

    if (Array.isArray(analysis?.ndvi)) {
      ndvi = analysis.ndvi[0];
    } else if (
      analysis?.ndvi &&
      typeof analysis.ndvi === "object"
    ) {
      ndvi = analysis.ndvi.mean;
    } else if (analysis?.ndvi != null) {
      ndvi = Number(analysis.ndvi);
    }

    const vegetationLoss =
      analysis?.riskClassification
        ?.vegetationLossPercentage ??
      analysis?.vegetationLossPercentage ??
      0;

    const riskScore =
      analysis?.riskClassification?.riskScore ??
      0;

    const explanation =
      analysis?.explainability?.summary ||
      analysis?.explainability?.primaryFactor ||
      "No AI explanation available.";

    /* =====================================================
       CREATE PDF
    ===================================================== */

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    const stream =
      fs.createWriteStream(filePath);

    doc.pipe(stream);

    /* =====================================================
       HEADER
    ===================================================== */

    doc
      .fontSize(22)
      .fillColor("#16a34a")
      .text(
        "ForestGuard AI - Analysis Report",
        {
          align: "center",
        }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        "AI-Powered Forest Monitoring & Risk Detection System",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    /* =====================================================
       REGION INFORMATION
    ===================================================== */

    doc
      .fontSize(15)
      .fillColor("#0f172a")
      .text("Region Information");

    doc.moveDown(0.7);

    doc
      .fontSize(11)
      .fillColor("#334155");

    doc.text(
      `Region: ${regionName}`
    );

    doc.text(
      `Risk Level: ${riskLevel}`
    );

    doc.text(
      `Confidence Score: ${confidence.toFixed(
        1
      )}%`
    );

    doc.text(
      `NDVI: ${
        typeof ndvi === "number" &&
        Number.isFinite(ndvi)
          ? ndvi.toFixed(3)
          : "N/A"
      }`
    );

    doc.text(
      `Vegetation Loss: ${Number(
        vegetationLoss
      ).toFixed(1)}%`
    );

    doc.text(
      `Risk Score: ${Number(
        riskScore
      ).toFixed(2)}`
    );

    doc.text(
      `Generated: ${new Date().toLocaleString(
        "en-IN"
      )}`
    );

    doc.moveDown(2);

    /* =====================================================
       SATELLITE / PROCESSING INFORMATION
    ===================================================== */

    doc
      .fontSize(15)
      .fillColor("#0f172a")
      .text("Analysis Information");

    doc.moveDown(0.7);

    doc
      .fontSize(11)
      .fillColor("#475569");

    doc.text(
      `Detection Method: ${
        analysis?.detectionMethod || "N/A"
      }`
    );

    if (
      analysis?.processingTime != null
    ) {
      doc.text(
        `Processing Time: ${(
          Number(analysis.processingTime) /
          1000
        ).toFixed(2)} seconds`
      );
    }

    if (
      analysis?.satelliteData?.dataSource
    ) {
      doc.text(
        `Satellite Source: ${analysis.satelliteData.dataSource}`
      );
    }

    doc.moveDown(2);

    /* =====================================================
       AI EXPLANATION
    ===================================================== */

    doc
      .fontSize(15)
      .fillColor("#0f172a")
      .text(
        "Gemini AI Risk Explanation"
      );

    doc.moveDown(0.7);

    doc
      .fontSize(10.5)
      .fillColor("#475569")
      .text(explanation, {
        align: "justify",
        lineGap: 3,
      });

    doc.moveDown(2);

    /* =====================================================
       RECOMMENDATIONS
    ===================================================== */

    doc
      .fontSize(15)
      .fillColor("#0f172a")
      .text("Recommended Actions");

    doc.moveDown(0.7);

    const recommendations =
      getRecommendations(riskLevel);

    doc
      .fontSize(10.5)
      .fillColor("#475569");

    recommendations.forEach(
      (recommendation, index) => {
        doc.text(
          `${index + 1}. ${recommendation}`,
          {
            lineGap: 3,
          }
        );

        doc.moveDown(0.4);
      }
    );

    /* =====================================================
       FOOTER
    ===================================================== */

    doc.moveDown(2);

    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text(
        "Generated by ForestGuard AI - Satellite Forest Monitoring Platform",
        {
          align: "center",
        }
      );

    /* =====================================================
       FINISH PDF
    ===================================================== */

    doc.end();

    // Wait until PDF has actually been written.
    await new Promise(
      (resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      }
    );

    return filePath;
  } catch (error) {
    console.error(
      "Report Generation Error:",
      error
    );

    /*
     * PDF failure should not cause the entire
     * forest analysis pipeline to fail.
     */
    return null;
  }
};

/**
 * Generate recommendations according to risk level.
 *
 * Exported so analysis.service.js can reuse it as the explainability fallback
 * when Gemini is unavailable, instead of keeping a second copy of this list.
 */
export function getRecommendations(riskLevel) {
  const level = String(
    riskLevel || ""
  ).toLowerCase();

  if (
    level === "critical" ||
    level === "high"
  ) {
    return [
      "Immediately notify the responsible forest authorities.",
      "Schedule a field inspection of the affected forest region.",
      "Increase satellite monitoring frequency.",
      "Compare the latest vegetation data with previous observations.",
      "Investigate possible illegal deforestation or vegetation loss.",
    ];
  }

  if (
    level === "medium" ||
    level === "warning"
  ) {
    return [
      "Continue frequent satellite monitoring.",
      "Schedule another AI analysis during the next monitoring cycle.",
      "Review vegetation change patterns.",
      "Prepare forest officials for possible intervention if risk increases.",
    ];
  }

  return [
    "Continue routine satellite monitoring.",
    "Maintain the regular AI analysis schedule.",
    "Preserve this report for future comparison.",
  ];
}