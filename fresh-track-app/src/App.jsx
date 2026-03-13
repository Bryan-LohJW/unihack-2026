import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WasteTrackPage from "./pages/WasteTrackPage";
import PantryPage from "./pages/PantryPage";
import PointsPage from "./pages/PointsPage";
import BottomNav from "./components/BottomNav";
import AddItemModal from "./components/AddItemModal";
import Fridge from "./components/Fridge";
import Pantry from "./components/Pantry";
import "./globals/globals.css";
import "./App.css";
import StorageCarousel from "./components/StorageCarousel";
import Navbar from "./components/Navbar";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [currentView, setCurrentView] = useState('fridge');

  const handleAddItem = (item) => {
    if (item.category === 'fridge') {
      const items = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
      items.push({ name: item.name, expiry: item.expiry });
      localStorage.setItem('fridgeItems', JSON.stringify(items));
    } else {
      const items = JSON.parse(localStorage.getItem('pantryItems') || '[]');
      items.push({ name: item.name, quantity: item.quantity });
      localStorage.setItem('pantryItems', JSON.stringify(items));
    }
    setRefresh(prev => prev + 1);
  };

  return (
    <Router>
      <div className="app pb-24">
        <Navbar />
        <nav className="hidden md:flex items-center justify-center gap-4 py-4">
          <button onClick={() => setCurrentView('home')} className="rounded-full bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-[var(--color-brown)] hover:bg-[var(--color-blue)]/80">
            Home
          </button>
          <button onClick={() => setCurrentView('waste')} className="rounded-full bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-[var(--color-brown)] hover:bg-[var(--color-blue)]/80">
            Waste Track
          </button>
          <button onClick={() => setCurrentView('pantry')} className="rounded-full bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-[var(--color-brown)] hover:bg-[var(--color-blue)]/80">
            Pantry
          </button>
          <button onClick={() => setCurrentView('points')} className="rounded-full bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-[var(--color-brown)] hover:bg-[var(--color-blue)]/80">
            Points
          </button>
        </nav>

        {currentView === 'fridge' && <div className="px-4 pt-24 pb-32"><Fridge key={refresh} /></div>}
        {currentView === 'freezer' && <div className="px-4 pt-24 pb-32"><div className="bg-[var(--color-white)] p-4 rounded-2xl"><h2 className="text-[var(--color-black)]">Freezer - Coming Soon</h2></div></div>}
        {currentView === 'pantry' && <div className="px-4 pt-24 pb-32"><Pantry key={refresh} /></div>}
        {currentView === 'status' && <div className="px-4 pt-24 pb-32"><div className="bg-[var(--color-white)] p-4 rounded-2xl"><h2 className="text-[var(--color-black)]">My Status - Coming Soon</h2></div></div>}
        {currentView === 'waste' && <WasteTrackPage />}
        {currentView === 'points' && <PointsPage />}

        <BottomNav onAddClick={() => setIsModalOpen(true)} onChange={setCurrentView} />
        <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={handleAddItem} />
      </div>
    </Router>
  );
}

export default App;
