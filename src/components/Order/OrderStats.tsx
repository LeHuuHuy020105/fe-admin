interface OrderStatsProps {
    totalOrders: number;
}

export function OrderStats({ totalOrders }: OrderStatsProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200
                border border-slate-200/70 dark:border-slate-700/70 text-sm hover:bg-slate-200
                dark:hover:bg-slate-700 transition"
            >
                Tổng: <span className="font-semibold ml-1">{totalOrders}</span> đơn
            </button>
        </div>
    );
}
