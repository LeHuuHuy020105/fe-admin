import type { OrderlistResponse } from "../components/Order/type";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
//  Format tiền VND
export const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount || 0);
};

//  Format ngày giờ
export const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
        return format(new Date(dateString), "HH:mm dd/MM/yyyy", { locale: vi });
    } catch {
        return "—";
    }
};

//  Lấy tên khách hàng
export const getCustomerName = (order: OrderlistResponse): string => {
    return order.userResponse?.fullName || order.customerName || "Khách lạ";
};
