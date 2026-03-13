import React from 'react';
import Pantry from '../components/Pantry';

const PantryPage = () => {
  return (
    <div className="pantry-page px-4 pt-6 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-slate-900 mb-4">Pantry</h1>
      <div className="sections grid gap-4 md:grid-cols-1">
        <Pantry />
      </div>
    </div>
  );
};

export default PantryPage;
