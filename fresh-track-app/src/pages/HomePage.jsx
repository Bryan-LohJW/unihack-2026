import React from 'react';
import Fridge from '../components/Fridge';
import Pantry from '../components/Pantry';

const HomePage = () => {
  return (
    <div className="home-page px-4 pt-24 pb-32 md:pb-12">
      <h1 className="text-3xl font-semibold text-[var(--color-black)] mb-4">FreshTrack</h1>
      <div className="sections grid gap-4 md:grid-cols-2">
        <Fridge />
        <Pantry />
      </div>
    </div>
  );
};

export default HomePage;