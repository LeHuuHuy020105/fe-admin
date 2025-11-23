// src/api/upload/uploadFile.ts
import { axiosInstance } from "../axiosConfig";

/**
 * Upload một hoặc nhiều file và trả về danh sách URL
 * @param files - File hoặc mảng File
 * @returns Promise<string[]> - danh sách URL trả về từ server
 */
export const uploadFiles = async (files: File | File[]): Promise<string[]> => {
  try {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("files", file));
    } else {
      formData.append("files", files);
    }

    const response = await axiosInstance.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Giả sử server trả về data dạng { status, message, data: string[] }
    return response.data.data;
  } catch (error: any) {
    console.error("Upload file lỗi:", error);
    throw error;
  }
};

export const deleteFiles = async (files: string[]): Promise<void> => {
  try {
    await axiosInstance.post("/upload/delete", { files });
  } catch (error: any) {
    console.error("Xóa file thất bại:", error);
    throw error;
  }
};