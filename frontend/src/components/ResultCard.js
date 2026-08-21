// src/components/ResultCard.js
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import "./ResultCard.css";

const COLORS = ["#1a6b2f", "#4ade80", "#86efac"];

const yieldColor = (val) => {
  if (val >= 7) return "#16a34a";
  if (val >= 4) return "#65a30d";
  if (val >= 2) return "#ca8a04";
  return "#dc2626";
};

function YieldBlock({ data, label, icon }) {
  if (!data) return null;
  return (
    <div className="yield-block">
      <p className="yield-block-label">{icon} {label}</p>
      <div className="yield-display">
        <div className="yield-value" style={{ color: yieldColor(data.predicted_yield) }}>
          {data.predicted_yield}
          <span className="yield-unit"> tons/ha</span>
        </div>
        <div className="yield-crop">for <strong>{data.crop}</strong></div>
        <div
          className="yield-interpretation"
          style={{ background: yieldColor(data.predicted_yield) }}
        >
          {data.interpretation}
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;

  const { recommendation, ai_yield, selected_yield } = result;

  const chartData = recommendation.top_3.map(item => ({
    name: item.crop.charAt(0).toUpperCase() + item.crop.slice(1),
    confidence: item.confidence,
  }));

  // Check if selected and AI crop are the same
  const sameAsCrop = selected_yield && ai_yield &&
    selected_yield.crop === ai_yield.crop;

  return (
    <div className="result-card">
      <h2 className="result-title">📊 Prediction Results</h2>

      {/* ── Crop Recommendation ── */}
      <div className="result-section">
        <h3>🌱 AI Recommended Crop</h3>
        <div className="recommended-crop">
          <span className="crop-name">
            {recommendation.recommended_crop.toUpperCase()}
          </span>
          <span className="crop-confidence">
            {recommendation.confidence}% confidence
          </span>
        </div>

        <p className="result-sub">Top 3 Crop Matches</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="confidence" radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i] || "#86efac"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Yield Predictions ── */}
      <div className="result-section">
        <h3>📈 Yield Predictions</h3>

        {/* Selected crop yield */}
        {selected_yield && (
          <YieldBlock
            data={selected_yield}
            label="Your Selected Crop"
            icon="🧑‍🌾"
          />
        )}

        {/* Divider — only show if both results exist and are different crops */}
        {selected_yield && ai_yield && !sameAsCrop && (
          <div className="yield-divider">
            <span>vs</span>
          </div>
        )}

        {/* AI recommended crop yield — only show if different from selected */}
        {ai_yield && !sameAsCrop && (
          <YieldBlock
            data={ai_yield}
            label="AI Recommended Crop"
            icon="🤖"
          />
        )}

        {/* Note if both are same crop */}
        {sameAsCrop && (
          <p className="same-crop-note">
            ✅ Your selected crop matches the AI recommendation!
          </p>
        )}
      </div>

      {/* ── Tips ── */}
      <div className="result-tips">
        <p className="tips-title">💡 Tips to improve yield:</p>
        <ul>
          <li>Apply recommended N/P/K fertiliser based on soil test results</li>
          <li>Use irrigation during dry spells to maintain optimal moisture</li>
          <li>Monitor weather forecasts and adjust planting schedule accordingly</li>
          <li>Consider crop rotation to replenish soil nutrients naturally</li>
        </ul>
      </div>
    </div>
  );
}
