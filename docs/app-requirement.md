# D-Larder — Product Requirements

> Living document. Built progressively with the team.

---

## Table of Contents

1. [Front Page — Inventory Screen](#1-front-page--inventory-screen)
2. [Recipe Generation](#2-recipe-generation)
3. [Adding Ingredients](#3-adding-ingredients)
4. [Status Page](#4-status-page)
5. [API Endpoints](#5-api-endpoints)
6. [AI Model Usage](#6-ai-model-usage)
7. [Assets](#7-assets)

---

## 1. Front Page — Inventory Screen

### Overview

The inventory screen is the home screen of D-Larder. It opens with a fridge/pantry door animation that the user taps to enter. Behind the door, instead of an immediate ingredient grid, the user sees the three storage sections displayed as visual placeholders — Fridge, Pantry, and Freezer. Tapping a section opens a popup grid of the ingredients stored there. The design is intentionally gamified, feeling more like an interactive space than a traditional list-based app.

---

### 1.1 Fridge Door Entry Animation

- On first load, user sees a closed fridge/pantry door centred on screen
- Tapping the door triggers it to swing open, revealing the interior behind it
- The door swings on its left edge hinge, like a real fridge door
- As the door opens, a soft glow spreads from the interior outward
- A blurred preview of the interior is visible behind the door as it swings — the content is already there waiting
- The door handle has a subtle bounce animation on load to signal it is tappable
- The animation plays once per session — navigating away and back skips it

---

### 1.2 Interior Layout

Once the fridge door is open, the user sees the interior of the fridge/larder as a single screen. The layout has three zones:

**Left side panel**

- Displays the total number of ingredients currently across all storage sections
- Shown as a count with a label (e.g. "24 ingredients")
- Updates in real time as items are added or removed

**Centre — Section Placeholders**

- Three section blocks displayed vertically in the centre of the screen representing Fridge, Pantry, and Freezer
- Each block shows:
    - The section name (Fridge / Pantry / Freezer)
    - A visual placeholder representing that section (e.g. a shelf, a drawer, a container)
    - The number of items currently stored in that section
- Each block is tappable — tapping opens the ingredient grid popup for that section
- The blocks have a subtle idle animation to reinforce the gamified feel (e.g. a gentle pulse or glow)

**Right side panel**

- Displays alert indicators for ingredients that need attention
- A red exclamation mark icon is shown if any ingredients are expiring within 3 days or have already expired
- The number of flagged ingredients is shown alongside the icon
- If there are no alerts, this panel is empty or shows a green indicator confirming all items are in good standing
- Tapping the alert indicator opens the ingredient grid popup filtered to show only the flagged items

---

### 1.3 Ingredient Grid Popup

- Tapping a section block (or the alert indicator) opens a popup that slides up from the bottom of the screen
- The popup displays the ingredient grid for the selected section
- If opened via the alert indicator, the grid is pre-filtered to show only expiring or expired items
- The grid displays ingredients in a 2-column layout
- Each item card shows:
    - An image of the ingredient, sourced from a pre-generated set of food assets
    - The name of the ingredient
    - A health bar indicating time remaining until expiry — green when fresh, amber when getting close, red when nearly expired
    - A red border and glow around the card if the item expires within 3 days
    - Expired items are displayed as greyed out
- If no image exists for an ingredient, a generic fallback icon is shown
- The grid is scrollable vertically
- The popup can be dismissed by swiping it down or tapping outside it

---

### 1.4 Item Detail Popup

- Tapping an item card within the ingredient grid popup opens a second popup layered on top
- The popup displays:
    - Ingredient image
    - Item name
    - Date added
    - Expiry date
    - Storage location
    - The expiry health bar
- The user can edit the expiry date directly in the popup
- The user can edit the storage location (Fridge, Pantry, or Freezer) directly in the popup
- If the item is expired, a **Throw Away** button is shown — tapping this removes the item from the inventory, decrements the score, and logs the event to the activity feed
- The user can delete a non-expired item from the popup
- Tapping outside the popup or swiping it down dismisses it without saving

---

### 1.5 Bottom Action Buttons

Two floating action buttons sit at the bottom of the screen, persistent across the interior view:

- The **left button** displays a **+** icon
- The **right button** displays a **chef hat** icon
- Both buttons are visually distinct and float above the interior layout

---

### 1.6 Add Item Menu (+ Button)

- Tapping the **+** button reveals a small menu above the button with two options:
    - **Scan Receipt**
    - **Add Manually**
- Tapping outside the menu dismisses it without any action

---

### 1.7 Recipe Preference Modal (Chef Hat Button)

- Tapping the **chef hat** button opens a full-screen modal for the user to set their meal preferences
- See Section 2 for full details

---

## 2. Recipe Generation

### Overview

Triggered by tapping the chef hat button on the front page. The user is guided through a series of preference questions before D-Larder generates three tailored recipe options based on their current inventory. The user then selects a recipe, follows the guide, and marks it as done — automatically updating their inventory.

---

### 2.1 Preference Questionnaire

- The modal presents the user with a series of questions one at a time
- The full list of questions is TBD, but will cover areas such as cuisine, dietary goal, number of servings, and any other relevant preferences
- For each question, the user can either:
    - Select from a set of pre-generated options displayed as tappable chips or buttons
    - Type in their own answer if none of the options fit
- A progress indicator shows the user how far along they are in the questionnaire
- The user can go back to a previous question to change their answer at any point
- The final question is an open text box inviting the user to add any extra comments or specific requests to factor into the recipe generation
- Once all questions are answered, a **Generate** button submits the preferences

---

### 2.2 Recipe Options Screen

- After submitting preferences, three recipe options are generated and displayed
- The three options are stacked vertically, one above the other, each as a card
- Each card displays:
    - A background image representing the general cuisine or dish style
    - The name of the recipe
    - The estimated prep time
- Tapping a card expands it to reveal more detail about the recipe (details TBD)
- Each expanded card has a **Choose this Recipe** button
- Tapping **Choose this Recipe** navigates the user to the Recipe Page for that recipe

---

### 2.3 Recipe Page

- The recipe page presents a full step-by-step guide for the chosen recipe
- The page is structured in three sections in order:
    1. **Ingredients** — a list of all required ingredients with their quantities
    2. **Preparation** — steps to prepare ingredients before cooking (chopping, marinating, etc.)
    3. **Cooking** — the step-by-step cooking instructions
- At the bottom of the page there is a **Done** button

---

### 2.4 Post-Cooking — Inventory Update

- Tapping **Done** on the recipe page marks the recipe as completed
- The app automatically deducts the used ingredients and their quantities from the inventory
- If an ingredient is fully used up, it is removed from the inventory entirely
- If an ingredient is partially used, its quantity is updated to reflect the remainder
- After the update, the user is brought back to the front page
- The front page inventory reflects the updated stock immediately

---

## 3. Adding Ingredients

### Overview

Triggered by tapping the **+** button on the front page. The user is presented with two options — scanning a receipt or manually adding an ingredient. Both paths lead to the same ingredient list page, ensuring a consistent review experience before anything is saved to the inventory.

---

### 3.1 Entry Point — Add Menu

- Tapping the **+** button on the front page reveals a small menu with two options:
    - **Scan Receipt**
    - **Add Manually**
- Tapping outside the menu dismisses it without any action

---

### 3.2 Option 1 — Receipt Scanner

- Selecting **Scan Receipt** prompts the user to either:
    - Open their camera to photograph a receipt directly
    - Upload a photo from their device gallery
- Once an image is selected or captured, it is sent to the backend where the AI model processes it
- A loading state is shown while the AI is working
- Once processing is complete, the user is directed to the Ingredient Review Page (see 3.3)

---

### 3.3 Ingredient Review Page (Post-Scan)

- The page lists all ingredients extracted from the receipt by the AI
- Each ingredient entry displays:
    - Ingredient name
    - Quantity
    - Expiry date (estimated by the AI based on food category)
    - Storage location (Fridge, Pantry, or Freezer — assigned by the AI, editable by user)
- All fields are editable — the user can tap any field to modify it before saving
- The user can remove any ingredient from the list if it should not be added
- The user can add a new ingredient to the list manually from this page if anything was missed
- At the bottom of the page, a **Save All** button adds all listed ingredients to the inventory

#### Unrecognised Ingredients

- If the AI cannot confidently identify an ingredient (e.g. due to an unclear or abbreviated name on the receipt), it is flagged separately at the top of the page in a dedicated review section
- Each flagged item shows the raw text from the receipt and prompts the user to either:
    - Type in the correct ingredient name and fill in the details
    - Dismiss the item if it is not a food ingredient (e.g. cleaning products, toiletries)

---

### 3.4 Option 2 — Manual Add

- Selecting **Add Manually** opens a modal popup over the front page
- The modal contains a form with the following fields:
    - Ingredient name
    - Quantity and unit
    - Expiry date
    - Storage location (Fridge, Pantry, or Freezer)
- All fields are required before the ingredient can be saved
- Tapping **Save** adds the ingredient directly to the inventory and closes the modal
- Tapping outside the modal or dismissing it discards the entry without saving

---

## 4. Status Page

### Overview

The status page gives the user a snapshot of how well they are managing their kitchen. It is accessible as one of the carousel sections on the front page, sitting alongside Fridge, Pantry, and Freezer. The page is built around a central score that rewards using ingredients and penalises food waste.

---

### 4.1 Access

- The status page is the last panel in the front page carousel, navigable by swiping or using the carousel arrow buttons
- It sits outside the three storage sections and is visually distinct from them — it is not an inventory view, it is a summary view
- The carousel order is: Fridge → Pantry → Freezer → Status
- The carousel dot indicators update to reflect the status page as the final position

---

### 4.2 Overall Score

- A prominent score is displayed at the top of the page as the primary metric
- The score increases when:
    - A recipe is cooked using ingredients from the inventory
    - Ingredients are used up before their expiry date
- The score decreases when:
    - An ingredient expires and is not used
- The score is displayed as a number with a visual indicator (e.g. a ring, a level bar, or a grade) — exact design TBD
- A short label beneath the score contextualises it (e.g. "Great kitchen management" or "A few things going to waste")

---

### 4.3 Streak

- Tracks the number of consecutive days where no ingredients expired unused
- Displayed as a streak counter with a flame or similar icon
- Resets to zero on any day where an item expires without being used
- Encourages daily engagement and acts as a lightweight gamification hook

---

### 4.4 Waste Saved

- An estimated dollar value of food that was used before expiry rather than thrown away
- Calculated based on average cost per food category
- Displayed as a cumulative total (e.g. "You've saved an estimated $34 in food waste")
- Serves as a concrete, motivating metric beyond the abstract score

---

### 4.5 Recipes Cooked

- A running count of the total number of recipes completed through D-Larder
- Displayed as a simple stat (e.g. "12 recipes cooked")

---

### 4.6 Inventory Health Snapshot

- A quick visual breakdown of the current state of the inventory across all three storage areas
- Shows counts for:
    - Fresh items (expiry > 3 days)
    - Expiring soon (expiry within 3 days)
    - Expired items still in inventory
- Gives the user an at-a-glance reason to act if something needs attention

---

### 4.8 Recent Activity Feed

- A short log of recent actions at the bottom of the page, showing the last 5–10 events
- Event types include:
    - Recipe cooked (e.g. "Cooked Chicken Stir Fry — 3 ingredients used")
    - Ingredients added (e.g. "8 items added via receipt scan")
    - Item expired (e.g. "Spinach expired before use")
- The feed gives the page a sense of life and shows the user their history at a glance

---

## 5. API Endpoints

### Overview

All endpoints are prefixed with `/api`. The frontend communicates exclusively through these endpoints — no direct database access. Endpoints are grouped by feature area.

---

### 5.1 Inventory

#### `GET /api/inventory`

Fetch all inventory items. Returns all items across all locations by default.

**Query Parameters**

| Param      | Type   | Required | Description                                                                                          |
| ---------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `location` | string | No       | Filter by storage location. One of `fridge`, `pantry`, `freezer`. If omitted, all items are returned |

**Response**

```json
[
	{
		"id": 1,
		"name": "Chicken Breast",
		"category": "meat",
		"quantity": 2,
		"unit": "pack",
		"purchase_date": "2026-03-10",
		"expiry_date": "2026-03-13",
		"days_until_expiry": -1,
		"health_percent": 0,
		"location": "fridge",
		"image_key": "chicken_breast",
		"status": "expired"
	}
]
```

**Calculated fields** — not stored in the database, computed on every request:

| Field               | Formula                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `days_until_expiry` | `expiry_date - today` (can be negative if expired)                                         |
| `health_percent`    | `(days_until_expiry / (expiry_date - purchase_date)) * 100`, clamped between `0` and `100` |

`health_percent` represents how much shelf life remains as a percentage of the item's total expected life. The frontend uses this value directly to render the health bar on each item card — no additional calculation required.

**Status field values**

| Value      | Condition                           |
| ---------- | ----------------------------------- |
| `fresh`    | `days_until_expiry` > 3             |
| `warning`  | `days_until_expiry` between 1 and 3 |
| `critical` | `days_until_expiry` == 0            |
| `expired`  | `days_until_expiry` < 0             |

---

#### `POST /api/inventory`

Add a single item manually.

**Request Body**

```json
{
	"name": "Spinach",
	"category": "produce",
	"quantity": 1,
	"unit": "bag",
	"purchase_date": "2026-03-14",
	"expiry_date": "2026-03-21",
	"location": "fridge"
}
```

**Response** — the created item object including its assigned `id`

---

#### `POST /api/inventory/bulk`

Add multiple items at once. Used after the user confirms the receipt scan ingredient list.

**Request Body**

```json
{
	"items": [
		{
			"name": "Chicken Breast",
			"category": "meat",
			"quantity": 2,
			"unit": "pack",
			"purchase_date": "2026-03-14",
			"expiry_date": "2026-03-17",
			"location": "fridge"
		},
		{
			"name": "Whole Milk",
			"category": "dairy",
			"quantity": 1,
			"unit": "carton",
			"purchase_date": "2026-03-14",
			"expiry_date": "2026-03-21",
			"location": "fridge"
		}
	]
}
```

**Response** — array of created item objects including their assigned `id`s

---

#### `PATCH /api/inventory/{id}`

Update one or more fields on an existing item. Only fields provided in the request body are updated.

**Request Body** — any subset of editable fields

```json
{
	"expiry_date": "2026-03-20",
	"quantity": 1,
	"location": "pantry"
}
```

**Response** — the full updated item object

---

#### `DELETE /api/inventory/{id}`

Remove an item from the inventory. Used in two scenarios:

1. User manually deletes an item from the item detail popup
2. User throws away an expired item — in this case the request must include a `reason` field so the backend can decrement the score accordingly

**Request Body**

```json
{
	"reason": "thrown_away"
}
```

The `reason` field is optional. Accepted values:

| Value               | Effect on Score                                        |
| ------------------- | ------------------------------------------------------ |
| omitted or `manual` | No score change                                        |
| `thrown_away`       | Score decremented, waste event logged to activity feed |

**Response** — `204 No Content`

---

### 5.2 Receipt Scanner

#### `POST /api/receipt/scan`

Upload a receipt image for the AI to process. Returns a parsed list of recognised ingredients and a separate list of items the AI could not confidently identify.

**Request** — `multipart/form-data` with an `image` field (JPEG or PNG)

**Response**

```json
{
	"recognised": [
		{
			"name": "Chicken Breast",
			"category": "meat",
			"quantity": 2,
			"unit": "pack",
			"expiry_days": 3,
			"expiry_date": "2026-03-17",
			"location": "fridge",
			"confidence": "high"
		}
	],
	"unrecognised": [
		{
			"raw_text": "CHKN BNLS SKLS 500G",
			"confidence": "low"
		}
	]
}
```

---

### 5.3 Recipe Generation

#### `POST /api/recipe/generate`

Submit user preferences and current inventory to generate three recipe options.

**Request Body**

```json
{
	"cuisine": "asian",
	"goal": "high_protein",
	"servings": 2,
	"mode": "available_only",
	"comments": "Something quick, I only have 30 minutes"
}
```

**Response**

```json
{
	"recipes": [
		{
			"id": "recipe_abc123",
			"name": "Chicken and Spinach Stir Fry",
			"cuisine": "asian",
			"prep_time": "25 mins",
			"image_key": "stir_fry",
			"ingredients": [
				{
					"name": "Chicken Breast",
					"quantity": "300g",
					"available": true
				},
				{ "name": "Spinach", "quantity": "1 bag", "available": true },
				{
					"name": "Soy Sauce",
					"quantity": "2 tbsp",
					"available": false
				}
			],
			"preparation": [
				"Slice chicken breast into thin strips",
				"Wash and dry spinach"
			],
			"cooking": [
				"Heat oil in a wok over high heat",
				"Add chicken and stir fry for 5 minutes"
			],
			"macros": {
				"calories": 420,
				"protein": 45,
				"carbs": 12,
				"fat": 18
			}
		}
	]
}
```

The full recipe detail is returned upfront for all three options so the frontend does not need a second API call when the user expands a recipe card or navigates to the recipe page.

---

#### `POST /api/recipe/complete`

Mark a recipe as completed. Deducts used ingredients from the inventory, increments the score, and logs the event to the activity feed.

**Request Body**

```json
{
	"recipe_id": "recipe_abc123",
	"ingredients_used": [
		{ "inventory_id": 1, "quantity_used": 2 },
		{ "inventory_id": 3, "quantity_used": 1 }
	]
}
```

- If `quantity_used` equals the item's current quantity, the item is removed from inventory entirely
- If `quantity_used` is less than the item's current quantity, the item's quantity is decremented accordingly

**Response** — `200 OK` with updated score

```json
{
	"score": 142
}
```

---

### 5.4 Status

#### `GET /api/status`

Returns the user's current status values. All values are pre-computed and stored — this endpoint reads them directly, no computation on request.

Score and related stats are updated by two events only:

- `POST /api/recipe/complete` — score goes up, streak maintained
- `DELETE /api/inventory/{id}` with `reason: thrown_away` — score goes down, streak resets if applicable

**Response**

```json
{
	"score": 142,
	"streak_days": 5,
	"waste_saved_dollars": 34.5,
	"recipes_cooked": 12,
	"inventory_health": {
		"fresh": 14,
		"warning": 3,
		"critical": 1,
		"expired": 2
	},
	"recent_activity": [
		{
			"type": "recipe_cooked",
			"description": "Cooked Chicken Stir Fry — 3 ingredients used",
			"timestamp": "2026-03-14T18:30:00Z"
		},
		{
			"type": "items_added",
			"description": "8 items added via receipt scan",
			"timestamp": "2026-03-14T09:15:00Z"
		},
		{
			"type": "item_expired",
			"description": "Spinach thrown away",
			"timestamp": "2026-03-13T20:00:00Z"
		}
	]
}
```

---

### 5.5 Expired Item Handling

Expired items are not automatically removed from the database. The flow is:

1. `GET /api/inventory` returns expired items with `status: "expired"`
2. The frontend renders expired items as greyed out in the inventory grid
3. The user taps the expired item to open the item detail popup
4. The popup shows a **Throw Away** button alongside the usual edit options
5. Tapping **Throw Away** calls `DELETE /api/inventory/{id}` with `reason: thrown_away`
6. The backend removes the item, decrements the score, and logs the waste event to the activity feed

This keeps expiry handling entirely user-driven with no background jobs or scheduled tasks required.

---

## 6. AI Model Usage

### Overview

D-Larder makes two distinct calls to the Google Gemini API. Both calls are made server-side from the Python backend — the frontend never communicates with Gemini directly. All prompts are constructed in the backend and responses are parsed before being returned to the frontend.

The model used for both calls is `gemini-1.5-flash`.

---

### 6.1 Call 1 — Receipt Parsing

**Trigger:** User submits a receipt image via `POST /api/receipt/scan`

**Purpose:** Extract food items from a grocery receipt image, estimate expiry dates per item based on food category, assign a default storage location, and flag anything that cannot be confidently identified.

**Input to Gemini**

The request is a multimodal call — an image and a text prompt are sent together.

**Full Prompt:**

```
You are a grocery receipt parser for a kitchen inventory app.

You will be given an image of a grocery receipt. Your job is to extract all food items from the receipt and return structured data.

For each food item found, return:
- name: the full, readable ingredient name (not abbreviated — e.g. "Chicken Breast" not "CHKN BRSTLS")
- category: one of [meat, seafood, dairy, produce, deli, dry_goods, frozen, beverages, condiments, other]
- quantity: numeric quantity purchased (e.g. 2)
- unit: one of [g, kg, ml, l, pcs, pack, bottle, box, bag, can, carton, bunch, other]
- expiry_days: estimated number of days from purchase before this item expires, based on its category using these guidelines:
    - meat: 3 days
    - seafood: 2 days
    - dairy: 7 days
    - produce: 7 days
    - deli: 5 days
    - dry_goods: 730 days
    - frozen: 180 days
    - beverages: 14 days
    - condiments: 180 days
    - other: 14 days
- location: default storage location, one of [fridge, pantry, freezer], assigned based on category:
    - fridge: meat, seafood, dairy, produce, deli, beverages
    - pantry: dry_goods, condiments, other
    - freezer: frozen
- confidence: "high" if you are confident this is a clearly identifiable food item, "low" if the name is ambiguous or unclear

Non-food items (e.g. cleaning products, toiletries, bags) must be excluded entirely.

Any item you cannot confidently parse as a named food ingredient must be placed in the unrecognised list with its raw receipt text.

Today's date is {today_date}. Calculate expiry_date as today + expiry_days.

Return only valid JSON with no explanation, no markdown, and no code fences. Use this exact structure:
{
  "recognised": [
    {
      "name": "",
      "category": "",
      "quantity": 0,
      "unit": "",
      "expiry_days": 0,
      "expiry_date": "",
      "location": "",
      "confidence": "high"
    }
  ],
  "unrecognised": [
    {
      "raw_text": ""
    }
  ]
}
```

**Variables injected at runtime:**

| Variable       | Source                                             |
| -------------- | -------------------------------------------------- |
| `{today_date}` | Server date at time of request (e.g. `2026-03-14`) |

**Expected Response:** JSON matching the structure above, parsed by the backend before returning to the frontend via `POST /api/receipt/scan`.

---

### 6.2 Call 2 — Recipe Generation

**Trigger:** User submits preferences via `POST /api/recipe/generate`

**Purpose:** Generate three distinct recipe options tailored to the user's preferences and current inventory, prioritising ingredients that are closest to expiry.

**Input to Gemini**

Text-only prompt. The full inventory (sorted by expiry, soonest first) and user preferences are injected at runtime.

**Full Prompt:**

```
You are a personal chef assistant for a kitchen inventory app called D-Larder.

Your job is to generate exactly 3 recipe options based on the user's current inventory and their stated preferences. Recipes must make practical use of what the user already has, prioritising ingredients that are expiring soonest.

CURRENT INVENTORY (sorted by expiry date, soonest first):
{inventory_list}

USER PREFERENCES:
- Cuisine: {cuisine}
- Dietary goal: {goal}
- Number of servings: {servings}
- Ingredient mode: {mode}
- Additional comments from user: {comments}

RULES:
- Generate exactly 3 distinct recipe options. Each must be meaningfully different from the others.
- Prioritise ingredients expiring within 3 days — at least one of these must appear in every recipe where possible.
- If ingredient mode is "available_only", only use ingredients present in the inventory. Do not suggest purchasing anything.
- If ingredient mode is "allow_buying", you may include additional ingredients not in the inventory — mark these clearly with "available": false.
- Each recipe must align with the user's dietary goal and cuisine preference.
- Factor in the user's additional comments if provided.
- Prep time should be realistic and reflect the actual steps involved.
- Do not repeat the same hero ingredient across all three recipes if the inventory has variety.

Return only valid JSON with no explanation, no markdown, and no code fences. Use this exact structure:
{
  "recipes": [
    {
      "id": "",
      "name": "",
      "cuisine": "",
      "prep_time": "",
      "ingredients": [
        {
          "name": "",
          "quantity": "",
          "available": true
        }
      ],
      "preparation": [
        ""
      ],
      "cooking": [
        ""
      ],
      "macros": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }
    }
  ]
}
```

**Variables injected at runtime:**

| Variable           | Source                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{inventory_list}` | All inventory items fetched from DB, sorted by `expiry_date` ASC, formatted as a plain text list: `- Chicken Breast, qty 2 pack, expires in 2 days` |
| `{cuisine}`        | User preference from request body (e.g. `Asian`, `No preference`)                                                                                   |
| `{goal}`           | User preference from request body (e.g. `High protein`, `Lose weight`)                                                                              |
| `{servings}`       | User preference from request body (e.g. `2`)                                                                                                        |
| `{mode}`           | User preference from request body — either `Use available ingredients only` or `Allow buying additional ingredients`                                |
| `{comments}`       | Free text from the final question in the preference questionnaire. If empty, inject `None`                                                          |

**Expected Response:** JSON matching the structure above with exactly 3 recipes, parsed by the backend before returning to the frontend via `POST /api/recipe/generate`.

---

### 6.3 Call 3 — Ingredient Image Key Resolution

**Trigger:** Fired after Call 1 (receipt parsing) returns its recognised ingredient list, before the response is sent to the frontend

**Purpose:** Map each recognised ingredient name to the closest matching image key from the available asset library. Handles variations, abbreviations, and brand names that a static lookup table would miss.

**Batching**

All unresolved ingredient names from a single receipt are sent in one call — not one call per ingredient. This keeps latency low regardless of receipt length.

**In-memory map (checked first)**

Before firing the LLM call, the backend checks an in-memory dictionary of pre-mapped common ingredients. If a match is found, no LLM call is needed for that item. The LLM call only handles names not covered by the map.

```python
IMAGE_KEY_MAP = {
    "eggs": "eggs",
    "free range eggs": "eggs",
    "whole milk": "whole_milk",
    "full cream milk": "whole_milk",
    "skim milk": "whole_milk",
    "chicken breast": "chicken_breast",
    "chicken thigh": "chicken_thigh",
    "beef mince": "beef_mince",
    "minced beef": "beef_mince",
    "salmon fillet": "salmon",
    "baby spinach": "spinach",
    # ... expand as needed during testing
}
```

Lookup is performed by normalising the ingredient name to lowercase and stripping extra whitespace before checking against the map.

Any names not found in the map are batched and sent to the LLM.

**Model:** `gemini-1.5-flash` (smaller, faster model — task is simple)

**Full Prompt:**

```
You are an image asset matcher for a kitchen inventory app.

You will be given a list of ingredient names. For each name, pick the single most appropriate key from the provided list that best represents it visually.

INGREDIENT NAMES:
{ingredient_names}

AVAILABLE KEYS:
{image_keys}

RULES:
- Return exactly one key per ingredient name
- If no key is a reasonable visual match, use: unknown
- Return only valid JSON with no explanation, no markdown, and no code fences

Use this exact structure:
{
  "mappings": {
    "Free Range Eggs": "eggs",
    "Full Cream Milk": "whole_milk",
    "CHKN BRSTLS 500G": "chicken_breast"
  }
}
```

**Variables injected at runtime:**

| Variable             | Source                                                                                |
| -------------------- | ------------------------------------------------------------------------------------- |
| `{ingredient_names}` | List of ingredient names not resolved by the in-memory map, formatted as a JSON array |
| `{image_keys}`       | Full list of valid image keys from section 7.1, formatted as a comma-separated list   |

**Expected Response:** JSON mapping each ingredient name to its resolved image key. The backend merges these results with the in-memory map results before returning the full ingredient list to the frontend.

---

### 6.4 Error Handling

For all three calls, the backend must handle the following failure cases before returning to the frontend:

- **Invalid JSON response** — if Gemini returns malformed JSON or wraps the response in markdown code fences, the backend should attempt to strip fences and re-parse before failing
- **Missing required fields** — if a required field is absent from a recognised item or recipe, the backend should log the issue and either fill a safe default or exclude the item and continue
- **Empty recognised list** — if no items are recognised from a receipt, return an empty `recognised` array and surface all items as `unrecognised` rather than returning an error
- **Image key resolution failure** — if Call 3 fails entirely, fall back to the in-memory map for covered items and `unknown` for everything else. The receipt flow should never be blocked by a failed image key lookup
- **Gemini API failure** — if any API call fails entirely, return a `502` error to the frontend with a user-facing message

---

## 7. Assets

### Overview

All static assets are pre-generated before the hackathon and bundled with the frontend. No assets are fetched at runtime. Assets are organised by type and referenced by key throughout the app.

---

### 7.1 Ingredient Images

Used on item cards in the inventory grid and in the item detail popup.

**Specs**

- Format: PNG with transparent background
- Size: 256x256px
- Style: Flat illustration, consistent colour palette across all images
- Naming convention: `{image_key}.png` (e.g. `chicken_breast.png`, `whole_milk.png`)
- Location: `frontend/public/assets/ingredients/`
- A generic fallback image (`unknown.png`) is required for unrecognised ingredients

**Required ingredient images**

| image_key         | Item                | Maps From                                            |
| ----------------- | ------------------- | ---------------------------------------------------- |
| `chicken`         | Chicken             | Chicken breast, chicken thigh, any chicken cut       |
| `beef_mince`      | Beef Mince          | Mince, ground beef                                   |
| `red_meat`        | Red Meat / Chop     | Beef steak, pork chop, lamb chop, any red meat cut   |
| `fish`            | Fish                | Salmon, any fresh fish fillet                        |
| `can_food`        | Canned Food         | Canned tuna, coconut milk, any canned good           |
| `shrimp`          | Shrimp              | Shrimp, prawns                                       |
| `milk`            | Milk / Dairy Liquid | Whole milk, skim milk, heavy cream, any liquid dairy |
| `yoghurt`         | Yoghurt             | Yoghurt, Greek yoghurt                               |
| `butter`          | Butter              | Butter, margarine                                    |
| `cheese`          | Cheese              | Cheddar, any cheese variety                          |
| `eggs`            | Eggs                | Eggs, free range eggs                                |
| `green_vegetable` | Green Vegetable     | Spinach, broccoli, lettuce, cucumber, any green veg  |
| `carrot`          | Carrot              | Carrot, baby carrots                                 |
| `onion`           | Onion               | Onion, shallots, red onion                           |
| `garlic`          | Garlic              | Garlic, garlic cloves                                |
| `tomato`          | Tomato              | Tomato, cherry tomatoes                              |
| `capsicum`        | Capsicum            | Capsicum, bell pepper                                |
| `mushroom`        | Mushroom            | Mushroom, any mushroom variety                       |
| `potato`          | Potato              | Potato, sweet potato, any potato variety             |
| `lemon`           | Lemon               | Lemon, lime                                          |
| `apple`           | Apple               | Apple, any apple variety                             |
| `banana`          | Banana              | Banana                                               |
| `strawberry`      | Strawberry          | Strawberry, any berry                                |
| `orange`          | Orange              | Orange, orange juice                                 |
| `pasta`           | Pasta               | Pasta, noodles, any pasta shape                      |
| `rice`            | Rice                | Rice, any rice variety                               |
| `bread`           | Bread               | Bread, loaf, rolls                                   |
| `flour`           | Flour               | Flour, any flour type                                |
| `oats`            | Oats                | Oats, rolled oats                                    |
| `sauce_bottle`    | Sauce / Oil Bottle  | Soy sauce, olive oil, any bottled sauce or oil       |
| `tomato_sauce`    | Tomato Sauce        | Tomato sauce, passata, pasta sauce                   |
| `frozen_bag`      | Frozen Bag          | Frozen peas, frozen corn, any frozen bag item        |
| `ice_cream`       | Ice Cream           | Ice cream, gelato                                    |
| `unknown`         | Unknown / Fallback  | Any item with no matching key                        |

---

### 7.2 Cuisine Background Images

Used as background images on recipe option cards in the recipe generation screen.

**Specs**

- Format: JPG
- Size: 800x400px
- Style: Atmospheric food photography or illustrated food scene — consistent mood across all images
- Naming convention: `cuisine_{key}.jpg`
- Location: `frontend/public/assets/cuisines/`

**Required cuisine images**

| image_key                | Cuisine                            |
| ------------------------ | ---------------------------------- |
| `cuisine_asian`          | Asian                              |
| `cuisine_mediterranean`  | Mediterranean                      |
| `cuisine_western`        | Western                            |
| `cuisine_mexican`        | Mexican                            |
| `cuisine_indian`         | Indian                             |
| `cuisine_middle_eastern` | Middle Eastern                     |
| `cuisine_general`        | General / No preference (fallback) |

---

### 7.3 UI Icons

Used throughout the app for buttons, navigation, and status indicators.

**Specs**

- Format: SVG
- Size: 24x24px base, scalable
- Style: Outlined, consistent stroke weight
- Location: `frontend/src/assets/icons/`

**Required icons**

| Filename               | Used For                              |
| ---------------------- | ------------------------------------- |
| `icon_plus.svg`        | Add item button (front page)          |
| `icon_chef.svg`        | Recipe generation button (front page) |
| `icon_arrow_left.svg`  | Carousel left navigation              |
| `icon_arrow_right.svg` | Carousel right navigation             |
| `icon_trash.svg`       | Delete / throw away item              |
| `icon_edit.svg`        | Edit item fields                      |
| `icon_check.svg`       | Confirm / save action                 |
| `icon_close.svg`       | Dismiss popup or modal                |
| `icon_flame.svg`       | Streak indicator on status page       |
| `icon_star.svg`        | Score indicator on status page        |
| `icon_leaf.svg`        | Waste saved indicator on status page  |
| `icon_back.svg`        | Back navigation in recipe modal       |

---

### 7.4 Fridge Door Illustration

Used on the landing animation screen.

**Specs**

- Format: SVG (preferred for scalability) or PNG
- Size: fills screen width on a 375px mobile viewport
- Style: Flat, minimal illustration — off-white door body, pill-shaped handle on the right edge, subtle fridge/freezer dividing line
- Two states required:
    - `fridge_door_closed.svg` — default state shown on load
    - The open state is achieved via CSS `rotateY` transform on the same asset, no separate open illustration needed
- Location: `frontend/public/assets/`

---

### 7.5 App Icon & Branding

**Required**

- App icon: 512x512px PNG, used for PWA manifest and home screen install
- Favicon: 32x32px PNG
- Wordmark or logo lockup for the splash/loading state (optional, nice to have)

**Naming**

- `frontend/public/icon-512.png`
- `frontend/public/favicon.png`

---
