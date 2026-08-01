import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from models.predictor import predict_risk
from schemas.satellite import SatelliteRequest


# Create FastAPI application
app = FastAPI(
    title="ForestGuard ML Service"
)


# The backend (port 5000) is the only real caller, but the browser hits this
# service directly in some debugging flows, so the dev origins are allowed too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Health check API
@app.get("/")
def home():
    return {
        "message": "ForestGuard ML Service Running"
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "message": "ML service is healthy",
    }


# Prediction API
@app.post("/predict")
def predict(data: SatelliteRequest):

    """
    Receives satellite data

    Flow:
    Satellite Data
          |
          ▼
    Preprocessing
          |
          ▼
    ML Prediction
          |
          ▼
    Risk Result

    `data` is a validated model rather than a bare dict, so a malformed
    payload is rejected with a 422 here instead of raising deep inside
    the predictor and surfacing as an opaque 500.
    """


    result = predict_risk(data.to_features())


    return {

        "success": True,

        "prediction": result

    }
