import React, { useState, useEffect } from "react";

const Fridge = () => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("fridgeItems");
    return stored ? JSON.parse(stored) : [];
  });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem("fridgeItems", JSON.stringify(items));
  }, [items]);

  // eslint-disable-next-line no-unused-vars
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { name: newItem, expiry: new Date().toISOString().split("T")[0] }]);
      setNewItem("");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return <div className="fridge bg-white shadow-sm rounded-2xl p-4"></div>;
};

export default Fridge;
