import React from 'react';
import Points from '../components/Points';

const PointsPage = () => {
  return (
    <div className="points-page px-4 pt-6 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">Points</h1>
      <div className="sections grid gap-4 md:grid-cols-1">
        <Points />
      </div>
    </div>
  );
};

export default PointsPage;
