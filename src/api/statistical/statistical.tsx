import { axiosInstance } from "../axiosConfig";

export const StatisticalAPI = {
  /**
   * Lấy thống kê user active
   * @param periodInMonths 1,3,6,12
   */
  getActiveUserStatistics: async (periodInMonths: number) => {
    const { data } = await axiosInstance.get(`/statistical/users/active`, {
      params: { periodInMonths },
    });
    return data;
  },

  /**
   * Lấy thống kê đơn hàng
   * @param periodInMonths 1,3,6,12
   */
  getOrderStatistics: async (periodInMonths: number) => {
    const { data } = await axiosInstance.get(`/statistical/orders`, {
      params: { periodInMonths },
    });
    return data;
  },

  /**
   * Lấy thống kê doanh thu, chi phí, lợi nhuận theo tháng hiện tại và kỳ trước
   * @param periodInMonths 1,3,6,12
   */
  getRevenueStatistics: async (periodInMonths: number) => {
    const { data } = await axiosInstance.get(`/statistical/revenue`, {
      params: { periodInMonths },
    });
    return data;
  },

  /**
   * Lấy tổng doanh thu, chi phí, lợi nhuận 12 tháng gần nhất
   */
  getRevenueCostProfit12Months: async () => {
    const { data } = await axiosInstance.get(`/statistical/revenue/12months`);
    return data;
  },

  /**
   * Lấy top sản phẩm bán chạy
   * @param periodInMonths 1,3,6,12
   * @param topN số lượng top sản phẩm
   */
  getTopProducts: async (periodInMonths: number, topN: number = 10) => {
    const { data } = await axiosInstance.get(`/statistical/top-products`, {
      params: { periodInMonths, topN },
    });
    return data;
  },

  /**
   * Lấy số lượng category bán được trong các đơn COMPLETED
   * @param periodInMonths 1,3,6,12
   */
  getCategoryStatistics: async (periodInMonths: number) => {
    const { data } = await axiosInstance.get(`/statistical/categories`, {
      params: { periodInMonths },
    });
    return data;
  },
};
