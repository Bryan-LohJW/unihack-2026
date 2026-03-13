import React, { useState, useEffect } from 'react';

const Points = () => {
  const [points, setPoints] = useState(() => {
    const stored = localStorage.getItem('userPoints');
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('userPoints', points.toString());
  }, [points]);

  const earnPoints = () => {
    setPoints(points + 10); // Earn 10 points for some action, e.g., logging waste avoidance
  };

  return (
    <div className="points bg-white shadow-sm rounded-2xl p-4">
      <h2 className="text-xl font-semibold text-slate-900 mb-3">Points</h2>
      <p className="text-sm text-slate-700 mb-4">Total Points: <span className="font-semibold text-indigo-600">{points}</span></p>
      <button
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        onClick={earnPoints}
      >
        Earn Points
      </button>
    </div>
  );
};

export default Points;