import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 grid grid-cols-3 items-center px-6 h-20 bg-[var(--color-white)] border-b border-[var(--color-brown)]/20">
      {/* 1. Logo on left (Justified Start) */}
      <div className="flex justify-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-white)] flex items-center justify-center shadow-lg shadow-[var(--color-brown)]/20">
            <span className="text-[var(--color-black)] font-black text-xl tracking-tighter">FT</span>
          </div>
        </div>
      </div>

      {/* 2. Title in center (Justified Center) */}
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-[var(--color-black)] font-bold text-lg leading-none">FreshTrack</h2>
        <span className="text-[var(--color-brown)] text-[10px] font-medium uppercase tracking-widest">Smart Kitchen</span>
      </div>

      {/* 3. Action Button on right (Justified End) */}
      <div className="flex justify-end">
       
      </div>
    </nav>
  );
};

export default Navbar;
