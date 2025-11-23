import type { DeliveryStatus } from "../../components/Order/type";
import { axiosInstance } from "../axiosConfig";

export const OrderAPI = {
    // Lấy tất cả đơn hàng (admin)
    getOrderAll: async () => {
        const response = await axiosInstance.get("/orders/admin/list?isAll=true&page=0&size=1000");
        return response.data;
    },

    getOrderPage: async (page: number, size: number) => {
        const response = await axiosInstance.get(`/orders/admin/list?isAll=false&page=${page}&size=${size}`);
        return response.data;
    },

    // Thay đổi trạng thái đơn hàng
    updateStatus: async (orderId: number, newStatus: DeliveryStatus) => {
        const response = await axiosInstance.post(`/orders/changestatus/${orderId}?status=${newStatus}`);
        return response;
    },

    // Lấy chi tiết đơn hàng
    getOrderDetail: async (orderId: number) => {
        const response = await axiosInstance.get(`/orders/admin/${orderId}`);
        return response.data;
    },

    confirmProductReceipt: async (orderId: number) => {
        const response = await axiosInstance.put(`/orders/complete/${orderId}`);
        return response;
    },
};
