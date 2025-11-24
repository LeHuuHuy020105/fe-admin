import { axiosInstance } from "../axiosConfig";

export interface VariantAttribute {
  id: number;
  attribute: string;
  value: string;
}

export interface ProductVariantResponse {
  id: number;
  sku: string;
  price: number;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  variantAttributes: VariantAttribute[];
  productName?: string; 
}

export interface ImportDetailResponse {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariantResponse: ProductVariantResponse;
}

export interface ImportDetail {
  id?: number;
  productVariantId: number;
  productName?: string; // Dùng để hiển thị
  sku?: string;        // Dùng để hiển thị
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface ImportProduct {
  updatedAt: any;
  id: number;
  importCode: string; // Sửa từ code -> importCode
  description?: string;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt?: string; // JSON mẫu bạn đưa không thấy trường này, nhưng UI cần ngày
  supplierResponse: {
    id: number;
    name: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  importDetailResponses: ImportDetailResponse[]; // Sửa từ importDetails -> importDetailResponses
}

export interface ImportRequest {
  supplierId: number;
  description: string;
  importDetails: {
    productVariantId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateImportQuantityRequest {
  importDetailId: number;
  quantity: number;
}

interface GetImportParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const getAllImports = async (params: GetImportParams) => {
  try {
    const response = await axiosInstance.get("/import_product/list", { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const getImportDetail = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/import_product/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const createImport = async (data: ImportRequest) => {
  try {
    const response = await axiosInstance.post("/import_product/add", data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const confirmImport = async (id: number) => {
  try {
    const response = await axiosInstance.post(`/import_product/${id}/confirm`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const cancelImport = async (id: number) => {
  try {
    const response = await axiosInstance.post(`/import_product/${id}/cancel`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateImportQuantity = async (importId: number, data: UpdateImportQuantityRequest[]) => {
  try {
    const response = await axiosInstance.put(`/import_product/${importId}/details/update_quantity`, data);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const deleteImportDetail = async (importId: number, detailId: number) => {
  try {
    const response = await axiosInstance.delete(`/import_product/${importId}/details/delete/${detailId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};