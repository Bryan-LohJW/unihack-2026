// ─── SVG Icons (Lucide-style) ─────────────────────────────────────────────────
const ICONS = {
  goal: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  diet: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20"/><path d="M12 2v20"/><path d="M2 12h10"/>
      <path d="M7 4.3A10 10 0 0 0 2 12"/><path d="M7 19.7A10 10 0 0 1 2 12"/>
    </svg>
  ),
  activity: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  people: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  cookTime: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  cuisine: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  meals: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  bio: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20"/><path d="M5 20V8l7-6 7 6v12"/>
      <path d="M9 20v-6h6v6"/>
    </svg>
  ),
  sex: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4v6"/><path d="M20 4h-6"/><path d="M14.5 9.5 20 4"/>
      <circle cx="9" cy="15" r="5"/>
      <path d="M9 10v-2"/><path d="M6.88 17.12 4 20"/>
    </svg>
  ),
  mode: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
};

// QuizSheet.jsx
// Full 9-question onboarding quiz — triggered when user taps "Generate" on meal plan screen.
// Add this font to your index.html:
// <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet" />
//
// Usage:
//   import QuizSheet from './components/QuizSheet'
//   <QuizSheet isOpen={showQuiz} onClose={() => setShowQuiz(false)} onComplete={(prefs) => generateMealPlan(prefs)} />

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "goal",
    type: "choice",
    emoji: "goal",
    label: "question 1 of 9",
    text: "What's your main goal?",
    options: ["Lose weight", "Build muscle", "Eat healthier", "Maintain weight"],
  },
  {
    id: "diet",
    type: "choice",
    emoji: "diet",
    label: "question 2 of 9",
    text: "Any dietary requirements?",
    options: ["None", "Vegetarian", "Vegan", "Halal / Gluten-free"],
  },
  {
    id: "activity",
    type: "choice",
    emoji: "activity",
    label: "question 3 of 9",
    text: "How active are you?",
    options: ["Mostly sitting", "Light movement", "Regularly active", "Very active"],
  },
  {
    id: "people",
    type: "choice",
    emoji: "people",
    label: "question 4 of 9",
    text: "How many people are you cooking for?",
    options: ["Just me", "2 people", "3–4 people", "5+"],
  },
  {
    id: "cookTime",
    type: "choice",
    emoji: "cookTime",
    label: "question 5 of 9",
    text: "How long are you willing to cook?",
    options: ["Under 15 min", "Around 30 min", "Up to an hour", "No limit"],
  },
  {
    id: "cuisine",
    type: "choice",
    emoji: "cuisine",
    label: "question 6 of 9",
    text: "Any cuisine preference?",
    options: ["Asian", "Mediterranean", "Western", "No preference"],
  },
  {
    id: "meals",
    type: "choice",
    emoji: "meals",
    label: "question 7 of 10",
    text: "How many meals a day?",
    options: ["2 meals", "3 meals", "3 meals + snacks", "5 small meals"],
  },
  {
    id: "mode",
    type: "mode",
    emoji: "mode",
    label: "question 8 of 10",
    text: "How do you want your meals built?",
    options: [
      {
        title: "Fridge only",
        sub: "Use exactly what I have, nothing else",
        value: "available_only",
        icon: "list",
      },
      {
        title: "Mostly fridge",
        sub: "Fine to grab 1–2 extra items if needed",
        value: "mostly_fridge",
        icon: "cart",
      },
      {
        title: "Best meal possible",
        sub: "Suggest anything, I'll shop what's missing",
        value: "allow_buying",
        icon: "star",
      },
    ],
  },
  {
    id: "bio",
    type: "bio",
    emoji: "bio",
    label: "question 9 of 10",
    text: "Tell us about yourself",
    sub: "Used to calculate your personal calorie target — never stored or shared.",
  },
  {
    id: "sex",
    type: "sex",
    emoji: "sex",
    label: "question 10 of 10",
    text: "Biological sex",
    sub: "Affects your base metabolic rate calculation.",
    options: [
      { icon: "♂️", title: "Male", sub: "Higher avg BMR" },
      { icon: "♀️", title: "Female", sub: "Lower avg BMR" },
      { icon: "◻️", title: "Prefer not to say", sub: "We'll use an average" },
    ],
  },
];

// ─── TDEE helpers ─────────────────────────────────────────────────────────────

const ACTIVITY_MULT = {
  "Mostly sitting": 1.2,
  "Light movement": 1.375,
  "Regularly active": 1.55,
  "Very active": 1.725,
};

const GOAL_ADJ = {
  "Lose weight": -300,
  "Build muscle": 250,
  "Eat healthier": 0,
  "Maintain weight": 0,
};

