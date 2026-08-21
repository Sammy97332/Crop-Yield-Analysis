// src/pages/Predict.js
import React, { useState } from "react";
import { predictFull, fetchWeather } from "../utils/api";
import ResultCard from "../components/ResultCard";
import "./Predict.css";

const YIELD_CROPS = ["cassava","cotton","maize","rice","soybeans","wheat"];

const DEFAULT_FORM = {
  N: "", P: "", K: "", ph: "",
  temperature: "", humidity: "", rainfall: "",
  fertilizer_used: 0, irrigation_used: 0, crop: "maize",
};

const FIELD_INFO = {
  N:           { label: "Nitrogen (N)",      unit: "mg/kg", min: 0,   max: 140, step: 1,   tip: "Nitrogen content in soil" },
  P:           { label: "Phosphorus (P)",    unit: "mg/kg", min: 5,   max: 145, step: 1,   tip: "Phosphorus content in soil" },
  K:           { label: "Potassium (K)",     unit: "mg/kg", min: 5,   max: 205, step: 1,   tip: "Potassium content in soil" },
  ph:          { label: "Soil pH",           unit: "0–14",  min: 3.5, max: 10,  step: 0.1, tip: "Soil acidity/alkalinity (ideal: 5.5–7.5)" },
  temperature: { label: "Temperature",       unit: "°C",    min: 5,   max: 45,  step: 0.1, tip: "Average ambient temperature" },
  humidity:    { label: "Humidity",          unit: "%",     min: 10,  max: 100, step: 0.1, tip: "Relative air humidity" },
  rainfall:    { label: "Rainfall",          unit: "mm",    min: 20,  max: 1500,step: 1,   tip: "Annual or seasonal rainfall" },
};

export default function Predict() {
  const [form, setForm]         = useState(DEFAULT_FORM);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [city, setCity]         = useState("Accra");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherMsg, setWeatherMsg]         = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleWeatherFetch = async () => {
    if (!city.trim()) return;
    setWeatherLoading(true);
    setWeatherMsg("");
    try {
      const w = await fetchWeather(city.trim());
      setForm(f => ({
        ...f,
        temperature: w.temperature,
        humidity:    w.humidity,
        rainfall:    w.rainfall,
      }));
      setWeatherMsg(`✅ Weather loaded for ${w.city} — temperature, humidity and rainfall filled in.`);
    } catch {
      setWeatherMsg("❌ Could not fetch weather. Enter values manually.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Basic validation
    for (const key of ["N","P","K","ph","temperature","humidity","rainfall"]) {
      if (form[key] === "" || form[key] === null) {
        setError(`Please fill in the "${FIELD_INFO[key]?.label}" field.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        N:               parseFloat(form.N),
        P:               parseFloat(form.P),
        K:               parseFloat(form.K),
        ph:              parseFloat(form.ph),
        temperature:     parseFloat(form.temperature),
        humidity:        parseFloat(form.humidity),
        rainfall:        parseFloat(form.rainfall),
        fertilizer_used: parseInt(form.fertilizer_used),
        irrigation_used: parseInt(form.irrigation_used),
        selected_crop:   form.crop,  // user's chosen crop for yield
      };
      const data = await predictFull(payload);
      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (e) {
      setError("Prediction failed. Make sure the backend API is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError("");
    setWeatherMsg("");
  };

  const fillExample = () => {
    setForm({
      N: 90, P: 42, K: 43, ph: 6.5,
      temperature: 25.5, humidity: 80, rainfall: 202,
      fertilizer_used: 1, irrigation_used: 0, crop: "rice",
    });
    setError("");
    setResult(null);
  };

  return (
    <div className="predict-page">
      <div className="predict-header">
        <h1>🔍 Crop Yield Prediction</h1>
        <p>Enter your soil and weather data to get AI-powered crop recommendations and yield estimates.</p>
      </div>

      <div className="predict-layout">
        {/* ── FORM ── */}
        <div className="form-panel">

          {/* Weather auto-fill */}
          <div className="weather-autofill">
            <h3>🌍 Auto-fill Weather from City</h3>
            <div className="autofill-row">
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleWeatherFetch()}
                placeholder="City name (e.g. Kumasi)"
              />
              <button onClick={handleWeatherFetch} disabled={weatherLoading}>
                {weatherLoading ? "Fetching..." : "Use Weather"}
              </button>
            </div>
            {weatherMsg && <p className="weather-msg">{weatherMsg}</p>}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="predict-form">

            {/* Soil section */}
            <div className="form-section">
              <h3>🪱 Soil Parameters</h3>
              <div className="form-grid">
                {["N","P","K","ph"].map(key => (
                  <div className="form-group" key={key}>
                    <label>
                      {FIELD_INFO[key].label}
                      <span className="unit-badge">{FIELD_INFO[key].unit}</span>
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      min={FIELD_INFO[key].min}
                      max={FIELD_INFO[key].max}
                      step={FIELD_INFO[key].step}
                      placeholder={`e.g. ${FIELD_INFO[key].min}–${FIELD_INFO[key].max}`}
                    />
                    <span className="field-tip">{FIELD_INFO[key].tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather section */}
            <div className="form-section">
              <h3>🌦️ Weather Parameters</h3>
              <div className="form-grid">
                {["temperature","humidity","rainfall"].map(key => (
                  <div className="form-group" key={key}>
                    <label>
                      {FIELD_INFO[key].label}
                      <span className="unit-badge">{FIELD_INFO[key].unit}</span>
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      min={FIELD_INFO[key].min}
                      max={FIELD_INFO[key].max}
                      step={FIELD_INFO[key].step}
                      placeholder={`e.g. ${FIELD_INFO[key].min}–${FIELD_INFO[key].max}`}
                    />
                    <span className="field-tip">{FIELD_INFO[key].tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Farm management */}
            <div className="form-section">
              <h3>🚜 Farm Management</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Crop for Yield Prediction</label>
                  <select name="crop" value={form.crop} onChange={handleChange}>
                    {YIELD_CROPS.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="field-tip">Used for the yield regression model</span>
                </div>
                <div className="form-group checkboxes">
                  <label>Additional Inputs</label>
                  <div className="checkbox-row">
                    <label className="check-label">
                      <input
                        type="checkbox"
                        name="fertilizer_used"
                        checked={form.fertilizer_used === 1}
                        onChange={handleChange}
                      />
                      Fertilizer Used
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        name="irrigation_used"
                        checked={form.irrigation_used === 1}
                        onChange={handleChange}
                      />
                      Irrigation Used
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="form-error">⚠️ {error}</div>}

            {/* Actions */}
            <div className="form-actions">
              <button type="submit" className="btn-predict" disabled={loading}>
                {loading ? "⏳ Analysing..." : "🔍 Predict Now"}
              </button>
              <button type="button" className="btn-example" onClick={fillExample}>
                📋 Load Example
              </button>
              <button type="button" className="btn-reset" onClick={handleReset}>
                ↩ Reset
              </button>
            </div>
          </form>
        </div>

        {/* ── RESULTS ── */}
        <div className="result-panel">
          {!result && !loading && (
            <div className="result-placeholder">
              <span className="placeholder-icon">🌱</span>
              <p>Fill in the form and click <strong>Predict Now</strong> to see results here.</p>
            </div>
          )}
          {loading && (
            <div className="result-placeholder">
              <span className="placeholder-icon">⏳</span>
              <p>Running AI models...</p>
            </div>
          )}
          {result && <ResultCard result={result} />}
        </div>
      </div>
    </div>
  );
}
