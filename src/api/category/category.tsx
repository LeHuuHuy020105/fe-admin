import { axiosInstance } from "../axiosConfig";

export interface CategoryItem {
  id: number;
  name: string;
  childCategory: CategoryItem[];
  status: string;
  createAt: string;
  updatedAt: string | null;
  locked?: boolean;
}

export const getAllCategory = async () => {
  try {
    const response = await axiosInstance.get("/category/all");

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get product error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getCategoryList = async () => {
  try {
    const response = await axiosInstance.get("/category/list");

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get category list error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/category/${id}/delete`);

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Delete category error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const restoreCategory = async (id: number) => {
  try {
    const response = await axiosInstance.post(`/category/${id}/restore`);

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Restore category error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const addCategories = async (requests: any[]) => {
  try {
    const response = await axiosInstance.post(`/category/add`, requests);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Add categories error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const moveCategory = async (request: { categoryId: number; categoryParentId: number | null }) => {
  try {
    const response = await axiosInstance.post(`/category/move`, request);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Move category error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateCategory = async (request: { id: number; name: string; parentId?: number | null }) => {
  try {
    const response = await axiosInstance.put(`/category/update`, request);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Update category error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};