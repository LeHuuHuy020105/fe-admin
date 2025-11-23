import { useEffect, useMemo, useState, useCallback } from "react";
import { Bell, PackageCheck } from "lucide-react";
import { OrderAPI } from "../api/order/order.api";
import { ShippingAPI } from "../api/order/shipping.api";
import type { DeliveryStatus, OrderlistResponse } from "../components/Order/type";
import { OrderStats } from "../components/Order/OrderStats";
import { OrderFilters } from "../components/Order/OrderFilters";
import { OrderTable } from "../components/Order/OrderTable";
import { OrderLoadingState, OrderEmptyState } from "../components/Order/OrderStates";
import toast from "react-hot-toast";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/Firebase";

export default function AdminOrderPage() {
    const [activeStatus, setActiveStatus] = useState<"ALL" | DeliveryStatus>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<OrderlistResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders từ API
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await OrderAPI.getOrderAll();
            setOrders(response.data.data);
            console.log("Fetched orders:", response.data.data);
        } catch (error) {
            console.error(" Error fetching orders:", error);
            setOrders([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }, []);

    // Lần đầu load
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Realtime từ Firebase
    useEffect(() => {
        const adminOrdersRef = ref(db, "admin/orders");

        const unsubscribe = onValue(
            adminOrdersRef,
            (snapshot) => {
                const data = snapshot.val();
                console.log("Firebase admin orders changed:", data);

                // Tạo thông báo khi có thay đổi đơn hàng
                if (data) {
                    const orderIds = Object.keys(data);
                    const latestOrderId = orderIds[orderIds.length - 1];
                    const latestOrder = data[latestOrderId];

                    // Chỉ hiển thị toast nếu không phải lần đầu load
                    if (orders.length > 0) {
                        toast.success(`Đơn hàng #${latestOrder.id} đã được cập nhật!`, {
                            icon: <Bell />,
                            duration: 3000,
                        });
                    }
                }
                // Chỉ cần có thay đổi là gọi lại fetchOrders để sync list
                fetchOrders();
            },
            (err) => {
                console.error("Firebase admin orders error:", err);
            }
        );

        return () => unsubscribe();
    }, [fetchOrders, orders.length]);

    // Filter orders theo status + search keyword
    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];

        let result = orders;

        if (activeStatus !== "ALL") {
            result = result.filter((order) => order.deliveryStatus === activeStatus);
        }

        if (searchQuery.trim()) {
            const keyword = searchQuery.trim().toLowerCase();
            result = result.filter((order) => {
                const matchId = order.id.toString().includes(keyword);
                const matchCustomer = order.userResponse?.fullName?.toLowerCase().includes(keyword) || order.userResponse?.email?.toLowerCase().includes(keyword) || order.customerName?.toLowerCase().includes(keyword);
                const matchProducts = order.orderItemResponses?.some((item) => item.productVariantResponse?.sku?.toLowerCase().includes(keyword) || item.nameProductSnapShot?.toLowerCase().includes(keyword));

                return matchId || matchCustomer || matchProducts;
            });
        }

        return result;
    }, [activeStatus, searchQuery, orders]);

    // Xử lý trạng thái đơn hàng
    const handleStatusChange = async (orderId: number, newStatus: DeliveryStatus) => {
        const currentOrder = orders.find((order) => order.id === orderId);
        if (!currentOrder) {
            toast.error("Không tìm thấy đơn hàng");
            return;
        }
        const oldStatus = currentOrder.deliveryStatus;
        try {
            // PACKED -> SHIPPED
            if (oldStatus === "PACKED" && newStatus === "SHIPPED") {
                try {
                    console.log("Transferring to GHN:", orderId);
                    await ShippingAPI.TransferGHN(orderId, "CHOTHUHANG");
                    await OrderAPI.updateStatus(orderId, newStatus);
                    toast.success("Đã chuyển đơn hàng sang GHN và cập nhật trạng thái");
                } catch (shippingError) {
                    console.error("Failed to transfer to GHN:", shippingError);
                    toast.error("Chuyển đơn sang GHN thất bại, trạng thái đơn chưa được cập nhật");
                } finally {
                    await fetchOrders();
                }
                return;
            }
            // Case bình thường
            await OrderAPI.updateStatus(orderId, newStatus);
            await fetchOrders();
            toast.success("Cập nhật trạng thái đơn hàng thành công");
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Cập nhật trạng thái đơn hàng thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <PackageCheck className="w-6 h-6 text-blue-500" />
                    Quản lý đơn hàng
                </h1>
                <div className="flex items-center gap-4">
                    <OrderStats totalOrders={orders.length} />
                </div>
            </div>

            <OrderFilters activeStatus={activeStatus} onStatusChange={setActiveStatus} searchQuery={searchQuery} onSearchChange={setSearchQuery} orders={orders} filteredCount={filteredOrders.length} />

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                {loading ? <OrderLoadingState /> : filteredOrders.length === 0 ? <OrderEmptyState /> : <OrderTable orders={filteredOrders} onStatusChange={handleStatusChange} onRefresh={fetchOrders} />}
            </div>
        </div>
    );
}
