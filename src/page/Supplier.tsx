// src/page/Supplier.tsx
import React, { useEffect, useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiRefreshCw, FiMapPin, FiPhone, FiChevronDown } from "react-icons/fi";
import { deleteSupplier, getAllSupplier, restoreSupplier, type Supplier as SupplierType } from "../api/supplier/supplier";
import toast from "react-hot-toast";
import SupplierDialog from "../components/Supplier/SupplierDialog";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter & Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "ACTIVE" | "INACTIVE"
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchSuppliers = async () => {
    setLoading(true);
    const params: any = {
      page,
      size,
      keyword: debouncedSearch,
      status: statusFilter || undefined,
      sort: "id:desc" // Mặc định sắp xếp mới nhất
    };

    const res = await getAllSupplier(params);
    if (res.success) {
      setSuppliers(res.data.data); // Lưu ý: check lại cấu trúc trả về từ API thực tế (có thể là res.data.content hoặc res.data.data)
      setTotalPages(res.data.totalPages);
    } else {
      toast.error("Không thể tải danh sách nhà cung cấp");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [debouncedSearch, statusFilter, page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
    const res = await deleteSupplier(id);
    if (res.success) {
      toast.success("Đã xóa thành công!");
      fetchSuppliers();
    } else {
      toast.error("Xóa thất bại: " + res.error);
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm("Bạn muốn khôi phục nhà cung cấp này?")) return;
    const res = await restoreSupplier(id);
    if (res.success) {
      toast.success("Khôi phục thành công!");
      fetchSuppliers();
    } else {
      toast.error("Khôi phục thất bại: " + res.error);
    }
  };

  const openAddDialog = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: SupplierType) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Nhà Cung Cấp</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý đối tác cung ứng hàng hóa</p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
        >
          <FiPlus size={20} />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="relative min-w-[180px]">
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Không tìm thấy nhà cung cấp nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Tên nhà cung cấp</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Liên hệ</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Trạng thái</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 text-slate-500 dark:text-slate-400">#{item.id}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-white">{item.name}</td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <FiPhone className="text-blue-500" size={14} /> {item.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <FiMapPin className="text-gray-400" size={14} /> {item.address } {item.ward ? `, ${item.ward}` : ""} {item.district ? `, ${item.district}` : ""} {item.province ? `, ${item.province}` : ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(item)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        
                        {item.status === "INACTIVE" ? (
                           <button
                           onClick={() => handleRestore(item.id)}
                           className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                           title="Khôi phục"
                         >
                           <FiRefreshCw size={18} />
                         </button>
                        ) : (
                            <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            title="Xóa"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Trước
          </button>
          <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Sau
          </button>
        </div>
      )}

      {/* Dialog */}
      <SupplierDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fetchData={fetchSuppliers}
        supplierData={editingSupplier}
      />
    </div>
  );
}