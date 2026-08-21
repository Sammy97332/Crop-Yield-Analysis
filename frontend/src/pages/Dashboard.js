// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WeatherCard from "../components/WeatherCard";
import { healthCheck } from "../utils/api";
import "./Dashboard.css";

const STATS = [
  { icon: "🌾", label: "Crops Supported",     value: "22",    sub: "recommendation model" },
  { icon: "📊", label: "Yield Crops",          value: "6",     sub: "regression model" },
  { icon: "🤖", label: "Model Accuracy",       value: "99.6%", sub: "crop classifier" },
  { icon: "📈", label: "Yield Model R²",       value: "0.975", sub: "XGBoost regressor" },
];

const CROPS_PREVIEW = [
  { name: "Maize",    icon: "🌽", note: "Optimal temp: 20–30°C" },
  { name: "Rice",     icon: "🍚", note: "Optimal rain: 150–300mm" },
  { name: "Cassava",  icon: "🥔", note: "Base yield: ~10 tons/ha" },
  { name: "Soybeans", icon: "🫘", note: "Optimal pH: 6.0–7.0" },
  { name: "Cotton",   icon: "🌿", note: "High temp tolerance" },
  { name: "Wheat",    icon: "🌾", note: "Optimal temp: 15–25°C" },
];

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    healthCheck()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1>Crop Yield Analysis System</h1>
          <p>
            AI-powered crop recommendations and yield predictions using
            real-time weather and soil data. Supporting smarter agricultural
            decisions across West Africa.
          </p>
          <div className="hero-actions">
            <Link to="/predict" className="btn-primary">
              🔍 Start Prediction
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-badge">
          <span
            className={`api-status ${apiStatus}`}
            title="Backend API status"
          >
            {apiStatus === "online"   ? "🟢 API Online" :
             apiStatus === "offline"  ? "🔴 API Offline" :
                                        "🟡 Checking..."}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Main content row */}
      <div className="dashboard-row">
        {/* Supported Crops */}
        <div className="card crops-card">
          <h2>🌱 Supported Crops (Yield Prediction)</h2>
          <div className="crops-grid">
            {CROPS_PREVIEW.map((c) => (
              <div className="crop-tile" key={c.name}>
                <span className="crop-tile-icon">{c.icon}</span>
                <span className="crop-tile-name">{c.name}</span>
                <span className="crop-tile-note">{c.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="weather-col">
          <WeatherCard />
        </div>
      </div>

      {/* How it works */}
      <div className="card how-it-works">
        <h2>⚙️ How It Works</h2>
        <div className="steps-row">
          {[
            { n: "1", title: "Enter Soil Data",    desc: "Input N, P, K levels, pH, and moisture from your soil test." },
            { n: "2", title: "Fetch Weather",      desc: "Live temperature, humidity and rainfall pulled from OpenWeatherMap." },
            { n: "3", title: "AI Analysis",        desc: "Two ML models (Random Forest + XGBoost) process your data." },
            { n: "4", title: "Get Results",        desc: "Receive crop recommendations and predicted yield in tons/ha." },
          ].map((s) => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div className="step-body">
                <p className="step-title">{s.title}</p>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
