# 🌾 Crop Yield Analysis Using Weather and Soil Data

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.3-lightgrey)
![React](https://img.shields.io/badge/React-18-61DAFB)
![XGBoost](https://img.shields.io/badge/XGBoost-2.1.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)

> Final Year Project — BSc Industrial Software Engineering  
> Pentecost University, Kojokrom | 2024/2025  
> **Student:** Nkrumah Samuel Kojo | **ID:** PUIS/23210007  
> **Supervisor:** Dr. Michael A. Nartey

---

## 📋 Project Overview

An AI-powered web application that predicts crop yields and recommends the most suitable crop based on real-time weather and soil data. The system targets smallholder farmers, agricultural extension officers, and policymakers across West Africa to support data-driven agricultural decisions.

---

## 🖥️ System Preview

| Dashboard | Prediction Page |
|---|---|
| Displays model stats, supported crops, live weather | Enter soil data, auto-fill weather, get AI results |

---

## 🤖 Machine Learning Models

| Model | Task | Metric | Score |
|---|---|---|---|
| Linear Regression | Yield Prediction (Baseline) | R² | 0.693 |
| Random Forest Regressor | Yield Prediction | R² | 0.964 |
| **XGBoost Regressor** | **Yield Prediction (Selected)** | **R²** | **0.975** |
| Random Forest Classifier | Crop Recommendation | Accuracy | 99.55% |

---

## 🛠️ Technology Stack

### Backend
- **Python 3.12** — core language
- **Flask 3.0.3** — REST API framework
- **scikit-learn** — ML model training
- **XGBoost** — yield regression model
- **joblib** — model serialisation

### Frontend
- **React 18** — UI framework
- **Recharts** — data visualisation
- **React Router** — page navigation

### Data & APIs
- **Kaggle Crop Recommendation Dataset** — 2,200 samples, 22 crops
- **Synthetic Yield Dataset** — 3,000 samples generated using agronomic formulas
- **OpenWeatherMap API** — real-time weather data

---

## ⚙️ System Features

- 🌱 **Crop Recommendation** — AI suggests the best crop for given soil/weather conditions
- 📈 **Yield Prediction** — Predicts expected yield in tons/hectare
- 🌍 **Live Weather** — Auto-fills weather data by city name
- 📊 **Dual Yield Comparison** — Shows yield for both selected crop and AI recommended crop
- 💡 **Farming Tips** — Actionable tips to improve yield

---

## 🚀 How To Run Locally

### Prerequisites
- Python 3.12+
- Node.js v20+
- Git

### Step 1 — Clone the Repository
```bash
git clone https://github.com/Sammy97332/Crop-Yield-Analysis.git
cd Crop-Yield-Analysis
```

### Step 2 — Download Dataset
```bash
curl -L --ssl-no-revoke "https://raw.githubusercontent.com/rakibnsajib/Crop-Recommendation-Using-Machine-Learning/main/Crop_recommendation.csv" -o data/Crop_recommendation.csv
```

### Step 3 — Train ML Models
```bash
python notebooks/rebuild_models.py
```

### Step 4 — Run Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`

### Step 5 — Run Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

---

## 📁 Project Structure

```
Crop-Yield-Analysis/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── requirements.txt    # Python dependencies
│   └── README.md
├── data/
│   ├── Crop_recommendation.csv    # Real dataset
│   └── crop_yield_synthetic.csv  # Synthetic yield dataset
├── frontend/
│   └── src/
│       ├── components/     # Navbar, WeatherCard, ResultCard
│       ├── pages/          # Dashboard, Predict, About
│       └── utils/          # API utility functions
├── models/
│   ├── crop_recommendation_model.pkl
│   ├── crop_yield_model.pkl
│   └── ...
└── notebooks/
    ├── phase1_preprocessing.py
    ├── phase2_training.py
    └── rebuild_models.py
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/crops` | List all supported crops |
| POST | `/api/predict/recommend` | Get crop recommendation |
| POST | `/api/predict/yield` | Get yield prediction |
| POST | `/api/predict/full` | Combined recommendation + yield |
| GET | `/api/weather/<city>` | Get live weather data |

---

## 📊 Supported Crops

| Yield Prediction | Recommendation |
|---|---|
| Maize, Rice, Cassava, Soybeans, Cotton, Wheat | 22 crops including all major West African varieties |

---

## 🎯 Project Objectives

1. Collect and preprocess agricultural datasets for crop yield and soil/weather parameters
2. Train and compare ML models (Linear Regression, Random Forest, XGBoost) for yield prediction
3. Integrate OpenWeatherMap API for real-time weather data retrieval
4. Build a user-friendly React dashboard for data input, visualisation, and recommendations
5. Evaluate model performance using MAE, RMSE, and R² metrics
6. Deploy the system to a cloud platform for public accessibility

---

## 📄 License

This project is developed for academic purposes as part of a Final Year Project at Pentecost University.

---

*Built with ❤️ by Nkrumah Samuel Kojo — Pentecost University, Ghana*
