# Crop Yield Analysis — Backend API

Flask REST API powering the Crop Yield Analysis System.

## Setup

```bash
pip install -r requirements.txt
python app.py
```

API runs on `http://localhost:5000`

## Environment Variables

| Variable      | Description                        | Default              |
|---------------|------------------------------------|----------------------|
| `OWM_API_KEY` | OpenWeatherMap API key (free tier) | mock data if not set |

## Endpoints

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/`                           | Health check                         |
| GET    | `/api/crops`                  | List all supported crops             |
| POST   | `/api/predict/recommend`      | Recommend best crop for conditions   |
| POST   | `/api/predict/yield`          | Predict yield in tons/hectare        |
| POST   | `/api/predict/full`           | Recommend + yield in one call        |
| GET    | `/api/weather/<city>`         | Get live weather for a city          |

## Example — Crop Recommendation

```bash
curl -X POST http://localhost:5000/api/predict/recommend \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":25.5,"humidity":80,"ph":6.5,"rainfall":202}'
```

Response:
```json
{
  "recommended_crop": "rice",
  "confidence": 63.0,
  "top_3": [
    {"crop": "rice", "confidence": 63.0},
    {"crop": "maize", "confidence": 20.5},
    {"crop": "jute", "confidence": 10.2}
  ]
}
```

## Example — Yield Prediction

```bash
curl -X POST http://localhost:5000/api/predict/yield \
  -H "Content-Type: application/json" \
  -d '{"crop":"maize","N":90,"P":42,"K":43,"temperature":25.5,"humidity":80,"ph":6.5,"rainfall":600,"fertilizer_used":1,"irrigation_used":1}'
```

Response:
```json
{
  "crop": "maize",
  "predicted_yield": 2.852,
  "unit": "tons/hectare",
  "interpretation": "Moderate yield expected"
}
```
