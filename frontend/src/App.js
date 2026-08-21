import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import About from "./pages/About";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/about"   element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
