import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WasteTrackPage from "./pages/WasteTrackPage";
import PantryPage from "./pages/PantryPage";
import PointsPage from "./pages/PointsPage";
import BottomNav from "./components/BottomNav";
import "./globals/globals.css";
import "./App.css";
import StorageCarousel from "./components/StorageCarousel";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="app pb-24">
        <Navbar />
        <nav className="hidden md:flex items-center justify-center gap-4 py-4">
          <Link to="/" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Home
          </Link>
          <Link to="/waste" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Waste Track
          </Link>
          <Link to="/pantry" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Pantry
          </Link>
          <Link to="/points" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Points
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/waste" element={<WasteTrackPage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/points" element={<PointsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
