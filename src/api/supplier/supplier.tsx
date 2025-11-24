import { axiosInstance } from "../axiosConfig";

// Cập nhật interface Supplier khớp với Entity Java mới
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string; // Địa chỉ chi tiết (số nhà, đường)
  province?: string;
  provinceId?: number;
  district?: string;
  districtId?: number;
  ward?: string;
  wardId?: string;
  status: "ACTIVE" | "INACTIVE";
}

// Interface cho payload tạo mới/cập nhật
export interface SupplierRequest {
  id?: number; // Dùng cho update
  name: string;
  phone: string;
  address: string; // Số nhà, tên đường
  province: string;
  provinceId: number;
  district: string;
  districtId: number;
  ward: string;
  wardId: string;
}

interface GetSupplierParams {
  keyword?: string;
  page?: number;
  size?: number;
  status?: string;
  sort?: string;
}

export const getAllSupplier = async (params: GetSupplierParams) => {
  try {
    const response = await axiosInstance.get("/supplier/list", { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get supplier error:", error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const createSupplier = async (data: SupplierRequest) => {
  try {
    const response = await axiosInstance.post("/supplier/add", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateSupplier = async (data: SupplierRequest) => {
  try {
    const response = await axiosInstance.put("/supplier/update", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const deleteSupplier = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/supplier/${id}/delete`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const restoreSupplier = async (id: number) => {
  try {
    const response = await axiosInstance.post(`/supplier/${id}/restore`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};