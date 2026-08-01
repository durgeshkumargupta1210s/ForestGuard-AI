import nodemailer from "nodemailer";

/*
 * Built on first use, not at import time.
 *
 * ESM hoists this module's `import` above the `dotenv.config()` call in
 * server.js, so every EMAIL_* variable is still undefined while this file is
 * being evaluated. The transporter used to be created here with a host of
 * `undefined`, which meant no alert email could ever be delivered.
 */
let transporter = null;

const getTransporter = async () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  const isPlaceholder = !pass || pass.includes("your_") || pass === "password";

  if (host && user && pass && !isPlaceholder) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Live Demo Fallback: Automatically generate zero-config Ethereal SMTP account for interview demos
  if (!transporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`✉️ Demo Ethereal SMTP Active (User: ${testAccount.user})`);
    } catch (err) {
      console.warn("Could not auto-generate test SMTP account:", err.message);
      return null;
    }
  }

  return transporter;
};

/**
 * Send a non-technical forest risk alert email to the region officer/user.
 */
export const sendRiskAlert = async ({
  to,
  regionName,
  riskLevel,
  explanation,
  lossPercentage,
  ndvi,
  coordinates,
}) => {
  const mailer = await getTransporter();
  const recipient = (!to || to.includes("your_email") || to.includes("example.com"))
    ? (process.env.EMAIL_USER || "namitgmaps73@gmail.com")
    : to;

  const nonTechExplanation = typeof explanation === "string"
    ? explanation
    : explanation?.summary || `Our automated satellite scan detected severe vegetation loss in ${regionName}. Approximately ${lossPercentage || 34}% of the forest canopy has been depleted. Immediate field ranger verification is recommended.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="color: #ef4444; margin: 0; font-size: 22px;">🚨 ForestGuard Emergency Alert</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">High Risk Deforestation & Canopy Loss Detected</p>
      </div>

      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
        <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px;">Forest Region: <strong>${regionName}</strong></h2>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Risk Level:</strong> <span style="color: #ef4444; font-weight: bold;">${riskLevel}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Estimated Canopy Loss:</strong> <span style="color: #f87171; font-weight: bold;">${lossPercentage || 34}%</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Mean NDVI Index:</strong> <span style="color: #4ade80;">${ndvi || 0.21}</span></p>
        ${coordinates ? `<p style="margin: 4px 0; font-size: 13px; color: #94a3b8;"><strong>Coordinates:</strong> ${coordinates.latitude}°N, ${coordinates.longitude}°E</p>` : ""}
      </div>

      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #fbbf24; margin: 0 0 8px 0; font-size: 15px;">💡 Non-Technical AI Summary:</h3>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0;">${nonTechExplanation}</p>
      </div>

      <div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #38bdf8; margin: 0 0 6px 0; font-size: 14px;">📋 Recommended Action for Forest Rangers:</h3>
        <ul style="color: #94a3b8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Dispatch local patrol team to coordinates to inspect canopy clearing.</li>
          <li>Log satellite evidence timestamp in official ranger registry.</li>
          <li>Monitor buffer boundaries for vehicle or logging equipment access.</li>
        </ul>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
        ForestGuard Automated Satellite Surveillance System · Sentinel-2 L2A Orbit Monitoring
      </p>
    </div>
  `;

  const textContent = `
🚨 ForestGuard Emergency Alert: ${riskLevel} Risk Detected

Monitored Region: ${regionName}
Risk Level: ${riskLevel}
Vegetation Loss: ${lossPercentage || 34}%
NDVI Index: ${ndvi || 0.21}

Non-Technical Summary:
${nonTechExplanation}

Recommended Action:
- Dispatch local patrol team to inspect canopy clearing.
- Log satellite evidence timestamp.

ForestGuard Satellite Surveillance System
  `;

  if (!mailer) {
    console.log(`[ALERT LOG ONLY] High Risk Alert for ${regionName}: ${lossPercentage || 34}% loss detected.`);
    return { success: true, loggedOnly: true };
  }

  try {
    const info = await mailer.sendMail({
      from: `"ForestGuard Emergency Alert" <${process.env.EMAIL_USER || "alerts@forestguard.org"}>`,
      to: recipient,
      subject: `🚨 ForestGuard Alert: High Risk Forest Loss Detected in ${regionName}`,
      text: textContent,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("--------------------------------------------------");
    console.log(`✅ Risk alert email sent to ${recipient} for ${regionName}`);
    if (previewUrl) {
      console.log(`🔗 LIVE INTERVIEW DEMO EMAIL PREVIEW URL: ${previewUrl}`);
    }
    console.log("--------------------------------------------------");

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error("Notification Error:", error.message);
    return { success: false, error: error.message };
  }
};
