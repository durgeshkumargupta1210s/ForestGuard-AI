import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const testOAuthIntegration = async () => {
  console.log("-----------------------------------------------");
  console.log("🌲 ForestGuard Sentinel Hub OAuth2 Integration Test");
  console.log("-----------------------------------------------");

  const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ SENTINEL_HUB_CLIENT_ID or SENTINEL_HUB_CLIENT_SECRET missing in backend/.env!");
    process.exit(1);
  }

  try {
    console.log("Step 1: Requesting OAuth2 Bearer Token from Sentinel Hub...");
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const tokenRes = await axios.post(
      "https://services.sentinel-hub.com/oauth/token",
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const token = tokenRes.data?.access_token;
    if (!token) {
      throw new Error("OAuth token endpoint responded without an access_token!");
    }

    console.log("✅ Token Generated Successfully!");
    console.log(`   Token Type: ${tokenRes.data.token_type}`);
    console.log(`   Expires In: ${tokenRes.data.expires_in}s`);

    console.log("\nStep 2: Executing Sentinel Hub Process API Call...");
    const processRes = await axios.post(
      process.env.SENTINEL_PROCESS_URL || "https://services.sentinel-hub.com/api/v1/process",
      {
        input: {
          bounds: {
            bbox: [80.60, 22.32, 80.62, 22.34],
            properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
          },
          data: [{ type: "sentinel-2-l2a" }],
        },
        output: {
          width: 1,
          height: 1,
          responses: [{ identifier: "default", format: { type: "application/json" } }],
        },
        evalscript: `//VERSION=3
function setup() { return { input: ["B04","B08"], output: { bands:2, sampleType:"FLOAT32" } }; }
function evaluatePixel(sample){ return [sample.B04, sample.B08]; }`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Process API Call Successful!");
    console.log("   Bands Returned:", processRes.data);
    console.log("\n🎉 All Sentinel Hub OAuth2 & Process API features verified successfully!");
  } catch (err) {
    console.error("❌ OAuth Test Failed:", err.response?.data || err.message);
  }
};

testOAuthIntegration();
