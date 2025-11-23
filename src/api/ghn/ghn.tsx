import axios from "axios";

const GHN_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN || "";

if (!GHN_TOKEN) {
  console.warn("Warning: GHN_TOKEN is not set. API requests may fail.");
}

// Create axios instance with GHN token header
const ghnAxios = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    token: GHN_TOKEN,
    "Content-Type": "application/json",
  },
});

export interface Province {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
  NameExtension: string[];
  IsEnable: number;
  RegionID: number;
  RegionCPN: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  AreaID?: number;
  CanUpdateCOD: boolean;
  Status: number;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface District {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  CodeName: string;
  NameExtension: string[];
  IsEnable: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  CanUpdateCOD: boolean;
  Status: number;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface Ward {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension: string[];
  IsEnable: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  CanUpdateCOD: boolean;
  Status: number;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export interface GHNResponse<T> {
  code: number;
  message: string;
  data: T[];
}

/**
 * Get all provinces from GHN
 * GET https://online-gateway.ghn.vn/shiip/public-api/master-data/province
 */
export const getProvinces = async (): Promise<{ success: boolean; data?: Province[]; error?: string }> => {
  try {
    const response = await ghnAxios.get<GHNResponse<Province>>("/province");
    if (response.data.code === 200) {
      return { success: true, data: response.data.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    console.error("Get provinces error:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to get provinces",
    };
  }
};

/**
 * Get districts by province ID
 * POST https://online-gateway.ghn.vn/shiip/public-api/master-data/district
 */
export const getDistricts = async (provinceId: number): Promise<{ success: boolean; data?: District[]; error?: string }> => {
  try {
    const response = await ghnAxios.post<GHNResponse<District>>("/district", {
      province_id: provinceId,
    });
    if (response.data.code === 200) {
      return { success: true, data: response.data.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    console.error("Get districts error:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to get districts",
    };
  }
};

/**
 * Get wards by district ID
 * POST https://online-gateway.ghn.vn/shiip/public-api/master-data/ward
 */
export const getWards = async (districtId: number): Promise<{ success: boolean; data?: Ward[]; error?: string }> => {
  try {
    const response = await ghnAxios.post<GHNResponse<Ward>>("/ward", {
      district_id: districtId,
    });
    if (response.data.code === 200) {
      return { success: true, data: response.data.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    console.error("Get wards error:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to get wards",
    };
  }
};
