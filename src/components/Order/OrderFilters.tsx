import { Search } from "lucide-react";
import type { DeliveryStatus, OrderlistResponse } from "./type";
import { STATUS_TABS } from "./OrderConstants";

interface OrderFiltersProps {
    activeStatus: "ALL" | DeliveryStatus;
    onStatusChange: (status: "ALL" | DeliveryStatus) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    orders: OrderlistResponse[];
    filteredCount: number;
}

export function OrderFilters({ activeStatus, onStatusChange, searchQuery, onSearchChange, orders, filteredCount }: OrderFiltersProps) {
    // Đảm bảo orders luôn là array
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            {/* Tabs status */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {STATUS_TABS.map(({ key, label, icon: Icon }) => {
                    const count = key === "ALL" ? safeOrders.length : safeOrders.filter((o) => o.deliveryStatus === key).length;
                    const isActive = activeStatus === key;

                    return (
                        <button
                            key={key}
                            onClick={() => onStatusChange(key)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm border
                            ${
                                isActive ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
                            } transition whitespace-nowrap`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${isActive ? "bg-white/15 text-slate-50" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Search row */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn, SKU, Tên sản phẩm, Tên / Email khách..."
                        className="w-full pl-11 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800
                            text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700
                            focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Đang hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredCount}</span> đơn hàng
                </div>
            </div>
        </div>
    );
}
