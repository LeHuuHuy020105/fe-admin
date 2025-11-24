import { axiosInstance } from "../axiosConfig";

interface GetFindAllParams {
  keyword?: string;
  sort?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const getAllProduct = async (params: GetFindAllParams) => {
  try {
    const response = await axiosInstance.get("/product/admin/list", {
      params,
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get product error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const createProduct = async (productData: any) => {
  try {
    const response = await axiosInstance.post("/product/add", productData);
    console.log("axios data: ", productData);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(
      "Create product error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteProduct = async (productId: number | string) => {
  try {
    const response = await axiosInstance.delete(`/product/${productId}/delete`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Delete product error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getDetailProduct = async (productId: number | string) => {
  try {
    const response = await axiosInstance.get(`/product/detail/${productId}`);

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(
      "Get detail product error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateProduct = async (productData: any) => {
  try {
    const response = await axiosInstance.put("/product/update", productData);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update product error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const addImageProduct = async (
  productId: number,
  urlImages: string[]
) => {
  try {
    const response = await axiosInstance.post("/image_product/add", {
      productId,
      urlImages,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add imageProduct error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteImageProduct = async (
  productId: number,
  urlImages: string[]
) => {
  try {
    const response = await axiosInstance.delete("/image_product/delete", {
      data: { productId, urlImages },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Delete imageProduct error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteAttributes = async (
  productId: number | string,
  attributeIds: number[]
) => {
  try {
    const response = await axiosInstance.delete(
      `/product/${productId}/attribute/delete`,
      {
        data: attributeIds, // gửi body chứa danh sách attributeId
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Delete attributes error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};
export const deleteAttributeValues = async (
  productId: number | string,
  attributeValueIds: number[]
) => {
  try {
    const response = await axiosInstance.delete(
      `/product/${productId}/attributeValue/delete`,
      {
        data: attributeValueIds, // gửi body danh sách attributeValueId
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Delete attribute values error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export interface AttributeUpdateRequest {
  id: number; // attributeId
  name: string; // tên mới
}

export const updateAttributes = async (
  productId: number | string,
  requests: AttributeUpdateRequest[]
) => {
  try {
    const response = await axiosInstance.put(
      `/product/${productId}/attributes/update`,
      requests // gửi body JSON là mảng {id, name}
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update attributes error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

interface AttributeValueUpdateRequest {
  id: number;
  value?: string;
  image?: string;
  isRemoveImage?: boolean;
}

export const updateAttributeValues = async (
  productId: number | string,
  requests: AttributeValueUpdateRequest[]
) => {
  try {
    const response = await axiosInstance.put(
      `/product/${productId}/attributeValue/update`,
      requests
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update attribute values error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};


export const updateProductVariants = async (
  productId: number | string,
  requests: any[]
) => {
  try {
    const response =  await axiosInstance.put(
    `/product/${productId}/variants/update`,
    requests
  );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update variant error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const addProductVariants = async (
  productId: number | string,
  requests: any[]
) => {
  try {
    const response = await axiosInstance.post(
      `/product/${productId}/variants/add`,
      requests
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add product variants error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getAllProductVariant = async (params: any) => {
  try {
    // Gọi API lấy danh sách sản phẩm admin để có đầy đủ variant
    const response = await axiosInstance.get("/product/admin/list", { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const restoreProduct = async (
  productId: number | string,
) => {
  try {
    const response = await axiosInstance.post(
      `/product/${productId}/restore`,
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Restore error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};