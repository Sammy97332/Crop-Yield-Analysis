// src/pages/About.js
import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About This Project</h1>
        <p>Final Year Project — Industrial Software Engineering</p>
      </div>

      <div className="about-grid">
        {/* Project Info */}
        <div className="about-card">
          <h2>📋 Project Overview</h2>
          <p>
            The <strong>Crop Yield Analysis System</strong> is an AI-powered web
            application that predicts crop yields and recommends the most suitable
            crop for a given set of soil and weather conditions.
          </p>
          <p>
            It targets smallholder farmers, agricultural extension officers, and
            policymakers across West Africa, enabling data-driven planting decisions
            to improve food security and agricultural productivity.
          </p>
        </div>

        {/* Student Info */}
        <div className="about-card">
          <h2>🎓 Student Details</h2>
          <table className="info-table">
            <tbody>
              <tr><td>Name</td><td>Nkrumah Samuel Kojo</td></tr>
              <tr><td>Student ID</td><td>PUIS/23210007</td></tr>
              <tr><td>Programme</td><td>Industrial Software Engineering</td></tr>
              <tr><td>Institution</td><td>Pentecost University, Kojokrom</td></tr>
              <tr><td>Supervisor</td><td>Dr. Michael A. Nartey</td></tr>
              <tr><td>Academic Year</td><td>2024/2025</td></tr>
            </tbody>
          </table>
        </div>

        {/* Tech Stack */}
        <div className="about-card">
          <h2>🛠️ Technology Stack</h2>
          <div className="tech-grid">
            {[
              { cat: "Frontend",   items: ["React.js", "Recharts", "React Router"] },
              { cat: "Backend",    items: ["Python", "Flask", "Flask-CORS"] },
              { cat: "ML Models",  items: ["scikit-learn", "XGBoost", "Random Forest"] },
              { cat: "Database",   items: ["PostgreSQL"] },
              { cat: "Data",       items: ["Kaggle Dataset", "Synthetic Yield Data"] },
              { cat: "APIs",       items: ["OpenWeatherMap API"] },
            ].map(({ cat, items }) => (
              <div className="tech-group" key={cat}>
                <p className="tech-cat">{cat}</p>
                {items.map(i => <span className="tech-badge" key={i}>{i}</span>)}
              </div>
            ))}
          </div>
        </div>

        {/* ML Models */}
        <div className="about-card">
          <h2>🤖 ML Model Performance</h2>
          <div className="model-results">
            <div className="model-block">
              <p className="model-name">Model A — Crop Recommendation</p>
              <p className="model-algo">Random Forest Classifier</p>
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-val">99.55%</span>
                  <span className="metric-lbl">Test Accuracy</span>
                </div>
                <div className="metric">
                  <span className="metric-val">99.45%</span>
                  <span className="metric-lbl">5-Fold CV</span>
                </div>
                <div className="metric">
                  <span className="metric-val">22</span>
                  <span className="metric-lbl">Crop Classes</span>
                </div>
              </div>
            </div>
            <div className="model-block">
              <p className="model-name">Model B — Yield Prediction</p>
              <p className="model-algo">XGBoost Regressor (best of 3)</p>
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-val">0.975</span>
                  <span className="metric-lbl">R² Score</span>
                </div>
                <div className="metric">
                  <span className="metric-val">0.170</span>
                  <span className="metric-lbl">MAE (t/ha)</span>
                </div>
                <div className="metric">
                  <span className="metric-val">0.266</span>
                  <span className="metric-lbl">RMSE (t/ha)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="about-card full-width">
          <h2>🎯 Project Objectives</h2>
          <ol className="objectives-list">
            <li>Collect and preprocess agricultural datasets for crop yield and soil/weather parameters.</li>
            <li>Train and compare ML models (Linear Regression, Random Forest, XGBoost) for yield prediction.</li>
            <li>Integrate the OpenWeatherMap API for real-time weather data retrieval.</li>
            <li>Build a user-friendly React dashboard for data input, visualisation, and recommendations.</li>
            <li>Evaluate model performance using MAE, RMSE, and R² metrics.</li>
            <li>Deploy the system to a cloud platform for public accessibility.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
