import { axiosInstance } from "../axiosConfig";

// Tạo voucher
export const createVoucher = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/voucher/add", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Cập nhật voucher
export const updateVoucher = async (payload: any) => {
  try {
    const response = await axiosInstance.put("/voucher/update", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Xóa voucher
export const deleteVoucher = async (voucherId: number | string, status: string = "DISABLE") => {
  try {
    // backend expects PUT /{voucherId}/delete?status=...
    const response = await axiosInstance.put(`/voucher/${voucherId}/delete`, null, {
      params: { status },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Lấy danh sách user rank
export const getUserRanks = async () => {
  try {
    const response = await axiosInstance.get("/userRank/list");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Lấy danh sách voucher (với phân trang / tìm kiếm) từ endpoint: GET /voucher/listForMe
export const getVouchers = async (params: {
  sort?: string;
  page?: number;
  size?: number;
  search?: string;
} = {}) => {
  try {
    const response = await axiosInstance.get("/voucher/listForMe", {
      params: {
        sort: params.sort,
        page: params.page ?? 0,
        size: params.size ?? 10,
        // gửi param search nếu có (backend có thể ignore nếu không hỗ trợ)
        search: params.search,
      },
    });
    // backend trả về { status, message, data: ... }
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Lấy danh sách voucher cho admin (filter, time range, pagination)
export const getVouchersAdmin = async (params: {
  keyword?: string;
  sort?: string;
  page?: number;
  rank?: string;
  size?: number;
  timeStatus?: string; // e.g. "valid"
  startDate?: string; // ISO local datetime string expected by backend
  endDate?: string;
} = {}) => {
  try {
    const response = await axiosInstance.get("/voucher/admin/list", {
      params: {
        keyword: params.keyword,
        sort: params.sort,
        page: params.page ?? 0,
        rank: params.rank,
        size: params.size ?? 10,
        timeStatus: params.timeStatus,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};
