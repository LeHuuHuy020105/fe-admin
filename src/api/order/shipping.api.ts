import { axiosInstance } from "../axiosConfig";

export const ShippingAPI = {
    TransferGHN: async (orderId: number, requiredNote: string) => {
        const response = await axiosInstance.post(`/api/shipping/${orderId}/add?requiredNote=${requiredNote}`);
        return response.data;
    },
};
