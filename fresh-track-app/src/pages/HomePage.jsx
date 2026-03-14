import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainInventory from "../components/Fridge/MainInventory";

const HomePage = () => {
  return (
    <div className="relative w-full aspect-[3/5] shadow-2xl cursor-pointer">
      <MainInventory />
    </div>
  );
};
export default HomePage;