function calcTDEE({ age, height, weight, sex, activity, goal }) {
  const a = parseFloat(age), h = parseFloat(height), w = parseFloat(weight);
  if (!a || !h || !w) return null;
  const bmr =
    sex === "Female"
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;
  const mult = ACTIVITY_MULT[activity] || 1.375;
  const adj = GOAL_ADJ[goal] || 0;
  return Math.round(bmr * mult + adj);
}

function calcMacros(tdee, goal) {
  if (!tdee) return null;
  if (goal === "Build muscle")
    return {
      protein: Math.round((tdee * 0.35) / 4),
      carbs: Math.round((tdee * 0.4) / 4),
      fat: Math.round((tdee * 0.25) / 9),
    };
  if (goal === "Lose weight")
    return {
      protein: Math.round((tdee * 0.4) / 4),
      carbs: Math.round((tdee * 0.3) / 4),
      fat: Math.round((tdee * 0.3) / 9),
    };
  return {
    protein: Math.round((tdee * 0.3) / 4),
    carbs: Math.round((tdee * 0.45) / 4),
    fat: Math.round((tdee * 0.25) / 9),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopBar({ current, total, onBack }) {
  const isFirst = current === 0;
  const CIRC = 100.53;
  const progress = ((current + 1) / total) * CIRC;
  const offset = CIRC - progress;

  // Equal-width side slots keep the ring perfectly centred
  const sideStyle = { width: 36, display: "flex", alignItems: "center" };

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 20px 0" }}>
      {/* Left side — back / close */}
      <div style={sideStyle}>
        <button
          onClick={onBack}
          aria-label={isFirst ? "Close" : "Back"}
          style={{
            width: 34, height: 34,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isFirst ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          )}
        </button>
      </div>

      {/* Centre — progress ring */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="42" height="42" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
            <circle
              cx="21" cy="21" r="17"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <span style={{ position: "relative", zIndex: 1, fontFamily: "'Chakra Petch', sans-serif", fontSize: 13, fontWeight: 600, color: "white", letterSpacing: "0.06em" }}>
            {String(current + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Right side — empty spacer to balance left */}
      <div style={{ ...sideStyle, justifyContent: "flex-end" }} />
    </div>
  );
}


// ─── Mode option icons ────────────────────────────────────────────────────────
const MODE_ICONS = {
  list: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
    </svg>
  ),
  cart: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  star: (color) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
};

function AnswerButton({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl font-bold text-base relative flex items-center justify-center border-none cursor-pointer active:scale-95"
      style={{
        padding: "14px 20px",
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-0.1px",
        transition: "transform 0.12s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.12s",
        ...(selected
          ? {
              background: "linear-gradient(135deg, #F5C518 0%, #E8B010 100%)",
              color: "white",
              boxShadow: "0 4px 18px rgba(245,197,24,0.45)",
              transform: "scale(1.03)",
            }
          : {
              background: "white",
              color: "#1A5FE8",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }),
      }}
    >
      {label}
      {selected && (
        <span
          className="absolute right-4 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white"
          style={{ background: "rgba(255,255,255,0.3)", fontSize: 11 }}
        >
          ✓
        </span>
      )}
    </button>
  );
}


function ModeButton({ opt, selected, onClick }) {
  const iconColor = selected ? "white" : "#1148c8";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 18px",
        borderRadius: 18,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        position: "relative",
        textAlign: "left",
        fontFamily: "'Barlow Semi Condensed', sans-serif",
        transition: "transform 0.18s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.15s",
        ...(selected
          ? {
              background: "linear-gradient(135deg, #FFD118 0%, #EFAA00 100%)",
              boxShadow: "0 6px 22px rgba(239,170,0,0.5)",
              transform: "scale(1.025)",
            }
          : {
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }),
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          background: selected ? "rgba(255,255,255,0.2)" : "rgba(17,72,200,0.08)",
        }}
      >
        {MODE_ICONS[opt.icon](iconColor)}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.2, color: selected ? "white" : "#1148c8" }}>
          {opt.title}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: selected ? "rgba(255,255,255,0.7)" : "rgba(17,72,200,0.5)" }}>
          {opt.sub}
        </span>
      </div>

      {/* Check */}
      {selected && (
        <span
          style={{
            position: "absolute", right: 14,
            width: 22, height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      )}
    </button>
  );
}

