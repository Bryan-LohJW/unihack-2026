import React from "react";
import { Bell, User } from "lucide-react";

const Navbar = ({ onLogoClick }) => {
  return (
    <nav className="fixed top-0 inset-x-0 z-[100] grid grid-cols-3 items-center px-6 h-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-brown)]/10 shadow-md shadow-black/5">
      {/* 1. Logo Section */}
      <div onClick={onLogoClick} className="flex justify-start items-center group cursor-pointer">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-blue)] to-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <span className="text-[var(--color-black)] font-black text-xl tracking-tighter">FT</span>
          </div>
        </div>
      </div>

      {/* 2. Branding Center */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-[var(--color-black)] font-extrabold text-xl tracking-tight leading-tight">
          Fresh<span className="text-[var(--color-black)]">Track</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-[var(--color-brown)]/40 rounded-full"></span>
          <span className="text-[var(--color-brown)] text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">Smart Kitchen</span>
          <span className="w-1 h-1 bg-[var(--color-brown)]/40 rounded-full"></span>
        </div>
      </div>

      {/* 3. Actions End */}
      <div className="flex justify-end items-center gap-4">
        {/* Simple Notification Dot */}
        <button className="relative p-2 text-[var(--color-brown)] hover:bg-[var(--color-blue)]/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
