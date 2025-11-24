import React, { useState, useEffect } from "react";

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  loading: boolean;
  userRanks: any[];
  initialData?: any;
  readOnly?: boolean;
}

export default function VoucherModal({
  isOpen,
  onClose,
  onSave,
  loading,
  userRanks,
  initialData,
  readOnly = false,
}: VoucherModalProps) {
  const [form, setForm] = useState<any>({
    discription: "",
    type: "PERCENTAGE",
    discountValue: "",
    maxDiscountValue: "",
    minDiscountValue: "",
    totalQuantity: "",
    startDate: "",
    endDate: "",
    usageLimitPerUser: 1,
    userRankId: "",
    isShipping: false,
  });

  const [error, setError] = useState<string>("");

  console.log("form ", form);
  useEffect(() => {
    if (initialData) {
      setError("");
      setForm({
        discription: initialData.discription || "",
        type: initialData.type || "PERCENTAGE",
        discountValue: initialData.discountValue || "",
        maxDiscountValue: initialData.maxDiscountValue || "",
        minDiscountValue: initialData.minDiscountValue || "",
        totalQuantity: initialData.totalQuantity || "",
        startDate: initialData.startDate?.slice(0, 16) || "",
        endDate: initialData.endDate?.slice(0, 16) || "",
        usageLimitPerUser: initialData.usageLimitPerUser || 1,
        userRankId: initialData.userRankResponse?.id ?? initialData.userRankId ?? "",
        isShipping: initialData.shipping || false,
      });
    } else {
      setError("");
      setForm({
        discription: "",
        type: "PERCENTAGE",
        discountValue: "",
        maxDiscountValue: "",
        minDiscountValue: "",
        totalQuantity: "",
        startDate: "",
        endDate: "",
        usageLimitPerUser: 1,
        userRankId: "",
        isShipping: false,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validate start < end if both provided
    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate);
      const en = new Date(form.endDate);
      if (isNaN(s.getTime()) || isNaN(en.getTime()) || s >= en) {
        setError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
        return;
      }
    }
    setError("");
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initialData ? "✏️ Cập nhật voucher" : "➕ Tạo voucher mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>
        {/* Form */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">Mô tả</label>
            <input
              type="text"
              value={form.discription}
              onChange={(e) => handleChange("discription", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
              required={!readOnly}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">Loại voucher</label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white"
              required={!readOnly}
              disabled={readOnly}
            >
              <option value="PERCENTAGE">Phần trăm</option>
              <option value="FIXED_AMOUNT">Số tiền</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">Giá trị giảm</label>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) => handleChange("discountValue", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
              required={!readOnly}
              disabled={readOnly}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">
                Giá trị giảm tối đa
              </label>
              <input
                type="number"
                value={form.maxDiscountValue}
                onChange={(e) => handleChange("maxDiscountValue", e.target.value)}
                className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-300">
                Giá trị đơn hàng tối thiểu
              </label>
              <input
                type="number"
                value={form.minDiscountValue}
                onChange={(e) => handleChange("minDiscountValue", e.target.value)}
                className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
                disabled={readOnly}
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">Số lượng</label>
            <input
              type="number"
              value={form.totalQuantity}
              onChange={(e) => handleChange("totalQuantity", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
              required={!readOnly}
              disabled={readOnly}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white"
                required={!readOnly}
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-300">Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white"
                required={!readOnly}
                disabled={readOnly}
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">Giới hạn mỗi user</label>
            <input
              type="number"
              value={form.usageLimitPerUser}
              onChange={(e) => handleChange("usageLimitPerUser", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white placeholder-slate-400"
              min={1}
              required={!readOnly}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">User Rank</label>
            <select
              value={form.userRankId}
              onChange={(e) => handleChange("userRankId", e.target.value)}
              className="w-full border border-slate-700 rounded px-3 py-2 bg-slate-800 text-white"
              required={!readOnly}
              disabled={readOnly}
            >
              <option value="">Chọn user rank</option>
              {userRanks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-300">
              Miễn phí vận chuyển?
            </label>
            <input
              type="checkbox"
              checked={form.isShipping}
              onChange={(e) => handleChange("isShipping", e.target.checked)}
              className="mr-2 accent-indigo-500"
              disabled={readOnly}
            />
          </div>
          {/* show validation error */}
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Đóng
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {loading ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo mới"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
