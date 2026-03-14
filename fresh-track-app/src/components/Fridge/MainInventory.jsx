import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Shelf from './Shelf';

const MainInventory = () => {
  const [isOpen, setIsOpen] = useState(false);

  const inventoryData = [
    { id: 1, title: "Pantry", total: 45, expiry: 2 },
    { id: 2, title: "Fridge", total: 18, expiry: 5 },
    { id: 3, title: "Freezer", total: 32, expiry: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center font-sans">
      
      {/* --- HEADER --- */}
      {/* <div className="w-full max-w-md flex items-center justify-between p-6 mt-4">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-slate-800 border border-slate-100">FT</div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FreshTrack</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">• Smart Kitchen •</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100 relative">
          <span className="text-xl">🔔</span>
          <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </div>
      </div> */}

      {/* --- 3D FRIDGE CONTAINER --- */}
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center perspective-1000">
        
        {/* STAT BOXES (Left & Right) */}
        <div className="absolute inset-0 flex flex-col justify-around py-24 px-4 z-0 pointer-events-none">
          {inventoryData.map((item) => (
            <div key={item.id} className="flex justify-between w-full">
               <StatBox label="TOTAL" value={item.total} isOpen={isOpen} side="left" />
               <StatBox label="SOON" value={item.expiry} isOpen={isOpen} side="right" color={item.expiry > 0 ? "orange" : "slate"} />
            </div>
          ))}
        </div>

        {/* FRIDGE BODY */}
        <div 
          className="relative w-64 h-[500px] cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Internal Structure */}
          <div className="absolute inset-0 bg-white rounded-[3rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] border-2 border-slate-50 flex flex-col justify-around py-12 overflow-hidden">
            {inventoryData.map((item, idx) => (
              <Shelf key={item.id} title={item.title} index={idx} isOpen={isOpen} />
            ))}
          </div>

          {/* OPENING DOOR */}
          <motion.div 
            animate={{ rotateY: isOpen ? -110 : 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center", perspective: "1500px" }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-white to-slate-100 rounded-[3rem] shadow-2xl border-l border-white flex flex-col items-end justify-center px-4"
          >
            <div className="w-1.5 h-20 bg-slate-200/60 rounded-full shadow-inner mr-2" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, isOpen, side, color = "slate" }) => (
  <motion.div
    initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
    animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: side === 'left' ? -20 : 20 }}
    className="w-16 h-16 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center border border-slate-50"
  >
    <span className="text-[7px] font-bold text-slate-400 mb-1">{label}</span>
    <span className={`text-xl font-bold ${color === 'orange' ? 'text-orange-500' : 'text-slate-700'}`}>{value}</span>
  </motion.div>
);

export default MainInventory;