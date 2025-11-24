import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiPrinter, FiCalendar, FiUser, FiBox, FiFileText } from "react-icons/fi";
import { getImportDetail, type ImportProduct } from "../../api/import_product/import";
import { formatCurrency } from "../../helper/Currency";

interface ImportDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  importId: number | null;
}

export default function ImportDetailDialog({ isOpen, onClose, importId }: ImportDetailDialogProps) {
  const [data, setData] = useState<ImportProduct | null>(null);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu chi tiết khi mở dialog
  useEffect(() => {
    if (isOpen && importId) {
      setLoading(true);
      getImportDetail(importId)
        .then((res) => {
          if (res.success) {
            setData(res.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, importId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Đã hủy</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>;
    }
  };

  const renderVariantAttributes = (attributes: any[]) => {
    if (!attributes || attributes.length === 0) return "";
    return attributes.map(attr => `${attr.attribute}: ${attr.value}`).join(", ");
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
          >
            <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Chi tiết phiếu nhập #{data?.importCode || data?.id}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Xem thông tin chi tiết nhập hàng</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition" title="In phiếu">
                    <FiPrinter size={20} />
                  </button>
                  <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
                ) : data ? (
                  <div className="space-y-6">
                    {/* Thông tin chung */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FiUser /></div>
                           <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold">Nhà cung cấp</p>
                              <p className="font-medium text-slate-800 dark:text-white">{data.supplierResponse.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><FiFileText /></div>
                           <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold">Trạng thái</p>
                              <div className="mt-1">{getStatusBadge(data.status)}</div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {data.createdAt && (
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><FiCalendar /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Ngày tạo</p>
                                <p className="font-medium text-slate-800 dark:text-white">
                                    {new Date(data.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            </div>
                        )}
                        {data.updatedAt && (
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600"><FiCalendar /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Cập nhật lần cuối</p>
                                <p className="font-medium text-slate-800 dark:text-white">
                                    {new Date(data.updatedAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            </div>
                        )}
                      </div>
                      {data.description && (
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 text-gray-600"><FiBox /></div>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500 uppercase font-semibold">Ghi chú</p>
                              <p className="font-medium text-slate-800 dark:text-white truncate">{data.description}</p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Bảng sản phẩm */}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 border-l-4 border-blue-600 pl-3">
                        Danh sách sản phẩm
                      </h4>
                      <div className="border rounded-xl overflow-hidden border-slate-200 dark:border-slate-700">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-700/50 font-semibold text-slate-600 dark:text-slate-300">
                            <tr>
                              <th className="p-3">Sản phẩm / SKU</th>
                              <th className="p-3 text-center">Số lượng</th>
                              <th className="p-3 text-right">Đơn giá</th>
                              <th className="p-3 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data.importDetailResponses?.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:text-slate-300">
                                <td className="p-3">
                                  {/* Lấy SKU từ productVariantResponse */}
                                  <div className="font-medium text-blue-600 dark:text-blue-400">
                                    {item.productVariantResponse.sku}
                                  </div>
                                  {/* Lấy thuộc tính từ variantAttributes */}
                                  <div className="text-xs text-slate-500">
                                    {renderVariantAttributes(item.productVariantResponse.variantAttributes)}
                                  </div>
                                </td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-3 text-right font-medium text-slate-800 dark:text-white">
                                  {formatCurrency(item.totalPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                            <tr>
                              <td colSpan={3} className="p-3 text-right font-bold text-slate-600 dark:text-slate-400">
                                TỔNG CỘNG:
                              </td>
                              <td className="p-3 text-right font-bold text-blue-600 text-lg">
                                {formatCurrency(data.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-red-500">Không tìm thấy dữ liệu</div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                >
                  Đóng
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}