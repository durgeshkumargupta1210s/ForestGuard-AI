import numpy as np
from utils.preprocessing import preprocess_satellite_data
from models.model_loader import load_model

# Load trained Random Forest model on startup
model = load_model()

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}

# NDVI cut-offs. These are the thresholds scripts/train_model.py labelled the
# training set with, so they are the canonical ones — the backend fallback and
# normalizer use the same pair.
NDVI_HIGH_RISK = 0.3
NDVI_MEDIUM_RISK = 0.6

# Confidence reported when the RandomForest did not produce the answer.
# It used to stay at the model's 0.92 default even when the model crashed,
# so a failed prediction advertised itself as 92% confident.
THRESHOLD_CONFIDENCE = 0.6

# riskScore / vegetationLossPercentage bands per risk level. The raw NDVI-derived
# figure is clamped into the band of the *predicted* class, so a model that says
# "Low" can no longer be paired with a 0.8 risk score.
RISK_SCORE_BANDS = {
    "Low": (0.05, 0.33),
    "Medium": (0.34, 0.66),
    "High": (0.67, 1.0),
}

LOSS_PERCENT_BANDS = {
    "Low": (0.5, 10.0),
    "Medium": (10.0, 40.0),
    "High": (40.0, 100.0),
}

def calculate_ndvi_stats(nir, red):
    if (nir + red) == 0:
        base_ndvi = 0.0
    else:
        base_ndvi = (nir - red) / (nir + red)

    base_ndvi = float(np.clip(base_ndvi, -0.2, 0.95))
    mean_val   = round(base_ndvi, 2)
    min_val    = round(max(-0.2, base_ndvi - 0.34), 2)
    max_val    = round(min(1.0, base_ndvi + 0.26), 2)
    std_dev    = round(0.15, 2)

    return {
        "mean": mean_val,
        "min": min_val,
        "max": max_val,
        "stdDev": std_dev,
        "validPixels": 65100,
        "totalPixels": 65536,
    }

def calculate_change_detection(ndvi_mean):
    if ndvi_mean < NDVI_HIGH_RISK:
        decrease = 18400
        stable   = 41000
        increase = 6136
    elif ndvi_mean < NDVI_MEDIUM_RISK:
        decrease = 8192
        stable   = 52000
        increase = 5344
    else:
        decrease = 2100
        stable   = 58000
        increase = 5436

    return {
        "decreaseCount": decrease,
        "stableCount": stable,
        "increaseCount": increase,
    }

def threshold_risk_level(ndvi_mean):
    """Risk level from NDVI alone — used whenever the model is unavailable."""
    if ndvi_mean < NDVI_HIGH_RISK:
        return "High"
    if ndvi_mean < NDVI_MEDIUM_RISK:
        return "Medium"
    return "Low"

def _clamp_into_band(value, band):
    low, high = band
    return float(min(high, max(low, value)))

def derive_scores(risk_level, ndvi_mean):
    """
    Turn the predicted class plus NDVI into a risk score and a vegetation loss
    percentage that agree with each other. NDVI still drives the value inside
    the band, so two "Medium" regions are still ranked relative to each other.
    """
    raw_score = 1.0 - ndvi_mean
    raw_loss = (NDVI_MEDIUM_RISK - ndvi_mean) * 100

    band = RISK_SCORE_BANDS.get(risk_level, RISK_SCORE_BANDS["Low"])
    loss_band = LOSS_PERCENT_BANDS.get(risk_level, LOSS_PERCENT_BANDS["Low"])

    risk_score = round(_clamp_into_band(raw_score, band), 2)
    loss_pct = round(_clamp_into_band(raw_loss, loss_band), 1)

    return risk_score, loss_pct

def predict_risk(satellite_data):
    processed = preprocess_satellite_data(satellite_data)
    nir       = processed.get("nir", 0.6)
    red       = processed.get("red", 0.2)
    cloud     = processed.get("cloudCoverage", 5)

    ndvi_obj = calculate_ndvi_stats(nir, red)
    ndvi_mean = ndvi_obj["mean"]

    change_obj = calculate_change_detection(ndvi_mean)

    model_used = False

    if model is not None:
        try:
            # Feature order must match scripts/train_model.py:
            # [NDVI, NIR, RED, CloudCoverage]
            X = np.array([[ndvi_mean, nir, red, cloud]])
            pred_class = model.predict(X)[0]
            probs      = model.predict_proba(X)[0]
            risk_level = RISK_LABELS.get(pred_class, "Low")
            confidence = float(np.max(probs))
            model_used = True
        except Exception as e:
            print(f"⚠️ ML prediction failed ({e.__class__.__name__}: {e}) — using NDVI thresholds")
            risk_level = threshold_risk_level(ndvi_mean)
            confidence = THRESHOLD_CONFIDENCE
    else:
        risk_level = threshold_risk_level(ndvi_mean)
        confidence = THRESHOLD_CONFIDENCE

    # Compute risk score & vegetation loss percentage from the predicted class
    risk_score, loss_pct = derive_scores(risk_level, ndvi_mean)

    risk_classification = {
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "vegetationLossPercentage": loss_pct,
        "confidenceScore": round(confidence, 2),
    }

    return {
        "ndvi": ndvi_obj,
        "changeDetection": change_obj,
        "riskClassification": risk_classification,
        "riskLevel": risk_level,
        "confidence": round(confidence, 2),
        "cloudCoverage": cloud,
        # Lets the backend record whether the RandomForest actually answered
        # instead of guessing from the satellite payload.
        "modelUsed": model_used,
        "source": "random-forest" if model_used else "ndvi-threshold",
    }
