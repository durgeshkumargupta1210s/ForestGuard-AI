import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

"""
Train a Random Forest classifier for Forest Vegetation Risk Prediction.
Features: [NDVI, NIR, RED, CloudCoverage]
Labels: 0 = Low Risk, 1 = Medium Risk, 2 = High Risk
"""

def train_and_save_model():
    np.random.seed(42)
    n_samples = 1000

    # Generate synthetic training dataset mimicking satellite spectral readings
    nir = np.random.uniform(0.1, 0.9, n_samples)
    red = np.random.uniform(0.05, 0.6, n_samples)
    cloud = np.random.uniform(0, 30, n_samples)
    ndvi = (nir - red) / (nir + red + 1e-5)

    X = np.column_stack((ndvi, nir, red, cloud))
    y = np.zeros(n_samples, dtype=int)

    # Classify targets: High Risk (2), Medium Risk (1), Low Risk (0)
    y[ndvi < 0.3] = 2
    y[(ndvi >= 0.3) & (ndvi < 0.6)] = 1
    y[ndvi >= 0.6] = 0

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "forest_risk_model.joblib")

    joblib.dump(clf, model_path)
    print(f"✅ Trained Random Forest model saved to: {model_path}")

if __name__ == "__main__":
    train_and_save_model()
