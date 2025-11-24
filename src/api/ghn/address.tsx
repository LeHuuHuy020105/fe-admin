// src/api/ghn/address.tsx
import axios from "axios";

const GHN_API_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

// Tạo instance axios riêng cho GHN để tránh xung đột với axiosConfig của App
const ghnInstance = axios.create({
  baseURL: GHN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Token": GHN_TOKEN,
  },
});

export interface Province {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface District {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
}

export interface Ward {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

export const getProvinces = async () => {
  try {
    const response = await ghnInstance.get("/province");
    // GHN trả về data trong response.data.data
    return { success: true, data: response.data.data as Province[] };
  } catch (error: any) {
    console.error("Lỗi lấy tỉnh thành GHN:", error);
    return { success: false, data: [] };
  }
};

export const getDistricts = async (provinceId: number) => {
  try {
    // GHN yêu cầu gửi province_id qua body hoặc query tùy endpoint, 
    // theo Postman là POST hoặc GET với param. Thử GET params trước cho chuẩn REST.
    const response = await ghnInstance.get("/district", {
      params: { province_id: provinceId }
    });
    return { success: true, data: response.data.data as District[] };
  } catch (error: any) {
    console.error("Lỗi lấy quận huyện GHN:", error);
    return { success: false, data: [] };
  }
};

export const getWards = async (districtId: number) => {
  try {
    const response = await ghnInstance.get("/ward", {
      params: { district_id: districtId }
    });
    return { success: true, data: response.data.data as Ward[] };
  } catch (error: any) {
    console.error("Lỗi lấy phường xã GHN:", error);
    return { success: false, data: [] };
  }
};