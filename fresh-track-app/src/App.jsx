import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WasteTrackPage from "./pages/WasteTrackPage";
import PantryPage from "./pages/PantryPage";
import PointsPage from "./pages/PointsPage";
import BottomNav from "./components/BottomNav";
import AddItemModal from "./components/AddItemModal";
import Fridge from "./components/Fridge";
import FridgeInventory from "./components/FridgeInventory";
import Pantry from "./components/Pantry";
import "./globals/globals.css";
import "./App.css";
import StorageCarousel from "./components/StorageCarousel";
import Navbar from "./components/Navbar";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [currentView, setCurrentView] = useState("fridge");

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
        <Navbar />
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-scroll pt-19">
          <div className="h-full">
            {currentView === "fridge" && <FridgeInventory key={refresh} />}
            {currentView === "freezer" && <div>Freezer - Coming Soon</div>}
            {currentView === "pantry" && <Pantry key={refresh} />}
            {currentView === "status" && <div>My Status - Coming Soon</div>}
            {currentView === "waste" && <WasteTrackPage />}
            {currentView === "points" && <PointsPage />}
            {currentView === "search" && <div>Search - Coming Soon</div>}
            {currentView === "recipes" && <div>Recipes - Coming Soon</div>}
          </div>
        </div>

        <BottomNav onAddClick={() => setIsModalOpen(true)} onChange={setCurrentView} />
        <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={handleAddItem} />
      </div>
    </Router>
  );
}

export default App;
