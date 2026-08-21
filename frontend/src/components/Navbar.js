// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const links = [
    { path: "/",         label: "Dashboard" },
    { path: "/predict",  label: "Predict" },
    { path: "/about",    label: "About" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🌾</span>
        <span className="brand-text">CropYield AI</span>
      </div>
      <ul className="navbar-links">
        {links.map(({ path, label }) => (
          <li key={path}>
            <Link
              to={path}
              className={location.pathname === path ? "active" : ""}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
