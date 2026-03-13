import React from 'react';
import WasteTracker from '../components/WasteTracker';
import Points from '../components/Points';

const WasteTrackPage = () => {
  return (
    <div className="waste-track-page px-4 pt-6 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">Waste Tracking & Points</h1>
      <div className="sections grid gap-4 md:grid-cols-2">
        <WasteTracker />
        <Points />
      </div>
    </div>
  );
};

export default WasteTrackPage;