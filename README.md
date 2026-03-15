# Unihack-2026
## Team - Comet

# Digital Fridge

Digital Fridge is a mobile-first PWA designed to minimize household food waste by tracking inventory via AI-powered receipt scanning and generating meal plans that prioritize expiring ingredients.

## 🌿 Minimizing Food Wastage at Home

Digital Fridge tackles food waste through three core pillars:
1.  **Low-Friction Tracking:** Users often stop tracking inventory because manual entry is tedious. We use **Gemini 1.5 Flash** to parse grocery receipts and fridge photos, instantly digitizing what you bought.
2.  **Visual Urgency:** The "Digital Fridge" uses color-coded badges (Red/Amber/Green) based on real-time expiry calculations, making it obvious what needs to be eaten *now*.
3.  **Intelligent Meal Planning:** Our recommendation engine doesn't just suggest recipes; it specifically crafts meal plans that "clear out" items expiring within 3 days, ensuring food is consumed before it hits the bin.

---

## 🏗️ How the Code Works

### Backend (Python/Flask)
- **Image Processing:** Uses the Google Gemini API to perform OCR and entity extraction on uploaded receipts. It identifies the item name, category, and estimates shelf-life.
- **Expiry Logic:** A dedicated service calculates `expiry_date` by adding category-specific shelf-life estimates to the purchase date.
- **Meal Engine:** Takes the current inventory stored in Mongo, filters for "critical" items, and prompts Gemini to generate a structured JSON meal plan.

### Frontend (React/Vite)
- **Mobile-First UI:** Built with a bottom-navigation pattern and touch-friendly components for a native app feel.
- **PWA Ready:** Configured with a manifest and service workers to be "installed" on a phone's home screen.
- **State Management:** Uses Axios for API communication, handling multi-part form data for receipt uploads and JSON for inventory management.

## 📂 Project Structure

```text
Digital Fridge/
├── backend/
│   ├── app.py              # Flask entry point
│   ├── routers/             # API route handlers
│   ├── models/              # Database models & Pydantic schemas
│   ├── services/            # AI (Gemini) & Expiry logic
│   └── .env                 # API Keys & DB Config
└── frontend/
    ├── src/
    │   ├── api/             # Axios client & endpoints
    │   ├── components/      # Reusable UI elements
    │   ├── pages/           # Main view screens
    │   └── App.jsx          # Routing & State
    ├── public/              # PWA Manifest & Icons
    └── vite.config.js       # Vite configuration
```


## 🚀 Installation and Setup

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Gemini API Key
- Upsplash API Key

### 1. Backend Setup<ctrl63># Navigate to backend directory
`cd backend`

#### Create and activate virtual environment
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install dependencies
`pip install -r requirements.txt`

#### Create .env file and add your keys
```
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "MONGO_URI=sqlite:///./Digital Fridge.db" >> .env
```

#### Start the server
`py app.py`


### 2. Frontend Setup

#### Navigate to frontend directory
`cd frontend`

#### Install dependencies
`npm install`

#### Create .env file
`echo "VITE_SERVER_URL=http://localhost:5001" > .env`

#### Start development server
`npm run dev`


---

## 📱 Key Features Demo
1.  **Scan Receipt:** Take a photo of your grocery receipt. The AI extracts items and sets initial expiry dates.
2.  **Manage Fridge:** View items sorted by "Days Left". Click to delete or tap to edit quantities.
3.  **Generate Plan:** Click "Meal Plan" to get a 3-day schedule that uses up your wilting spinach and near-expiry chicken first.

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:**  Python / Flask
- **AI:** Google Gemini 1.5 Flash (Vision & Text)
- **Database:** MongoDB

---

## 🔮 Future Work

### 1. Input Enhancements
- **Multi-Modal Scanning:** Support for 3D fridge scanning using phone cameras to estimate volume and quantity of loose produce.
- **Voice-Activated Logging:** Integration with Siri/Google Assistant for hands-free inventory updates while cooking ("Hey, I just used two eggs").


### 2. Intelligent Monitoring
- **Dynamic Expiry AI:** Adjust shelf-life estimates based on local weather data (e.g., humidity/heat) and user-specific storage habits.
- **Smart Shopping Lists:** Automatically generate a "Gap List" by comparing the generated meal plan requirements against current inventory.
- **Budget Planning.** - Automatically tracks the budget and costs for your groceries to help cut down on unwanted spending and food waste.
- **IoT Tracking:** Monitor the produce and products at home using smart fridges or cameras to keep the inventory upto date.

### 3. Output & Engagement
- **Personalised meal plans:** Generate a more personalised meal plan as per the users dietry requriements and life goals.
- **Advanced Analytics:** Detailed carbon footprint reporting and "Money Saved" gamification to incentivize long-term waste reduction.
