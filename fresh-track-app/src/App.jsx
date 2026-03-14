import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WasteTrackPage from "./pages/WasteTrackPage";
import PantryPage from "./pages/PantryPage";
import PointsPage from "./pages/PointsPage";
import BottomNav from "./components/navigations/BottomNav";
import AddItemModal from "./components/Modals/AddItemModal";
import Fridge from "./components/Fridge";
import Pantry from "./components/Pantry";
import "./globals/globals.css";
import "./App.css";
import StorageCarousel from "./components/StorageCarousel";
import Navbar from "./components/navigations/Navbar";
import AddButton from "./components/ActionButtons/AddButton";
import CookButton from "./components/ActionButtons/CookButton";
import HomePage from "./pages/HomePage";
import CookPage from "./pages/CookPage";
import PreAddIngredients from "./pages/PreAddIngredients";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [currentView, setCurrentView] = useState("home");
  const [navPayload, setNavPayload] = useState(null);

  const handleNavigate = (view, payload = null) => {
    setNavPayload(payload);
    setCurrentView(view);
  };

  const handleAddItem = (item) => {
    if (item.category === "fridge") {
      const items = JSON.parse(localStorage.getItem("fridgeItems") || "[]");
      items.push({ name: item.name, expiry: item.expiry });
      localStorage.setItem("fridgeItems", JSON.stringify(items));
    } else {
      const items = JSON.parse(localStorage.getItem("pantryItems") || "[]");
      items.push({ name: item.name, quantity: item.quantity });
      localStorage.setItem("pantryItems", JSON.stringify(items));
    }
    setRefresh((prev) => prev + 1);
  };

  return (
    <Router>
      <div className="min-w-[375px] h-screen flex flex-col">
        <Navbar onLogoClick={() => setCurrentView("home")} />
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-scroll pt-19">
          <div className="h-full">
            {currentView === "home" && <HomePage key={refresh} />}
            {currentView === "freezer" && <div>Freezer - Coming Soon</div>}
            {currentView === "pantry" && <Pantry key={refresh} />}
            {currentView === "status" && <div>My Status - Coming Soon</div>}
            {currentView === "waste" && <WasteTrackPage />}
            {currentView === "points" && <PointsPage />}
            {currentView === "search" && <div>Search - Coming Soon</div>}
            {currentView === "cook" && <CookPage />}
            {currentView === "pre-add" && <PreAddIngredients onNavigate={handleNavigate} data={navPayload} />}
          </div>
        </div>

        <div>
          <AddButton onClick={() => setIsModalOpen(true)} />
          <CookButton onClick={() => setCurrentView("cook")} />
        </div>

        <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={handleAddItem} onNavigate={handleNavigate} />
      </div>
    </Router>
  );
}

export default App;
