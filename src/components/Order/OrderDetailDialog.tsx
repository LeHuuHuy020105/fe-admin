import { X, Package, User, MapPin, CreditCard, Truck, FileText, CheckCircle } from "lucide-react";
import type { OrderDetail } from "./type";
import { STATUS_COLORS, STATUS_LABELS } from "./OrderConstants";
import { formatMoney, formatDateTime } from "../../helper/order";
import { OrderAPI } from "../../api/order/order.api";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface OrderDetailDialogProps {
    order: OrderDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirmReceipt?: () => void;
}

export function OrderDetailDialog({ order, isOpen, onClose, onConfirmReceipt }: OrderDetailDialogProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isOpen || !order) return null;

    const handleConfirmReceipt = async () => {
        if (!order) return;
        try {
            setIsConfirming(true);
            await OrderAPI.confirmProductReceipt(order.id);
            toast.success("Xác nhận nhận hàng thành công!");
            // Gọi callback để refresh danh sách
            if (onConfirmReceipt) {
                onConfirmReceipt();
            }
            onClose();
        } catch (error) {
            console.error("Lỗi khi xác nhận nhận hàng:", error);
            toast.error("Có lỗi xảy ra khi xác nhận nhận hàng!");
        } finally {
            setIsConfirming(false);
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            UNPAID: "Chưa thanh toán",
            PAID: "Đã thanh toán",
            REFUNDED: "Đã hoàn tiền",
            FAILED: "Thất bại",
        };
        return labels[status] || status;
    };

    const getPaymentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            CASH: "Tiền mặt",
            VNPAY: "VNPay",
            MOMO: "MoMo",
            BANKING: "Chuyển khoản",
        };
        return labels[type] || type;
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] 
                    overflow-hidden animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chi tiết đơn hàng #{order.id}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(order.userResponse?.userName || null)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Delivery Status */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái giao hàng</span>
                                </div>
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold ${STATUS_COLORS[order.deliveryStatus as keyof typeof STATUS_COLORS] || "bg-slate-100 text-slate-700"}`}>
                                    {STATUS_LABELS[order.deliveryStatus as keyof typeof STATUS_LABELS] || order.deliveryStatus}
                                </span>
                            </div>

                            {/* Payment Status */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Thanh toán</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{getPaymentStatusLabel(order.paymentStatus)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{getPaymentTypeLabel(order.paymentType)}</p>
                                </div>
                            </div>

                            {/* Tracking Code */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Mã vận đơn</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{order.orderTrackingCode || "Chưa có"}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Thông tin khách hàng</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Họ tên</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.userResponse?.fullName || order.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Số điện thoại</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.customerPhone || "Không có"}</p>
                                </div>
                                {order.userResponse?.email && (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{order.userResponse.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Địa chỉ giao hàng</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-slate-700 dark:text-slate-200">{order.deliveryAddress}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{[order.deliveryWardName, order.deliveryDistrictName, order.deliveryProvinceName].filter(Boolean).join(", ")}</p>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Sản phẩm</h3>
                            </div>
                            <div className="space-y-3">
                                {order.orderItemResponses?.map((item) => (
                                    <div key={item.orderItemId} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                        <img src={item.urlImageSnapShot || "/placeholder.png"} alt={item.nameProductSnapShot} className="w-20 h-20 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.nameProductSnapShot}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">SKU: {item.productVariantResponse?.sku || "N/A"}</p>
                                            {item.variantSnapShot && <p className="text-sm text-slate-500 dark:text-slate-400">{item.variantSnapShot}</p>}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    SL: <span className="font-semibold">{item.quantity}</span>
                                                </span>
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatMoney(item.finalPrice)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatMoney(item.finalPrice * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 border border-blue-200/60 dark:border-slate-700/60">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tổng kết đơn hàng</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">Tổng tiền hàng:</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-100">{formatMoney(order.originalOrderAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">Phí vận chuyển:</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-100">{formatMoney(order.totalFeeShip)}</span>
                                </div>
                                {order.discountValue > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">Giảm giá:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">-{formatMoney(order.discountValue)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-300 dark:bg-slate-600 my-3" />
                                <div className="flex justify-between">
                                    <span className="text-base font-semibold text-slate-800 dark:text-white">Tổng thanh toán:</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatMoney(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/60">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Ghi chú:</p>
                                <p className="text-sm text-amber-700 dark:text-amber-400">{order.note}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                        {/* Nút xác nhận nhận hàng - chỉ hiển thị khi đơn ở trạng thái DELIVERED */}
                        {order.deliveryStatus === "DELIVERED" && (
                            <button
                                onClick={handleConfirmReceipt}
                                disabled={isConfirming}
                                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 
                                text-white font-medium shadow-sm transition flex items-center gap-2 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isConfirming ? "Đang xử lý..." : "Xác nhận đã nhận hàng"}
                            </button>
                        )}

                        <div className={`flex items-center gap-3 ${order.deliveryStatus === "DELIVERED" ? "" : "ml-auto"}`}>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 
                                dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
