import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WasteTrackPage from "./pages/WasteTrackPage";
import PantryPage from "./pages/PantryPage";
import PointsPage from "./pages/PointsPage";
import BottomNav from "./components/BottomNav";
import "./globals/globals.css";
import "./App.css";
import Navbar from "./components/Navbar";

// ✅ FIXED: Imported with a capital 'Q' so React recognizes the component tag
import QuizSheet from "./components/questionnaire"; 

function App() {
  const [showQuiz, setShowQuiz] = useState(false);

  // Debug function to check if the button is working in the console
  const handleOpenQuiz = () => {
    console.log("Magic button clicked! Opening quiz...");
    setShowQuiz(true);
  };

  return (
    <Router>
      {/* Added 'relative' and 'min-h-screen' to ensure the background covers the T440 display */}
      <div className="app pb-24 relative min-h-screen bg-white">
        <Navbar />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-4 py-4">
          <Link to="/" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Home</Link>
          <Link to="/waste" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Waste Track</Link>
          <Link to="/pantry" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Pantry</Link>
          <Link to="/points" className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Points</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/waste" element={<WasteTrackPage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/points" element={<PointsPage />} />
        </Routes>

        {/* ✅ FIXED FLOATING BUTTON:
          - bottom-28: Keeps it above the BottomNav
          - z-[9999]: Puts it on the very top layer so it's ALWAYS clickable
          - cursor-pointer: Forces the 'hand' icon on hover
        */}
        <button
          onClick={handleOpenQuiz}
          type="button"
          className="fixed bottom-28 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[9999] cursor-pointer hover:bg-indigo-700 hover:scale-110 active:scale-90 transition-all"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </button>

        {/* ✅ FIXED COMPONENT CALL: Matches the Import name above */}
        <QuizSheet 
          isOpen={showQuiz} 
          onClose={() => setShowQuiz(false)} 
          onComplete={(prefs) => {
            console.log("Quiz Results:", prefs);
            setShowQuiz(false);
          }} 
        />

        <BottomNav />
      </div>
    </Router>
  );
}

export default App;