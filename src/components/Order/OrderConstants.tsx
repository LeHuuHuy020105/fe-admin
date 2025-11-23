import { Clock, CheckCircle, Box, Truck, PackageCheck, Ban } from "lucide-react";
import type { DeliveryStatus, StatusTab } from "./type";

export const STATUS_TABS: StatusTab[] = [
    { key: "ALL", label: "Tất cả đơn" },
    { key: "PENDING", label: "Chờ xử lý", icon: Clock },
    { key: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle },
    { key: "PACKED", label: "Đã đóng gói", icon: Box },
    { key: "SHIPPED", label: "Đang vận chuyển", icon: Truck },
    { key: "DELIVERED", label: "Đã giao", icon: PackageCheck },
    { key: "COMPLETED", label: "Hoàn thành", icon: PackageCheck },
    { key: "CANCELLED", label: "Đã huỷ", icon: Ban },
    { key: "REFUNDED", label: "Hoàn tiền", icon: Ban },
];

export const STATUS_COLORS: Record<DeliveryStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    PACKED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    SHIPPED: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    REFUNDED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PACKED: "Đã đóng gói",
    SHIPPED: "Đang vận chuyển",
    DELIVERED: "Đã giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã huỷ",
    REFUNDED: "Hoàn tiền",
};
