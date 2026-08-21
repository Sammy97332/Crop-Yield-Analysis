// src/utils/api.js
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function fetchWeather(city) {
  const res = await fetch(`${BASE_URL}/api/weather/${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error("Could not fetch weather");
  return res.json();
}

export async function predictFull(data) {
  const res = await fetch(`${BASE_URL}/api/predict/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

export async function predictYield(data) {
  const res = await fetch(`${BASE_URL}/api/predict/yield`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Yield prediction failed");
  return res.json();
}

export async function fetchCrops() {
  const res = await fetch(`${BASE_URL}/api/crops`);
  if (!res.ok) throw new Error("Could not fetch crops");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("API offline");
  return res.json();
}
