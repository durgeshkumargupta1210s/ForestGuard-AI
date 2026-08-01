import { GoogleGenerativeAI } from "@google/generative-ai";

/*
 * Built on first use, not at import time.
 *
 * ESM hoists this module's `import` above the `dotenv.config()` call in
 * server.js, so GEMINI_API_KEY is still undefined while this file is being
 * evaluated. Constructing the client here used to bake that undefined key in
 * permanently — every explanation failed with a 400 no matter what .env said.
 */
let client = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }

  return client;
};

/*
 * Mirrors the explainability sub-schema in models/Analysis.js. Anything the
 * model invents beyond these keys is dropped by Mongoose strict mode, so the
 * prompt asks for exactly this and nothing else.
 */
const RESPONSE_SHAPE = `{
  "summary": "2-3 sentence plain-language assessment",
  "primaryFactor": "the single strongest driver, under 80 characters",
  "secondaryFactors": ["short phrase", "short phrase"],
  "reasons": [
    {
      "title": "short label",
      "explanation": "one or two sentences",
      "metric": "the value this is based on, e.g. NDVI 0.28",
      "severity": "low" | "medium" | "high"
    }
  ]
}`;

const SEVERITIES = ["low", "medium", "high"];

/**
 * Pull a JSON object out of a model response.
 *
 * Gemini often wraps JSON in a ```json fence even when told not to, so the
 * raw text is rarely parseable as-is.
 */
const parseJsonResponse = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
};

/**
 * Coerce a parsed response into the exact shape Analysis.explainability
 * accepts, discarding anything malformed.
 */
const normalizeExplanation = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const reasons = Array.isArray(parsed.reasons)
    ? parsed.reasons
        .filter((r) => r && typeof r === "object")
        .map((r) => {
          const severity = String(r.severity || "").toLowerCase();

          return {
            title: String(r.title || "").slice(0, 120),
            explanation: String(r.explanation || ""),
            metric: String(r.metric || ""),

            // The sub-schema enums this field; an unrecognised value would
            // fail validation and take the whole analysis down with it.
            severity: SEVERITIES.includes(severity) ? severity : "medium",
          };
        })
        .filter((r) => r.title || r.explanation)
    : [];

  const summary = String(parsed.summary || "").trim();

  if (!summary && reasons.length === 0) {
    return null;
  }

  return {
    summary,

    primaryFactor: String(parsed.primaryFactor || "").slice(0, 200),

    secondaryFactors: Array.isArray(parsed.secondaryFactors)
      ? parsed.secondaryFactors
          .map((f) => String(f || "").trim())
          .filter(Boolean)
          .slice(0, 5)
      : [],

    reasons: reasons.slice(0, 6),
  };
};

/**
 * Generate a structured explanation of an analysis result.
 *
 * Returns an object shaped like Analysis.explainability, or `null` when Gemini
 * is unconfigured or unreachable — the caller substitutes a deterministic
 * explanation in that case. It used to return a bare string, which is why
 * `explainability.reasons` was empty on every single analysis: the caller reads
 * `explanation?.reasons`, and a string has no such property.
 */
export const generateExplanation = async (analysisResult) => {
  const genAI = getClient();

  if (!genAI) {
    console.warn(
      "GEMINI_API_KEY is not configured — skipping AI explanation",
    );

    return null;
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro"];
  const prompt = `You are an environmental monitoring analyst.

Interpret this satellite forest analysis for a forest officer:

Risk level: ${analysisResult?.riskLevel ?? "Unknown"}
NDVI (mean): ${analysisResult?.ndvi ?? "unknown"}
Model confidence: ${analysisResult?.confidence ?? "unknown"}
Vegetation loss: ${analysisResult?.vegetationLossPercentage ?? "unknown"}%
Cloud coverage: ${analysisResult?.cloudCoverage ?? "unknown"}%
Region: ${analysisResult?.regionName ?? "unnamed region"}

NDVI below 0.3 indicates severe vegetation stress or loss; 0.3-0.6 is moderate;
above 0.6 is healthy canopy. High cloud coverage reduces reading reliability.

Respond with JSON only, in exactly this shape:
${RESPONSE_SHAPE}

Give 2-4 reasons. Do not add keys beyond those shown.`;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
      });

      const result = await model.generateContent(prompt);
      const explanation = normalizeExplanation(
        parseJsonResponse(result.response.text()),
      );

      if (explanation) {
        console.log(`✅ Gemini AI Explanation generated using model ${modelName}`);
        return explanation;
      }
    } catch (err) {
      // Try next model name
    }
  }

  console.warn("Gemini Error: Could not generate explanation with available model endpoints, falling back to deterministic explanation.");
  return null;
};
