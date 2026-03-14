import { apiAxios } from "./index";

export const getKitchenKarma = async () => {
  const data = await apiAxios.get("/kitchen_karma");
  return data;
};
