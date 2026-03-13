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
    <div className="points bg-[var(--color-white)] shadow-sm rounded-2xl p-4">
      <h2 className="text-xl font-semibold text-[var(--color-black)] mb-3">Points</h2>
      <p className="text-sm text-[var(--color-black)] mb-4">Total Points: <span className="font-semibold text-[var(--color-brown)]">{points}</span></p>
      <button
        className="rounded-lg bg-[var(--color-brown)] px-4 py-2 text-[var(--color-white)] hover:bg-[var(--color-brown)]/80"
        onClick={earnPoints}
      >
        Earn Points
      </button>
    </div>
  );
};

export default Points;