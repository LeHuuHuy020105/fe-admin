import React, { useEffect, useState, useRef } from "react";
import {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getUserRanks,
  getVouchers,
  getVouchersAdmin, // added
} from "../api/voucher/voucher";
import toast from "react-hot-toast";
import VoucherModal from "../components/Voucher/VoucherModal";


export default function Voucher() {
  const [userRanks, setUserRanks] = useState<any[]>([]);
  const sampleVouchers = [
    {
      id: 1,
      description: "Giảm 10%",
      type: "PERCENTAGE",
      discountValue: 10,
      totalQuantity: 100,
      startDate: "2024-06-01T00:00:00",
      endDate: "2024-06-30T23:59:59",
      usageLimitPerUser: 1,
      userRankId: 1,
      isShipping: false,
      status: "ACTIVE",
    },
  ];
  const [vouchers, setVouchers] = useState<any[]>(sampleVouchers);
  const [loading, setLoading] = useState(false);

  // Pagination & search state
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [keyword, setKeyword] = useState<string>(""); // for admin endpoint
  const [rankFilter, setRankFilter] = useState<string>(""); // rank id or name
  const [timeStatus, setTimeStatus] = useState<string>("all"); // all | valid | expired
  const [startDateFilter, setStartDateFilter] = useState<string>(""); // datetime-local string
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  // prevent double fetch when manually calling fetchVouchers and then setPage(0)
  const skipEffectRef = useRef(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [modalReadOnly, setModalReadOnly] = useState<boolean>(false);
 
  console.log("ran ", rankFilter)
  console.log("nnnn ", userRanks)
console.log("voucher " , vouchers)
  useEffect(() => {
    const fetchRanks = async () => {
      const res = await getUserRanks();
      if (res.success) setUserRanks(res.data);
      else toast.error("Lấy user rank thất bại");
    };
    fetchRanks();
  }, []);

  // helper to format datetime-local to backend expected LocalDateTime (with seconds)
  const formatForBackend = (dt?: string) => {
    if (!dt) return undefined;
    // datetime-local input gives "YYYY-MM-DDTHH:mm", backend expects seconds
    return dt.length === 16 ? dt + ":00" : dt;
  };

  // Fetch vouchers from API with pagination / search
  const fetchVouchers = async (opts?: { resetPage?: boolean }) => {
    setLoading(true);
    try {
      // call admin endpoint with filters
      const res = await getVouchersAdmin({
        page: opts?.resetPage ? 0 : page,
        size,
        keyword: keyword || undefined,
        rank: rankFilter || undefined,
        timeStatus: timeStatus === "all" ? null : timeStatus,
        startDate: formatForBackend(startDateFilter),
        endDate: formatForBackend(endDateFilter),
      });

      if (res.success) {
        const data = res.data;
        console.log("data voucher ", data)
        // Nếu backend trả Page object (content, totalPages...), xử lý; ngược lại nếu mảng thì dùng trực tiếp
        if (data && Array.isArray(data)) {
          setVouchers(data);
          setTotalPages(1);
        } else if (data && data.data) {
          setVouchers(data.data);
          setTotalPages(data.totalPages ?? 1);
          setPage(data.number ?? (opts?.resetPage ? 0 : page));
        } else {
          // fallback
          setVouchers(data ? (Array.isArray(data) ? data : []) : []);
          setTotalPages(1);
        }
      } else {
        toast.error("Lấy danh sách voucher thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi lấy voucher");
    }
    setLoading(false);
  };

  // initial & on page/size change
  useEffect(() => {
    if (skipEffectRef.current) {
      // skip one automatic fetch triggered by setPage(0) after manual fetch
      skipEffectRef.current = false;
      return;
    }
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // Search handler: call API with reset page, then reset UI filters
  const handleSearch = async () => {
    skipEffectRef.current = true;
    await fetchVouchers({ resetPage: true });
    // update page state so UI shows page 1 (no extra fetch because skipEffectRef is true)
    setPage(0);
    // reset filters in UI after searching (the result still shows the searched data)
    setKeyword("");
    setRankFilter("");
    setTimeStatus("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  // Open modal for create/update or view
  const openModal = (voucher?: any) => {
    setEditingVoucher(voucher || null);
    // nếu voucher bị DISABLE -> chỉ xem
    setModalReadOnly(!!voucher && voucher.status === "DISABLED");
    setShowModal(true);
  };

  // Save voucher (create/update)
  const handleSaveVoucher = async (form: any) => {
    // validate dates before sending
    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate);
      const e = new Date(form.endDate);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) {
        toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
        return;
      }
    }
    setLoading(true);
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined,
      minDiscountValue: form.minDiscountValue ? Number(form.minDiscountValue) : undefined,
      totalQuantity: Number(form.totalQuantity),
      usageLimitPerUser: Number(form.usageLimitPerUser),
      userRankId: Number(form.userRankId),
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endDate: form.endDate ? new Date(form.endDate) : undefined,
    };
    let res;
    if (editingVoucher) {
      res = await updateVoucher({ ...payload, id: editingVoucher.id });
    } else {
      res = await createVoucher(payload);
    }
    if (res.success) {
      toast.success(editingVoucher ? "Cập nhật thành công" : "Tạo voucher thành công");
      setShowModal(false);
      setEditingVoucher(null);
      // fetch lại danh sách voucher (đặt lại page 0)
      setPage(0);
      fetchVouchers({ resetPage: true });
    } else {
      toast.error(res.error?.message || "Thao tác thất bại");
    }
    setLoading(false);
  };

  // toggle voucher status (DISABLE <-> ACTIVE)
  const handleToggleStatus = async (id: number, currentStatus?: string) => {
    const isDisabled = currentStatus === "DISABLED";
    const target = isDisabled ? "ACTIVE" : "DISABLED";
    const confirmMsg = isDisabled ? "Xác nhận khôi phục voucher?" : "Xác nhận vô hiệu hóa voucher?";
    if (!window.confirm(confirmMsg)) return;
    setLoading(true);
    const res = await deleteVoucher(id, target);
    if (res.success) {
      toast.success(isDisabled ? "Khôi phục thành công" : "Vô hiệu hóa thành công");
      // update local list
      setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, status: target } : v)));
    } else {
      toast.error(res.error?.message || "Thao tác thất bại");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-amber-50">🎟️ Quản lý Voucher</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Từ khóa..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400"
          />
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-100"
          >
            <option value="">Tất cả rank</option>
            {userRanks.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={timeStatus}
            onChange={(e) => setTimeStatus(e.target.value)}
            className="px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-100"
          >
            <option value="all">Tất cả</option>
            <option value="valid">Còn hiệu lực</option>
            <option value="expired">Hết hiệu lực</option>
          </select>
          <input
            type="datetime-local"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-100"
            placeholder="Start"
          />
          <input
            type="datetime-local"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-100"
            placeholder="End"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Tìm
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={() => openModal()}
          >
            + Tạo voucher
          </button>
        </div>
      </div>

      {/* Danh sách voucher */}
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 text-slate-200">
        <h2 className="text-lg font-semibold mb-4">Danh sách voucher</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="text-left text-slate-100">
                <th className="py-2 px-3">Mô tả</th>
                <th className="py-2 px-3">Loại</th>
                <th className="py-2 px-3">Giá trị</th>
                <th className="py-2 px-3">Số lượng</th>
                <th className="py-2 px-3">Ngày bắt đầu</th>
                <th className="py-2 px-3">Ngày kết thúc</th>
                <th className="py-2 px-3">User Rank</th>
                <th className="py-2 px-3">Vận chuyển</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400">
                    Không có voucher
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-600/30">
                    <td className="py-2 px-3 align-top">{v.discription}</td>
                    <td className="py-2 px-3 align-top">{v.type}</td>
                    <td className="py-2 px-3 align-top">
                      {v.type === "PERCENTAGE" ? `${v.discountValue}%` : `${v.discountValue}`}
                    </td>
                    <td className="py-2 px-3 align-top">{v.totalQuantity}</td>
                    <td className="py-2 px-3 align-top">
                      {v.startDate ? new Date(v.startDate).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 px-3 align-top">
                      {v.endDate ? new Date(v.endDate).toLocaleString() : "-"}
                    </td>
                    <td className="py-2 px-3 align-top">
                      {v.userRankResponse?.name}
                    </td>
                    <td className="py-2 px-3 align-top">{v.isShipping ? "Có" : "Không"}</td>
                    <td className="py-2 px-3 align-top">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          v.status === "ACTIVE" ? "bg-green-600" : "bg-gray-600"
                        }`}
                      >
                        {v.status || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-3 align-top">
                      <button
                        className={`px-2 py-1 rounded mr-2 ${v.status === "DISABLED" ? "bg-gray-500 text-white" : "bg-blue-500 text-white"}`}
                        onClick={() => openModal(v)}
                      >
                        {v.status === "DISABLED" ? "Xem" : "Sửa"}
                      </button>
                      <button
                        className={`px-2 py-1 rounded ${v.status === "DISABLED" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                        onClick={() => handleToggleStatus(v.id, v.status)}
                      >
                        {v.status === "DISABLED" ? "Khôi phục" : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-300">
            Hiển thị trang {page + 1} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.max(1, totalPages) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`px-3 py-1 rounded ${idx === page ? "bg-indigo-600" : "bg-slate-700 text-white"}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
            >
              Next
            </button>

            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="ml-3 bg-slate-800 text-white px-2 py-1 rounded"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-3 text-sm text-slate-300">Đang tải...</div>
        )}
      </div>

      {/* Thẻ ảnh cũ (xóa/replace) */}
      <div className="flex justify-center mt-6">
        <img
          src={"/assest/panel.jpg"}
          alt="Membership tiers"
          className="w-full max-w-3xl rounded-lg shadow-md object-cover"
        />
      </div>

      {/* Modal tạo/cập nhật voucher */}
      {showModal && (
        <VoucherModal
          isOpen={showModal}
          readOnly={modalReadOnly}
          onClose={() => {
            setShowModal(false);
            setEditingVoucher(null);
            setModalReadOnly(false);
          }}
          onSave={handleSaveVoucher}
          loading={loading}
          userRanks={userRanks}
          initialData={editingVoucher}
        />
      )}
    </div>
  );
}
