"""
Flask Backend API — Crop Yield Analysis System
Student: Nkrumah Samuel Kojo | PUIS/23210007

Endpoints:
  GET  /                          → health check
  GET  /api/crops                 → list all supported crops
  POST /api/predict/recommend     → crop recommendation
  POST /api/predict/yield         → yield prediction
  GET  /api/weather/<city>        → live weather from OpenWeatherMap
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# ── Paths ────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, "..", "models")

# ── Load Models ──────────────────────────────────────────
print("Loading models...")

rec_model   = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_model.pkl"))
rec_scaler  = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation_scaler.pkl"))
label_enc   = joblib.load(os.path.join(MODEL_DIR, "crop_label_encoder.pkl"))

yield_model   = joblib.load(os.path.join(MODEL_DIR, "crop_yield_model.pkl"))
yield_scaler  = joblib.load(os.path.join(MODEL_DIR, "crop_yield_scaler.pkl"))
yield_features = joblib.load(os.path.join(MODEL_DIR, "yield_feature_columns.pkl"))

print("✅ All models loaded.")

# ── OpenWeatherMap Config ─────────────────────────────────
OWM_API_KEY = os.environ.get("OWM_API_KEY", "YOUR_API_KEY_HERE")
OWM_URL     = "https://api.openweathermap.org/data/2.5/weather"

# ── Supported crops for yield model ──────────────────────
YIELD_CROPS = ["cassava", "cotton", "maize", "rice", "soybeans", "wheat"]

# ── Helper: build yield input vector ─────────────────────
def build_yield_vector(data, crop_name):
    """
    Builds the feature vector for yield prediction in the
    same one-hot encoded format the model was trained on.
    """
    base = {
        "temperature":     float(data["temperature"]),
        "rainfall":        float(data["rainfall"]),
        "N":               float(data["N"]),
        "P":               float(data["P"]),
        "K":               float(data["K"]),
        "ph":              float(data["ph"]),
        "humidity":        float(data["humidity"]),
        "fertilizer_used": int(data.get("fertilizer_used", 0)),
        "irrigation_used": int(data.get("irrigation_used", 0)),
    }
    # One-hot encode crop columns
    for crop in YIELD_CROPS:
        base[f"crop_{crop}"] = 1 if crop_name.lower() == crop else 0

    # Order must match training feature order
    vector = [base[f] for f in yield_features]
    return np.array(vector).reshape(1, -1)


# ════════════════════════════════════════════════════════
#  ROUTES
# ════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status":  "online",
        "message": "Crop Yield Analysis API is running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route("/api/crops", methods=["GET"])
def get_crops():
    """Returns all crops supported by each model."""
    rec_crops = list(label_enc.classes_)
    return jsonify({
        "recommendation_crops": sorted(rec_crops),
        "yield_crops": sorted(YIELD_CROPS),
        "total_recommendation_crops": len(rec_crops),
        "total_yield_crops": len(YIELD_CROPS)
    })


@app.route("/api/predict/recommend", methods=["POST"])
def predict_recommendation():
    """
    Predicts the most suitable crop given soil and weather inputs.

    Request body (JSON):
    {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 25.5,
        "humidity": 80.0,
        "ph": 6.5,
        "rainfall": 200.0
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        required = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        missing  = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        # Build input vector
        features = np.array([[
            float(data["N"]),
            float(data["P"]),
            float(data["K"]),
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"])
        ]])

        # Scale and predict
        features_scaled = rec_scaler.transform(features)
        pred_id         = rec_model.predict(features_scaled)[0]
        pred_proba      = rec_model.predict_proba(features_scaled)[0]

        # Top 3 crop recommendations
        top3_idx  = np.argsort(pred_proba)[::-1][:3]
        top3      = [
            {"crop": label_enc.classes_[i], "confidence": round(float(pred_proba[i]) * 100, 2)}
            for i in top3_idx
        ]

        return jsonify({
            "recommended_crop": label_enc.classes_[pred_id],
            "confidence":       round(float(pred_proba[pred_id]) * 100, 2),
            "top_3":            top3,
            "input_received":   data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict/yield", methods=["POST"])
def predict_yield():
    """
    Predicts crop yield in tons per hectare.

    Request body (JSON):
    {
        "crop":            "maize",
        "N":               90,
        "P":               42,
        "K":               43,
        "temperature":     25.5,
        "humidity":        80.0,
        "ph":              6.5,
        "rainfall":        200.0,
        "fertilizer_used": 1,
        "irrigation_used": 0
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        required = ["crop","N","P","K","temperature","humidity","ph","rainfall"]
        missing  = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        crop = data["crop"].lower()
        if crop not in YIELD_CROPS:
            return jsonify({
                "error": f"Crop '{crop}' not supported for yield prediction.",
                "supported_crops": YIELD_CROPS
            }), 400

        # Build and scale input vector
        vector        = build_yield_vector(data, crop)
        vector_scaled = yield_scaler.transform(vector)

        # Predict
        predicted_yield = float(yield_model.predict(vector_scaled)[0])
        predicted_yield = max(0.0, round(predicted_yield, 3))

        # Simple interpretation
        if predicted_yield >= 7:
            interpretation = "Excellent yield expected"
        elif predicted_yield >= 4:
            interpretation = "Good yield expected"
        elif predicted_yield >= 2:
            interpretation = "Moderate yield expected"
        elif predicted_yield >= 1:
            interpretation = "Below average yield — consider adjusting soil inputs"
        else:
            interpretation = "Poor yield expected — conditions are not ideal"

        return jsonify({
            "crop":              crop,
            "predicted_yield":   predicted_yield,
            "unit":              "tons/hectare",
            "interpretation":    interpretation,
            "fertilizer_used":   bool(data.get("fertilizer_used", 0)),
            "irrigation_used":   bool(data.get("irrigation_used", 0)),
            "input_received":    data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict/full", methods=["POST"])
def predict_full():
    """
    Combined endpoint: recommend crop AND predict yield for BOTH
    the user-selected crop AND the AI recommended crop.

    Request body (JSON):
    {
        "N": 90, "P": 42, "K": 43,
        "temperature": 25.5, "humidity": 80.0,
        "ph": 6.5, "rainfall": 200.0,
        "fertilizer_used": 1,
        "irrigation_used": 0,
        "selected_crop": "cassava"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        # ── Helper to interpret yield value ──────────────────
        def interpret(val):
            if val >= 7:   return "Excellent yield expected"
            elif val >= 4: return "Good yield expected"
            elif val >= 2: return "Moderate yield expected"
            elif val >= 1: return "Below average yield"
            else:          return "Poor yield expected"

        # ── Helper to predict yield for any crop ─────────────
        def get_yield(crop_name):
            if crop_name not in YIELD_CROPS:
                return None
            vec   = build_yield_vector(data, crop_name)
            vec_s = yield_scaler.transform(vec)
            val   = max(0.0, round(float(yield_model.predict(vec_s)[0]), 3))
            return {
                "crop":            crop_name,
                "predicted_yield": val,
                "unit":            "tons/hectare",
                "interpretation":  interpret(val)
            }

        # Step 1 — AI Crop Recommendation
        features = np.array([[
            float(data["N"]), float(data["P"]), float(data["K"]),
            float(data["temperature"]), float(data["humidity"]),
            float(data["ph"]), float(data["rainfall"])
        ]])
        features_scaled = rec_scaler.transform(features)
        pred_id         = rec_model.predict(features_scaled)[0]
        pred_proba      = rec_model.predict_proba(features_scaled)[0]
        recommended     = label_enc.classes_[pred_id]
        confidence      = round(float(pred_proba[pred_id]) * 100, 2)

        top3_idx = np.argsort(pred_proba)[::-1][:3]
        top3     = [
            {"crop": label_enc.classes_[i], "confidence": round(float(pred_proba[i]) * 100, 2)}
            for i in top3_idx
        ]

        # Step 2 — Yield for AI recommended crop
        # If recommended crop not in yield model, pick closest one from top3
        ai_crop_for_yield = recommended if recommended in YIELD_CROPS else (
            next((c["crop"] for c in top3 if c["crop"] in YIELD_CROPS), None)
        )
        ai_yield = get_yield(ai_crop_for_yield) if ai_crop_for_yield else None

        # Step 3 — Yield for USER selected crop
        selected_crop = data.get("selected_crop", "").lower().strip()
        selected_yield = None
        if selected_crop and selected_crop in YIELD_CROPS:
            selected_yield = get_yield(selected_crop)

        return jsonify({
            "recommendation": {
                "recommended_crop": recommended,
                "confidence":       confidence,
                "top_3":            top3
            },
            "ai_yield":       ai_yield,        # yield for AI recommended crop
            "selected_yield": selected_yield,  # yield for user selected crop
            "input_received": data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/weather/<city>", methods=["GET"])
def get_weather(city):
    """
    Fetches real-time weather for a city from OpenWeatherMap.
    Returns temperature, humidity, rainfall (if available).
    """
    try:
        if OWM_API_KEY == "YOUR_API_KEY_HERE":
            # Return mock data for development/demo
            return jsonify({
                "city":        city,
                "temperature": 27.4,
                "humidity":    78.0,
                "rainfall":    0.0,
                "description": "partly cloudy",
                "source":      "mock_data — add OWM_API_KEY env variable for live data"
            })

        params   = {"q": city, "appid": OWM_API_KEY, "units": "metric"}
        response = requests.get(OWM_URL, params=params, timeout=5)
        response.raise_for_status()
        w = response.json()

        return jsonify({
            "city":        w["name"],
            "country":     w["sys"]["country"],
            "temperature": w["main"]["temp"],
            "humidity":    w["main"]["humidity"],
            "rainfall":    w.get("rain", {}).get("1h", 0.0),
            "description": w["weather"][0]["description"],
            "source":      "OpenWeatherMap live"
        })

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"City not found or API error: {str(e)}"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Run ──────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
