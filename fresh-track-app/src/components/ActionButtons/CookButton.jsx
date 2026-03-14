import React from "react";
import { ChefHat } from "lucide-react";

const CookButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-white)] rounded-full flex items-center justify-center text-[var(--color-black)] shadow-lg shadow-[var(--color-brown)]/40 active:scale-90 transition-transform border-4 border-[var(--color-white)] z-50"
    >
      <ChefHat size={24} strokeWidth={3} />
    </button>
  );
};

export default CookButton;
