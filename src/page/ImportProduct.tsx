import { useEffect, useState } from "react";
import { FiPlus, FiCheckCircle, FiXCircle, FiEye, FiEdit2 } from "react-icons/fi"; // Import thêm FiEdit2
import toast from "react-hot-toast";
import { getAllImports, confirmImport, cancelImport, type ImportProduct as ImportType } from "../api/import_product/import";
import ImportDialog from "../components/ImportProduct/ImportDialog";
import { formatCurrency } from "../helper/Currency";
import ImportDetailDialog from "../components/ImportProduct/ImportDetailDialog";

export default function ImportProductPage() {
  const [imports, setImports] = useState<ImportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Thêm state để quản lý ID đang sửa
  const [editingId, setEditingId] = useState<number | null>(null);

  const [viewId, setViewId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAllImports({ page, size: 10, sort: "id:desc" });
    if (res.success) {
      setImports(res.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleConfirm = async (id: number) => {
    if (!window.confirm("Xác nhận nhập kho? Kho sẽ được cập nhật số lượng.")) return;
    const res = await confirmImport(id);
    if (res.success) {
      toast.success("Đã nhập kho thành công!");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy phiếu này?")) return;
    const res = await cancelImport(id);
    if (res.success) {
      toast.success("Đã hủy phiếu nhập!");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  // Hàm mở modal sửa
  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsCreateOpen(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hoàn thành</span>;
      case "CANCELLED": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Đã hủy</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Nhập Hàng</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý phiếu nhập kho</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setIsCreateOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition"
        >
          <FiPlus size={20} /> Tạo phiếu nhập
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4">Mã phiếu</th>
              <th className="p-4">Nhà cung cấp</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Ngày cập nhật</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-500">
            {imports.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-200 dark:hover:bg-green-200/50">
                <td className="p-4 font-medium">#{item.id}</td>
                <td className="p-4">{item.supplierResponse.name}</td>
                <td className="p-4 text-slate-800">
                  {item.createdAt ? (
                    <div>
                      <div>{new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                    </div>
                  ) : "-"}
                </td>
                <td className="p-4 text-slate-800">
                  {item.updatedAt ? (
                    <div>
                      <div>{new Date(item.updatedAt).toLocaleString("vi-VN")}</div>
                    </div>
                  ) : "-"}
                </td>
                <td className="p-4 font-bold text-blue-600">{formatCurrency(item.totalAmount)}</td>
                <td className="p-4">{getStatusBadge(item.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {item.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleConfirm(item.id)}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg"
                          title="Xác nhận nhập kho"
                        >
                          <FiCheckCircle size={18} />
                        </button>

                        {/* Nút Sửa */}
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          title="Sửa phiếu nhập (Số lượng)"
                        >
                          <FiEdit2 size={18} />
                        </button>

                        <button
                          onClick={() => handleCancel(item.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                          title="Hủy phiếu"
                        >
                          <FiXCircle size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setViewId(item.id)}
                      className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                      title="Xem chi tiết"
                    >
                      <FiEye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {imports.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-500">Chưa có phiếu nhập hàng nào.</div>
        )}
      </div>

      <ImportDialog
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onSuccess={fetchData}
        importId={editingId} // Truyền ID vào dialog để kích hoạt chế độ sửa
      />
      <ImportDetailDialog
        isOpen={viewId !== null}
        onClose={() => setViewId(null)}
        importId={viewId}
      />
    </div>
  );
}