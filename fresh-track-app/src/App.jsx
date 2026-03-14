import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useNotificationPolling } from "./hooks/useNotificationPolling";
import { apiAxios } from "./api";
import Toast from "./components/Toast";
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
    if (view === "cook") {
      const url = new URL(window.location.href);
      if (payload?.suggestion_id) {
        url.searchParams.set("suggestion_id", payload.suggestion_id);
      } else {
        url.searchParams.delete("suggestion_id");
      }
      window.history.replaceState({}, "", url);
    }
  };

  useNotificationPolling((suggestionId) => {
    if (suggestionId) {
      handleNavigate("cook", { suggestion_id: suggestionId });
    } else {
      handleNavigate("cook");
    }
  });

  useEffect(() => {
    const handleSWMessage = (event) => {
      if (event.data?.type === "navigate" && event.data?.view === "cook") {
        handleNavigate("cook", event.data.suggestionId ? { suggestion_id: event.data.suggestionId } : null);
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleSWMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleSWMessage);
  }, []);

  const [toastMessage, setToastMessage] = useState(null);
  const [karmaAnimationTrigger, setKarmaAnimationTrigger] = useState(0);

  const handleCookClick = useCallback(() => {
    setToastMessage(
      "Generating recipe. Please check your notification one recipe suggestions are ready."
    );
    apiAxios.post("/cron/recipe-suggestions").catch(() => {
      setToastMessage("Failed to generate recipes. Please try again.");
    });
  }, []);

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
        <Navbar onLogoClick={() => setCurrentView("home")} karmaAnimationTrigger={karmaAnimationTrigger} />
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
            {currentView === "cook" && (
              <CookPage
                onNavigateHome={() => setCurrentView("home")}
                onShowToast={setToastMessage}
                onKarmaChange={() => setKarmaAnimationTrigger((t) => t + 1)}
              />
            )}
            {currentView === "pre-add" && <PreAddIngredients onNavigate={handleNavigate} data={navPayload} />}
          </div>
        </div>

        <div>
          <AddButton onClick={() => setIsModalOpen(true)} />
          <CookButton onClick={handleCookClick} />
        </div>

        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

        <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={handleAddItem} onNavigate={handleNavigate} />
      </div>
    </Router>
  );
}

export default App;
