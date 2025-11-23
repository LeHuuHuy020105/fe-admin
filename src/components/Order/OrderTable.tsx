import { User, Ellipsis } from "lucide-react";
import { useState } from "react";

import type { DeliveryStatus, OrderDetail, OrderlistResponse } from "./type";
import { STATUS_COLORS, STATUS_LABELS } from "./OrderConstants";
import { formatDateTime, formatMoney, getCustomerName } from "../../helper/order";
import { OrderAPI } from "../../api/order/order.api";
import { OrderDetailDialog } from "./OrderDetailDialog";

interface OrderTableProps {
    orders: OrderlistResponse[];
    onStatusChange: (orderId: number, newStatus: DeliveryStatus) => void;
    onRefresh?: () => void;
}

export function OrderTable({ orders, onStatusChange, onRefresh }: OrderTableProps) {
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewDetail = async (orderId: number) => {
        try {
            const response = await OrderAPI.getOrderDetail(orderId);
            setOrderDetail(response.data);
            setIsDialogOpen(true);
            console.log(" Order detail:", response.data);
        } catch (error) {
            console.error(" Error fetching order detail:", error);
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setOrderDetail(null);
    };

    // Đảm bảo orders luôn là array
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800/60">
                <tr>
                    <th className="text-left p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[120px]">Mã đơn</th>
                    <th className="text-left p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">Sản phẩm</th>
                    <th className="text-left p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[180px]">Khách hàng</th>
                    <th className="text-left p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[180px]">Ngày cập nhật</th>
                    <th className="text-center p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[130px]">Thanh toán</th>
                    <th className="text-right p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[120px]">Tổng tiền</th>
                    <th className="text-center p-3 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 w-[200px]">Trạng thái</th>
                </tr>
            </thead>

            <tbody>
                {safeOrders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        {/* Mã đơn */}
                        <td className="p-3 align-top">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-800 dark:text-slate-50 font-bold text-sm">#{order.id}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDateTime(order.createdAt)}</span>
                            </div>
                        </td>

                        {/* Sản phẩm */}
                        <td className="p-3 align-top text-slate-700 dark:text-slate-200 text-xs">
                            <div className="space-y-0.5">
                                {order.orderItemResponses?.slice(0, 3).map((item) => (
                                    <div key={item.orderItemId} className="flex items-center justify-between gap-2">
                                        <span className="truncate max-w-[500px] font-medium">{item.nameProductSnapShot}</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap">×{item.quantity}</span>
                                    </div>
                                ))}
                                {(order.orderItemResponses?.length || 0) > 3 && <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">+{order.orderItemResponses.length - 3} sản phẩm</div>}
                            </div>
                        </td>

                        {/* Khách hàng */}
                        <td className="p-3 align-top text-xs">
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100">
                                    <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                    <span className="font-medium truncate">{getCustomerName(order)}</span>
                                </div>
                                {order.userResponse?.phone && <span className="text-[10px] text-slate-500 dark:text-slate-400">{order.userResponse.phone}</span>}
                            </div>
                        </td>
                        {/* Ngày cập nhật */}
                        <td className="p-3 align-top text-xs">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-slate-800 dark:text-slate-100 font-medium">{formatDateTime(order.updatedAt)}</span>
                            </div>
                        </td>

                        {/* Thanh toán */}
                        <td className="p-3 align-top">
                            <div className="flex flex-col gap-1 items-center">
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
                                        order.paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                            : order.paymentStatus === "UNPAID"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                            : order.paymentStatus === "REFUNDED"
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}
                                >
                                    {order.paymentStatus === "PAID" ? "✓ Đã TT" : order.paymentStatus === "UNPAID" ? " Chưa TT" : order.paymentStatus === "REFUNDED" ? " Hoàn" : "X Lỗi"}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{order.paymentType === "CASH" ? " Tiền mặt" : order.paymentType === "VNPAY" ? " VNPay" : order.paymentType === "MOMO" ? " MoMo" : " CK"}</span>
                            </div>
                        </td>

                        {/* Tổng tiền */}
                        <td className="p-3 align-top text-right">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatMoney(order.totalAmount)}</span>
                        </td>

                        {/* Trạng thái & Actions */}
                        <td className="p-3 align-top">
                            <div className="flex flex-col gap-2 items-center">
                                {/* Status badge */}
                                <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-semibold w-full text-center ${STATUS_COLORS[order.deliveryStatus]}`}>{STATUS_LABELS[order.deliveryStatus]}</span>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 w-full">
                                    <select
                                        value={order.deliveryStatus}
                                        onChange={(e) => onStatusChange(order.id, e.target.value as DeliveryStatus)}
                                        className="flex-1 h-7 text-[10px] border border-slate-300 dark:border-slate-600 rounded-lg px-1.5 
                                        bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"] as DeliveryStatus[]).map((status) => (
                                            <option key={status} value={status}>
                                                {STATUS_LABELS[status]}
                                            </option>
                                        ))}
                                    </select>

                                    <button onClick={() => handleViewDetail(order.id)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer" title="Xem chi tiết">
                                        <Ellipsis className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>

            {/* Dialog chi tiết đơn hàng */}
            <OrderDetailDialog order={orderDetail} isOpen={isDialogOpen} onClose={handleCloseDialog} onConfirmReceipt={onRefresh} />
        </table>
    );
}
