import React from "react";
import { Plus } from "lucide-react";

const AddButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="fixed bottom-3
     left-4 w-14 h-14 flex-none self-start bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-white)] rounded-full flex items-center justify-center text-[var(--color-black)] shadow-lg shadow-[var(--color-brown)]/40 active:scale-95 transition-all border-4 border-[var(--color-white)] z-50">
      <Plus size={24} strokeWidth={3} />
    </button>
  );
};

export default AddButton;
