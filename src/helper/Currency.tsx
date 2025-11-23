export const formatCurrency = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });