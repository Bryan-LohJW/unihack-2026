Requirement
I want to develop a fridge management web app focusing on mobile design with these main features:

## Features
F1. Taking input from a camera image of my receipt and generate the food data into the fridge db
F2. The food data should include name, estimated expiry, calorie
F3. There should be a notification sent on expiry date
F4. I should be able to CRUD for food item in fridge
F5. Given what is left on the fridge, my system should be able to come up with suggestion on the food that I can cook.

## Frontend
FE-1: Landing page should contain a closed fridge state
FE-2: We can interact with the fridge to open the fridge in frontend and see what inside. The fridge will have 3 sections, the bottom one is a freezer section. which is a drawer. It can be pulled out when I clicked on it. The fridge in open state shall show what food item is inside, and there is also a small health bar indicate the item expiry.
FE-3: When we click on the inventory item, a modal will showed up, showing some detail information like: name, time we bought the item, expiry, calory, nutrition. The modal have 2 action button: one is a chef button, one is a delete button, one for edit button.
FE-4: As mentioned in FE-3, when the chef button is clicked, we will be redirected to a new page showing what are the menu that utilize this menu.
FE-5: As mentioned in FE-4, when the delete button is clicked, the food is either discarded because it has gone bad / discarded as in it has been cooked, and now we are updating it.

## Backend
BE-2: Backend will need to have a CRUD for inventory management. Input is a image file of a receipt (batch), or manual input.
BE-3: Backend will need to connected to LLM for food suggestion related to FE-4 and F6
BE-4: Backend will track of how many food waste, and compute a score for u.

## Tech Stack
Frontend use React
Backend use Python (Flask), Mongodb
Design: I want a gamify kinda of design for the frontend. Repsonsiveness on mobile phone.


## Nice to have
- Fridge Utilization
- Fridge Size
- Authentication
