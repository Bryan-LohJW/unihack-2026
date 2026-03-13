import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 grid grid-cols-3 items-center px-6 h-20 bg-black/10 backdrop-blur-md border-b border-white/5">
      {/* 1. Logo on left (Justified Start) */}
      <div className="flex justify-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-xl tracking-tighter">FT</span>
          </div>
        </div>
      </div>

      {/* 2. Title in center (Justified Center) */}
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-white font-bold text-lg leading-none">FreshTrack</h2>
        <span className="text-emerald-400 text-[10px] font-medium uppercase tracking-widest">Smart Kitchen</span>
      </div>

      {/* 3. Action Button on right (Justified End) */}
      <div className="flex justify-end">
       
      </div>
    </nav>
  );
};

export default Navbar;
