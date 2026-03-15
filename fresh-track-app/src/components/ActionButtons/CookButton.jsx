import React from "react";
import { ChefHat } from "lucide-react";

const CookButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-3 right-4 w-14 h-14 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-surface,#fff)] rounded-full flex items-center justify-center text-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20 active:scale-90 transition-transform border-4 border-[var(--color-surface,#fff)] z-50"
    >
      <ChefHat size={24} strokeWidth={3} />
    </button>
  );
};

export default CookButton;
