// src/components/WeatherCard.js
import React, { useState } from "react";
import { fetchWeather } from "../utils/api";
import "./WeatherCard.css";

export default function WeatherCard({ onWeatherLoad }) {
  const [city, setCity]       = useState("Accra");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleFetch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather(city.trim());
      setWeather(data);
      if (onWeatherLoad) onWeatherLoad(data);
    } catch (e) {
      setError("Could not fetch weather. Check city name.");
    } finally {
      setLoading(false);
    }
  };

  const weatherIcon = (desc = "") => {
    if (desc.includes("rain"))  return "🌧️";
    if (desc.includes("cloud")) return "⛅";
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("storm")) return "⛈️";
    return "🌤️";
  };

  return (
    <div className="weather-card">
      <h3>🌍 Live Weather</h3>
      <div className="weather-input-row">
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleFetch()}
          placeholder="Enter city name..."
        />
        <button onClick={handleFetch} disabled={loading}>
          {loading ? "..." : "Fetch"}
        </button>
      </div>
      {error && <p className="weather-error">{error}</p>}
      {weather && (
        <div className="weather-data">
          <div className="weather-icon">{weatherIcon(weather.description)}</div>
          <div className="weather-details">
            <p className="weather-city">{weather.city}</p>
            <p className="weather-temp">{weather.temperature}°C</p>
            <p className="weather-desc">{weather.description}</p>
            <div className="weather-stats">
              <span>💧 {weather.humidity}% humidity</span>
              <span>🌧 {weather.rainfall} mm rain</span>
            </div>
          </div>
        </div>
      )}
      {weather && (
        <p className="weather-hint">
          ✅ Weather loaded — click <strong>Use in Prediction</strong> on the Predict page.
        </p>
      )}
    </div>
  );
}
