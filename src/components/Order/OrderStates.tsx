import { Clock, PackageCheck } from "lucide-react";

export function OrderLoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Clock className="mx-auto h-10 w-10 text-slate-400 animate-spin" />
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách đơn hàng...</div>
        </div>
    );
}

export function OrderEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="mx-auto size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <PackageCheck className="h-6 w-6 text-slate-500 dark:text-slate-300" />
            </div>
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">Không tìm thấy đơn hàng nào khớp bộ lọc hiện tại.</div>
        </div>
    );
}