function SexButton({ opt, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl flex items-center gap-4 border-none cursor-pointer active:scale-95"
      style={{
        padding: "14px 18px",
        fontFamily: "'Chakra Petch', sans-serif",
        transition: "transform 0.12s cubic-bezier(0.34,1.2,0.64,1)",
        ...(selected
          ? {
              background: "linear-gradient(135deg, #F5C518 0%, #E8B010 100%)",
              boxShadow: "0 4px 18px rgba(245,197,24,0.45)",
              transform: "scale(1.03)",
            }
          : {
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }),
      }}
    >
      <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>{opt.icon}</span>
      <span className="flex flex-col items-start gap-0.5">
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: selected ? "white" : "#1a1a2e",
          }}
        >
          {opt.title}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: selected ? "rgba(255,255,255,0.7)" : "#888",
          }}
        >
          {opt.sub}
        </span>
      </span>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function QuizSheet({ isOpen = true, onClose = () => {}, onComplete = () => {} }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bio, setBio] = useState({ age: "", height: "", weight: "" });
  const [done, setDone] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!isOpen) return null;

  const q = QUESTIONS[current];
  const totalQ = QUESTIONS.length;

  // Animate transition then advance
  function advance() {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      if (current < totalQ - 1) {
        setCurrent((c) => c + 1);
      } else {
        setDone(true);
      }
      setAnimating(false);
    }, 180);
  }

  function selectChoice(val) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
    advance();
  }

  function goBack() {
    if (current === 0) {
      onClose();
      return;
    }
    setCurrent((c) => c - 1);
    setDone(false);
  }

  function updateBio(field, val) {
    setBio((prev) => ({ ...prev, [field]: val }));
  }

  const bioReady = bio.age && bio.height && bio.weight;

  const tdee = calcTDEE({
    age: bio.age,
    height: bio.height,
    weight: bio.weight,
    sex: answers.sex || "Male",
    activity: answers.activity || "Regularly active",
    goal: answers.goal || "Maintain weight",
  });

  const macros = calcMacros(tdee, answers.goal);

  function handleComplete() {
    const prefs = {
      goal: answers.goal,
      mode: answers.mode,
      diet: answers.diet,
      activity: answers.activity,
      people: answers.people,
      cookTime: answers.cookTime,
      cuisine: answers.cuisine,
      meals: answers.meals,
      age: bio.age,
      height: bio.height,
      weight: bio.weight,
      sex: answers.sex,
      tdee,
      macros,
    };
    onComplete(prefs);
    // Reset for next time
    setCurrent(0);
    setAnswers({});
    setBio({ age: "", height: "", weight: "" });
    setDone(false);
  }

  // ── Shared card style ──
  const cardStyle = {
    background: "linear-gradient(168deg, #4ea8ff 0%, #1a6ef5 48%, #1148c8 100%)",
    boxShadow: "0 40px 96px rgba(17,72,200,0.6), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)",
    fontFamily: "'Chakra Petch', sans-serif",
  };

  // ── Done screen ──
  if (done) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      >
        <div className="w-72 rounded-3xl overflow-hidden flex flex-col" style={cardStyle}>
          <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-4 text-center">
            <span style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}>
              🍽️
            </span>
            <div>
              <h2 className="text-white font-extrabold" style={{ fontSize: 22 }}>
                You're all set!
              </h2>
              <p
                className="mt-1"
                style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}
              >
                Here's your personalised nutrition target based on your answers.
              </p>
            </div>

            {/* Macro stats */}
            {macros && tdee && (
              <div className="grid grid-cols-4 gap-2 w-full">
                {[
                  { val: tdee, label: "kcal" },
                  { val: macros.protein + "g", label: "protein" },
                  { val: macros.carbs + "g", label: "carbs" },
                  { val: macros.fat + "g", label: "fat" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="rounded-xl py-2.5 flex flex-col items-center gap-0.5"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <span
                      className="text-white font-extrabold"
                      style={{ fontSize: label === "kcal" ? 13 : 15 }}
                    >
                      {val}
                    </span>
                    <span
                      className="font-semibold uppercase tracking-widest"
                      style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.5)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Answer tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Object.values(answers)
                .filter((a) => typeof a === "string")
                .map((a) => (
                  <span
                    key={a}
                    className="rounded-full font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 10,
                      padding: "3px 10px",
                    }}
                  >
                    {a}
                  </span>
                ))}
            </div>

            {/* Generate button */}
            <button
              onClick={handleComplete}
              className="w-full rounded-2xl font-extrabold border-none cursor-pointer active:scale-95"
              style={{
                padding: "15px",
                background: "linear-gradient(135deg, #F5C518 0%, #E8B010 100%)",
                color: "white",
                fontSize: 15,
                fontFamily: "'Chakra Petch', sans-serif",
                boxShadow: "0 4px 18px rgba(245,197,24,0.4)",
                transition: "transform 0.12s",
              }}
            >
              Generate My Plan →
            </button>

            <button
              onClick={goBack}
              className="font-semibold border-none cursor-pointer bg-transparent"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-72 rounded-3xl overflow-hidden flex flex-col"
        style={{
          ...cardStyle,
          opacity: animating ? 0 : 1,
          transform: animating ? "translateX(-12px)" : "translateX(0)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        <TopBar current={current} total={totalQ} onBack={goBack} />

        {/* Illustration */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0 20px" }}
        >
          <div
            style={{
              width: 110, height: 110,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.13)",
              border: "1.5px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {ICONS[q.emoji]}
          </div>
        </div>

        {/* Label + Question */}
        <div style={{ padding: "0 24px 16px", textAlign: q.type === "bio" ? "center" : "left" }}>
          <p style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>
            {q.label}
          </p>
          <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: q.type === "bio" ? 24 : 22, fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-0.4px", marginBottom: q.sub ? 8 : 0 }}>
            {q.text}
          </h2>
          {q.sub && (
            <p style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, maxWidth: q.type === "bio" ? 240 : "none", margin: q.type === "bio" ? "0 auto" : "0" }}>
              {q.sub}
            </p>
          )}
        </div>

        {/* ── CHOICE ── */}
        {q.type === "choice" && (
          <div className="flex flex-col gap-2.5 pb-6" style={{ padding: "0 14px 22px" }}>
            {q.options.map((opt) => (
              <AnswerButton
                key={opt}
                label={opt}
                selected={answers[q.id] === opt}
                onClick={() => selectChoice(opt)}
              />
            ))}
          </div>
        )}

        {/* ── BIO ── */}
        {q.type === "bio" && (
          <div style={{ padding: "0 16px 22px" }} className="flex flex-col gap-3">

            {/* ── Form card: each field separated by a divider, not gap ── */}
            <div
              style={{
                background: "rgba(255,255,255,0.11)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 22,
                overflow: "hidden",
              }}
            >
              {/* Age field */}
              <div style={{ padding: "14px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 8,
                  }}
                >
                  Age
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "white",
                    borderRadius: 14,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="number"
                    placeholder="25"
                    min="10"
                    max="99"
                    value={bio.age}
                    onChange={(e) => updateBio("age", e.target.value)}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: "'Chakra Petch', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#1250cc",
                      padding: "12px 6px 12px 18px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#9ab4d8",
                      padding: "0 18px 0 4px",
                    }}
                  >
                    years
                  </span>
                </div>
              </div>

              {/* Height + Weight side by side */}
              <div style={{ display: "flex", padding: "14px 18px 14px", gap: 12 }}>
                {[
                  { field: "height", label: "Height", placeholder: "170", unit: "cm" },
                  { field: "weight", label: "Weight", placeholder: "70",  unit: "kg" },
                ].map(({ field, label, placeholder, unit }) => (
                  <div key={field} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "white",
                        borderRadius: 14,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="number"
                        placeholder={placeholder}
                        value={bio[field]}
                        onChange={(e) => updateBio(field, e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: "'Chakra Petch', sans-serif",
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#1250cc",
                          padding: "12px 4px 12px 14px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#9ab4d8",
                          padding: "0 12px 0 2px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TDEE chip — animates in when all fields filled */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 16,
                padding: "12px 18px",
                opacity: bioReady && tdee ? 1 : 0,
                transform: bioReady && tdee ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                Your daily target
              </span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>
                  {tdee ?? "—"}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
                  kcal
                </span>
              </span>
            </div>

            {/* Continue button */}
            <button
              onClick={() => {
                if (!bioReady) return;
                setAnswers((prev) => ({ ...prev, bio }));
                advance();
              }}
              disabled={!bioReady}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 18,
                border: "none",
                fontFamily: "'Chakra Petch', sans-serif",
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.02em",
                cursor: bioReady ? "pointer" : "not-allowed",
                transition: "all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1)",
                ...(bioReady
                  ? {
                      background: "linear-gradient(135deg, #FFD018 0%, #F0A800 100%)",
                      color: "white",
                      boxShadow: "0 6px 24px rgba(240,168,0,0.45)",
                    }
                  : {
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.3)",
                    }),
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── MODE ── */}
        {q.type === "mode" && (
          <div style={{ padding: "0 16px 26px", display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt) => (
              <ModeButton
                key={opt.value}
                opt={opt}
                selected={answers[q.id] === opt.value}
                onClick={() => selectChoice(opt.value)}
              />
            ))}
          </div>
        )}

        {/* ── SEX ── */}
        {q.type === "sex" && (
          <div className="flex flex-col gap-2.5 pb-6" style={{ padding: "0 14px 22px" }}>
            {q.options.map((opt) => (
              <SexButton
                key={opt.title}
                opt={opt}
                selected={answers[q.id] === opt.title}
                onClick={() => selectChoice(opt.title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}