import { apiAxios } from "./index";

export const getInventoryOverview = async () => {
  // No need for response.data anymore, the interceptor handles it!
  const data = await apiAxios.get("/inventory/overview");
  return data.sections;
};

export const getAllInventory = async ({ section, expiring_within_days } = {}) => {
  // Build the params object dynamically
  const params = {};

  // Only add 'section' if it's provided (valid values: "pantry", "fridge", "freezer")
  if (section) {
    params.section = section;
  }

  // Only add 'expiring_within_days' if it's provided (can be 0 or negative, so we check for undefined)
  if (expiring_within_days !== undefined) {
    params.expiring_within_days = expiring_within_days;
  }

  // Axios will automatically format these into a query string like ?section=fridge&expiring_within_days=5
  const data = await apiAxios.get("/inventory", { params });

  // Return the data directly since this endpoint returns an array of items
  return data;
};

export const updateInventoryItem = async (itemId, payload) => {
  return apiAxios.put(`/inventory/${itemId}`, payload);
};

export const deleteInventoryItem = async (itemId) => {
  return apiAxios.delete(`/inventory/${itemId}`);
};
