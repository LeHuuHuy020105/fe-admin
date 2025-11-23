import { axiosInstance } from "../axiosConfig";


export const getAllCategory = async () => {
  try {
    const response = await axiosInstance.get("/category/all");

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get product error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};