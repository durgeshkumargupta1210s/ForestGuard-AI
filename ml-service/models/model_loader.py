import os
import joblib

"""
Model loader for ForestGuard ML microservice.
Loads trained Random Forest model from disk if available.

Returning None is not an error the caller can see, so every failure path
logs loudly: a silent None means the predictor quietly degrades to plain
threshold logic while still reporting itself as an ML prediction.
Regenerate the artifact with `python scripts/train_model.py`.
"""

MODEL_FILENAME = "forest_risk_model.joblib"


def load_model():
    model_path = os.path.join(os.path.dirname(__file__), MODEL_FILENAME)

    if not os.path.exists(model_path):
        print(
            f"⚠️ ML model not found at {model_path} — falling back to NDVI "
            f"threshold logic. Run `python scripts/train_model.py` to create it."
        )
        return None

    try:
        model = joblib.load(model_path)
        print(f"🌲 ML Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(
            f"⚠️ Error loading ML model from {model_path}: {e.__class__.__name__}: {e}\n"
            f"   This is usually a scikit-learn version mismatch. "
            f"Re-train with `python scripts/train_model.py` to fix it.\n"
            f"   Falling back to NDVI threshold logic."
        )
        return None
