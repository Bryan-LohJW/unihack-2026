import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera as CameraIcon,
  Edit3,
  Calendar,
  Hash,
  Tag,
  UploadCloud,
  ChevronRight,
  AlertCircle,
  ScanLine,
  Aperture,
  ChevronDown,
} from "lucide-react";
import Webcam from "react-webcam";
import { apiAxios } from "../../api";

const AddItemModal = ({ isOpen, onClose, onAddItem, onNavigate }) => {
  const [mode, setMode] = useState("manual");
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    expiry: "",
    category: "fridge",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // New state for our custom category dropdown
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const webcamRef = useRef(null);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({ name: "", expiry: "" });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "fridge", label: "🧊 Fridge" },
    { value: "freezer", label: "❄️ Freezer" },
    { value: "pantry", label: "🥫 Pantry" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategorySelect = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
    setIsCategoryOpen(false);
    setFocusedField(null);
  };

  const needsExpiryDate =
    formData.category === "fridge" || formData.category === "freezer";

  const validateOnBlur = (name, value) => {
    if (name === "expiry" && !value && needsExpiryDate) {
      setErrors((prev) => ({ ...prev, expiry: "Expiry Date is required" }));
    }
    setFocusedField(null);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const computeExpiryDays = (expiryDateStr) => {
    if (!expiryDateStr) return 7;
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    return Math.max(1, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  };

  const VALID_MODES = ["manual", "camera", "upload"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!VALID_MODES.includes(mode)) {
      setSubmitError(
        `Invalid mode: "${mode}". Expected one of: ${VALID_MODES.join(", ")}.`,
      );
      return;
    }

    if (mode === "camera") {
      if (!capturedImage) return;
      // Convert base64 screenshot to a File object that PreAddIngredients expects
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      onClose();
      onNavigate("pre-add", { file });
      setCapturedImage(null);
      return;
    }
    if (mode === "upload") {
      onClose();
      onNavigate("pre-add", { file: receiptFile });
      return;
    }

    // manual mode
    if (needsExpiryDate && !formData.expiry) {
      setErrors((prev) => ({ ...prev, expiry: "Expiry Date is required" }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        name: formData.name,
        section: formData.category,
        qty: parseInt(formData.quantity, 10) || 1,
        expiry_days: computeExpiryDays(formData.expiry),
        calories: 0,
      };
      const { data } = await apiAxios.post("/inventory", payload);
      onAddItem(data);
      onClose();
      setFormData({ name: "", quantity: 1, expiry: "", category: "fridge" });
      setReceiptFile(null);
      setCapturedImage(null);
      setErrors({ name: "", expiry: "" });
      setIsCategoryOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Failed to add item";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STYLING LOGIC ---
  const getContainerClasses = (fieldName) => {
    const isError = errors[fieldName];
    const isFilled = formData[fieldName];
    const isFocused =
      focusedField === fieldName ||
      (fieldName === "category" && isCategoryOpen);

    return `
      relative flex items-center w-full bg-[var(--color-white)] rounded-xl 
      transition-all duration-200 border overflow-hidden cursor-pointer
      ${isError ? "border-red-600 focus-within:border-red-600" : ""}
      ${!isError && isFilled && !isFocused ? "border-blue-500" : ""}
      ${!isError && !isFilled && !isFocused ? "border-gray-300" : ""}
      ${!isError && isFocused ? "border-blue-500 ring-2 ring-blue-100" : ""}
    `;
  };

  const commonLabelClasses = (fieldName) => {
    const isError = errors[fieldName];
    return `
      absolute -top-3 left-4 px-1 text-xs font-bold z-10 transition-colors duration-200
      bg-[var(--color-white)] text-[var(--color-black)]
      ${isError ? "text-red-600" : ""}
    `;
  };

  const baseInputClasses =
    "w-full py-3 pr-4 bg-transparent font-medium text-[var(--color-black)] !outline-none focus:!outline-none !border-none focus:!border-none !ring-0 focus:!ring-0 !shadow-none focus:!shadow-none";

  const getSliderPosition = () => {
    if (mode === "manual") return "6px";
    if (mode === "camera") return "calc(33.33% + 4px)";
    return "calc(66.66% + 2px)";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-[var(--color-white)] rounded-3xl shadow-2xl overflow-hidden mb-4 sm:mb-0 flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 pb-4 border-b border-[var(--color-brown)]/20 shrink-0">
              <h2 className="text-2xl font-black tracking-tight text-[var(--color-black)]">
                Add Inventory
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[var(--color-black)] transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Added pb-24 here so the custom dropdown has room to open without clipping */}
            <div className="p-6 pb-24 overflow-y-auto custom-scrollbar">
              <div className="flex p-1.5 mb-6 bg-gray-100 rounded-xl relative gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-bold rounded-lg transition-all z-10 ${
                    mode === "manual"
                      ? "text-[var(--color-black)]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Edit3 size={18} className="mb-1" /> Manual
                </button>
                <button
                  type="button"
                  onClick={() => setMode("camera")}
                  className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-bold rounded-lg transition-all z-10 ${
                    mode === "camera"
                      ? "text-[var(--color-black)]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CameraIcon size={18} className="mb-1" /> Camera
                </button>
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-bold rounded-lg transition-all z-10 ${
                    mode === "upload"
                      ? "text-[var(--color-black)]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ScanLine size={18} className="mb-1" /> Upload
                </button>
                <motion.div
                  className="absolute top-1.5 bottom-1.5 w-[calc(33.33%-7px)] bg-white rounded-lg shadow-sm"
                  animate={{ left: getSliderPosition() }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {mode === "manual" && (
                    <motion.div
                      key="manual"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Name Input */}
                      <div className="relative">
                        <label
                          htmlFor="name"
                          className={commonLabelClasses("name")}
                        >
                          Item Name
                        </label>
                        <div className={getContainerClasses("name")}>
                          <div className="flex items-center pl-4 pr-3 py-3 text-gray-400">
                            <Tag
                              size={18}
                              className={
                                focusedField === "name" ? "text-blue-500" : ""
                              }
                            />
                            <span className="ml-3 text-gray-300">|</span>
                          </div>
                          <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="e.g., Organic Milk"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => validateOnBlur("name", formData.name)}
                            className={baseInputClasses}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Quantity Input */}
                        <div className="relative">
                          <label
                            htmlFor="quantity"
                            className={commonLabelClasses("quantity")}
                          >
                            Quantity
                          </label>
                          <div className={getContainerClasses("quantity")}>
                            <div className="flex items-center pl-4 pr-3 py-3 text-gray-400">
                              <Hash
                                size={18}
                                className={
                                  focusedField === "quantity"
                                    ? "text-blue-500"
                                    : ""
                                }
                              />
                              <span className="ml-2 text-gray-300">|</span>
                            </div>
                            <input
                              id="quantity"
                              type="number"
                              name="quantity"
                              min="1"
                              placeholder="1"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              onFocus={() => setFocusedField("quantity")}
                              onBlur={() => setFocusedField(null)}
                              className={baseInputClasses}
                            />
                          </div>
                        </div>

                        {/* --- CUSTOM CATEGORY DROPDOWN --- */}
                        <div className="relative">
                          <label className={commonLabelClasses("category")}>
                            Category
                          </label>
                          <div
                            className={getContainerClasses("category")}
                            onClick={() => {
                              setIsCategoryOpen(!isCategoryOpen);
                              setFocusedField("category");
                            }}
                          >
                            <div className="w-full flex items-center justify-between py-3 pl-4 pr-3 font-medium text-[var(--color-black)] select-none">
                              <span>
                                {
                                  categories.find(
                                    (c) => c.value === formData.category,
                                  )?.label
                                }
                              </span>
                              <ChevronDown
                                size={18}
                                className={`text-gray-400 transition-transform duration-300 ${isCategoryOpen ? "rotate-180 text-blue-500" : ""}`}
                              />
                            </div>
                          </div>

                          {/* The Dropdown Menu */}
                          <AnimatePresence>
                            {isCategoryOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                              >
                                {categories.map((cat) => (
                                  <div
                                    key={cat.value}
                                    onClick={() =>
                                      handleCategorySelect(cat.value)
                                    }
                                    className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors ${
                                      formData.category === cat.value
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    {cat.label}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Expiry Input */}
                      <div className="relative">
                        <label
                          htmlFor="expiry"
                          className={commonLabelClasses("expiry")}
                        >
                          Expiry Date{" "}
                          {needsExpiryDate ? "(Required)" : "(Optional)"}
                        </label>
                        <div className={getContainerClasses("expiry")}>
                          <div className="flex items-center pl-4 pr-3 py-3 text-gray-400">
                            <Calendar
                              size={18}
                              className={
                                focusedField === "expiry" ? "text-blue-500" : ""
                              }
                            />
                            <span className="ml-3 text-gray-300">|</span>
                          </div>
                          <input
                            id="expiry"
                            type="date"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField("expiry")}
                            onBlur={() =>
                              validateOnBlur("expiry", formData.expiry)
                            }
                            className={baseInputClasses}
                          />
                        </div>
                        {errors.expiry && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-bold px-1">
                            <AlertCircle size={14} />
                            {errors.expiry}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {mode === "camera" && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-inner border border-stone-200">
                        {capturedImage ? (
                          <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            playsInline
                            videoConstraints={{
                              facingMode: { exact: "environment" },
                            }}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {!capturedImage && (
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute left-0 right-0 h-0.5 bg-[var(--color-blue)] shadow-[0_0_10px_var(--color-blue)] z-10 opacity-50"
                          />
                        )}
                      </div>

                      {capturedImage ? (
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setCapturedImage(null)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                          >
                            Retake
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex items-center justify-center w-16 h-16 bg-[var(--color-blue)] text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-blue)]/40 border-4 border-white"
                        >
                          <Aperture size={28} />
                        </button>
                      )}
                      <p className="text-xs text-gray-500 font-medium">
                        Point camera at your grocery items
                      </p>
                    </motion.div>
                  )}

                  {mode === "upload" && (
                    <motion.div
                      key="upload"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="space-y-4"
                    >
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--color-blue)] bg-[var(--color-blue)]/5 hover:bg-[var(--color-blue)]/10 rounded-2xl cursor-pointer transition-colors group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-[var(--color-blue)] group-hover:scale-110 transition-transform" />
                          <p className="mb-2 text-sm font-bold text-[var(--color-black)]">
                            Select an image from gallery
                          </p>
                          <p className="text-xs text-gray-500">
                            Supported formats: JPG, PNG, WEBP
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setReceiptFile(e.target.files[0])}
                        />
                      </label>

                      {receiptFile && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-200">
                          <CameraIcon size={16} /> Image attached:{" "}
                          {receiptFile.name}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 pt-4 border-t border-gray-100">
                  {submitError && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">
                      <AlertCircle size={18} />
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-blue)] text-[var(--color-black)] rounded-xl font-black text-lg hover:shadow-lg hover:shadow-[var(--color-blue)]/30 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={
                      (mode === "camera" && !capturedImage) || isSubmitting
                    }
                  >
                    {mode === "manual" && isSubmitting
                      ? "Adding..."
                      : mode === "manual"
                        ? "Add Item Manually"
                        : mode === "camera"
                          ? "Analyze Photo"
                          : "Analyze Image"}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddItemModal;
