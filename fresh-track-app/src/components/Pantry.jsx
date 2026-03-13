import React, { useState, useEffect } from "react";

const Pantry = () => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("x");
    return stored ? JSON.parse(stored) : [];
  });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem("pantryItems", JSON.stringify(items));
  }, [items]);

  // eslint-disable-next-line no-unused-vars
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { name: newItem, quantity: 1 }]);
      setNewItem("");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return <div className="pantry bg-[var(--color-white)] shadow-sm rounded-2xl p-4"></div>;
};

export default Pantry;
