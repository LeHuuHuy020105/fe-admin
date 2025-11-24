import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { 
  createImport, 
  getImportDetail, 
  updateImportQuantity, 
  deleteImportDetail,
  type ImportDetail 
} from "../../api/import_product/import";
import { getAllSupplier, type Supplier } from "../../api/supplier/supplier";
import { getAllProduct, getDetailProduct } from "../../api/product/product";
import { formatCurrency } from "../../helper/Currency";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  importId?: number | null; // Thêm prop này để biết là đang sửa hay tạo
}

// Mở rộng interface để lưu thêm importDetailId khi đang sửa
interface ImportDetailRow extends Omit<ImportDetail, 'quantity' | 'unitPrice'> {
    importDetailId?: number; // ID chi tiết dòng nhập (dùng khi sửa)
    productId?: number | ""; 
    quantity: number | ""; 
    unitPrice: number | "";
    // Các trường hiển thị khi ở chế độ sửa (vì ko load lại product list full)
    displayProductName?: string;
    displayVariantName?: string;
}

export default function ImportDialog({ isOpen, onClose, onSuccess, importId }: ImportDialogProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<any[]>([]); 
  
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<ImportDetailRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Kiểm tra chế độ Edit
  const isEditMode = !!importId;

  useEffect(() => {
    if (isOpen) {
      // 1. Load Suppliers & Products (Chỉ cần thiết khi tạo mới)
      if (!isEditMode) {
          getAllSupplier({ page: 1, size: 100, status: "ACTIVE" }).then((res) => {
            if (res.success) setSuppliers(res.data.data || []);
          });

          getAllProduct({ page: 1, size: 100 }).then((res: any) => {
             if(res.success) {
                 setProducts(Array.isArray(res.data.data) ? res.data.data : []); 
             }
          });
          
          // Reset form tạo mới
          setSupplierId("");
          setDescription("");
          setDetails([{ productId: "", productVariantId: 0, quantity: 1, unitPrice: 0 }]);
      } 
      // 2. Nếu là Edit Mode -> Load chi tiết phiếu nhập
      else {
          setLoading(true);
          getImportDetail(importId).then((res) => {
              if (res.success && res.data) {
                  const data = res.data;
                  setSupplierId(data.supplierResponse.id);
                  // Mock supplier list chỉ chứa supplier hiện tại để hiển thị đúng
                  setSuppliers([data.supplierResponse]); 
                  setDescription(data.description || "");
                  
                  // Map dữ liệu từ API về structure của state details
                  const mappedDetails: ImportDetailRow[] = data.importDetailResponses.map((item: any) => ({
                      importDetailId: item.id,
                      productId: "", // Không cần thiết ở mode edit vì read-only
                      productVariantId: item.productVariantResponse.id,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      // Lưu tên để hiển thị text thay vì dropdown
                      displayProductName: item.productVariantResponse.productName || "Sản phẩm", 
                      displayVariantName: `${item.productVariantResponse.sku} - ${
                          item.productVariantResponse.variantAttributes.map((a:any) => `${a.attribute}: ${a.value}`).join(", ")
                      }`
                  }));
                  setDetails(mappedDetails);
              }
          }).finally(() => setLoading(false));
      }
    }
  }, [isOpen, importId]);

  // --- Logic xử lý ---

  const handleProductChange = async (index: number, newProductId: number) => {
      if (isEditMode) return; // Không cho đổi sản phẩm khi sửa
      const newDetails = [...details];
      newDetails[index].productId = newProductId;
      newDetails[index].productVariantId = 0;
      newDetails[index].unitPrice = 0;
      setDetails(newDetails);

      if (!newProductId) return;

      const productInState = products.find(p => p.id === newProductId);
      const hasVariants = productInState && Array.isArray(productInState.productVariant) && productInState.productVariant.length > 0;

      if (!hasVariants) {
          try {
              const res = await getDetailProduct(newProductId);
              if (res.success && res.data) {
                  setProducts(prevProducts => 
                      prevProducts.map(p => p.id === newProductId ? res.data : p)
                  );
              }
          } catch (error) {
              console.error("Không thể tải biến thể sản phẩm", error);
          }
      }
  };

  const handleDetailChange = (index: number, field: keyof ImportDetailRow, value: any) => {
    // Ở chế độ edit, chặn sửa unitPrice nếu muốn (tuỳ nghiệp vụ), ở đây chặn sửa Variant
    if (isEditMode && (field === 'productVariantId' || field === 'unitPrice')) return; 

    const newDetails = [...details];
    // @ts-ignore
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const addRow = () => {
    if (isEditMode) return; // Không cho thêm dòng khi sửa (do API hạn chế)
    setDetails([...details, { productId: "", productVariantId: 0, quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = async (index: number) => {
    // Nếu đang sửa, gọi API xóa ngay lập tức
    if (isEditMode && importId) {
        const item = details[index];
        if (item.importDetailId) {
            if (!window.confirm("Bạn có chắc chắn muốn xóa dòng này? Hành động sẽ lưu ngay lập tức.")) return;
            
            setLoading(true);
            const res = await deleteImportDetail(importId, item.importDetailId);
            setLoading(false);
            
            if (res.success) {
                toast.success("Đã xóa chi tiết nhập");
                // Xóa khỏi state UI
                setDetails(details.filter((_, i) => i !== index));
                // Nếu xóa hết dòng -> Đóng dialog hoặc refresh để xử lý logic rỗng (tuỳ backend)
                if (details.length <= 1) onSuccess(); 
            } else {
                toast.error("Xóa thất bại: " + res.error);
            }
        }
    } else {
        // Chế độ tạo mới: chỉ xóa khỏi UI
        if (details.length > 1) {
            setDetails(details.filter((_, i) => i !== index));
        }
    }
  };

  const calculateTotal = () => {
    return details.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  };

  const getVariantName = (variant: any) => {
      if(!variant?.variantAttributes || !Array.isArray(variant.variantAttributes) || variant.variantAttributes.length === 0) {
          return "Mặc định";
      }
      return variant.variantAttributes.map((attr: any) => `${attr.attribute}: ${attr.value}`).join(", ");
  };

  const handleSubmit = async () => {
    if (!isEditMode && !supplierId) {
        toast.error("Vui lòng chọn nhà cung cấp");
        return;
    }
    
    // Validate chung
    const validDetails = details.filter(d => Number(d.quantity) > 0);
    if (validDetails.length === 0) {
        toast.error("Vui lòng nhập số lượng hợp lệ");
        return;
    }

    setLoading(true);

    if (isEditMode && importId) {
        // === CHẾ ĐỘ SỬA: Gọi API Update Quantity ===
        const updatePayload = details.map(d => ({
            importDetailId: d.importDetailId!,
            quantity: Number(d.quantity)
        }));

        const res = await updateImportQuantity(importId, updatePayload);
        setLoading(false);
        if (res.success) {
            toast.success("Cập nhật phiếu nhập thành công!");
            onSuccess();
            onClose();
        } else {
            toast.error("Cập nhật thất bại: " + res.error);
        }

    } else {
        // === CHẾ ĐỘ TẠO MỚI ===
        const payload = {
            supplierId: Number(supplierId),
            description,
            importDetails: validDetails.map(d => ({
                productVariantId: Number(d.productVariantId),
                quantity: Number(d.quantity),
                unitPrice: Number(d.unitPrice)
            }))
        };

        const res = await createImport(payload);
        setLoading(false);
        if (res.success) {
            toast.success("Tạo phiếu nhập thành công!");
            onSuccess();
            onClose();
        } else {
            toast.error("Lỗi: " + res.error);
        }
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {isEditMode ? "Cập nhật phiếu nhập (Chỉ sửa số lượng)" : "Tạo phiếu nhập hàng"}
              </h3>
              <button onClick={onClose}><FiX size={24} className="text-slate-500" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Thông tin chung */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Nhà cung cấp</label>
                        <select 
                            className="w-full p-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                            value={supplierId}
                            onChange={(e) => setSupplierId(Number(e.target.value))}
                            disabled={isEditMode} // Không cho sửa NCC
                        >
                            <option value="">-- Chọn NCC --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Ghi chú</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                            placeholder="Nhập ghi chú..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={isEditMode} // Không cho sửa ghi chú
                        />
                    </div>
                </div>

                {/* Bảng sản phẩm */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold dark:text-white">Chi tiết nhập hàng</label>
                        {!isEditMode && (
                            <button onClick={addRow} className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition">
                                <FiPlus /> Thêm dòng
                            </button>
                        )}
                    </div>
                    
                    <div className="border rounded-xl overflow-hidden dark:border-slate-700">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="p-3 w-1/4">Sản phẩm</th>
                                    <th className="p-3 w-1/4">Phân loại (Variant)</th>
                                    <th className="p-3 w-24">Số lượng</th>
                                    <th className="p-3">Giá nhập</th>
                                    <th className="p-3">Thành tiền</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {details.map((row, idx) => {
                                    // Logic hiển thị dropdown hoặc text
                                    let productContent;
                                    let variantContent;

                                    if (isEditMode) {
                                        productContent = <div className="p-2 font-medium dark:text-slate-200">{row.displayProductName || "Sản phẩm"}</div>;
                                        variantContent = <div className="p-2 text-slate-600 dark:text-slate-400">{row.displayVariantName}</div>;
                                    } else {
                                        // Create Mode: Dropdown logic cũ
                                        const selectedProduct = products.find(p => p.id === Number(row.productId));
                                        let variantsOfProduct: any[] = [];
                                        if (selectedProduct) {
                                            const raw = selectedProduct.productVariant || selectedProduct.productVariants;
                                            if (Array.isArray(raw)) variantsOfProduct = raw;
                                        }
                                        productContent = (
                                            <select 
                                                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                                                value={row.productId}
                                                onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                                            >
                                                <option value="">-- Chọn sản phẩm --</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        );
                                        variantContent = (
                                            <select 
                                                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 disabled:bg-slate-100"
                                                value={row.productVariantId}
                                                onChange={(e) => handleDetailChange(idx, 'productVariantId', Number(e.target.value))}
                                                disabled={!row.productId} 
                                            >
                                                <option value={0}>-- Chọn phiên bản --</option>
                                                {variantsOfProduct.map((v: any) => (
                                                    <option key={v.id} value={v.id}>
                                                        {getVariantName(v)} (SKU: {v.sku || v.id})
                                                    </option>
                                                ))}
                                            </select>
                                        );
                                    }

                                    return (
                                    <tr key={idx} className="dark:text-slate-300">
                                        <td className="p-2">{productContent}</td>
                                        <td className="p-2">{variantContent}</td>
                                        <td className="p-2">
                                            <input 
                                                type="number" min="1"
                                                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 font-bold text-blue-600"
                                                value={row.quantity}
                                                onChange={(e) => handleDetailChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number" min="0"
                                                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                value={row.unitPrice}
                                                onChange={(e) => handleDetailChange(idx, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Nhập giá..."
                                                disabled={isEditMode} // Không cho sửa giá khi edit
                                            />
                                        </td>
                                        <td className="p-2 font-medium">
                                            {formatCurrency(Number(row.quantity) * Number(row.unitPrice))}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700" title="Xóa dòng">
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-2 text-lg font-bold dark:text-white">
                        <span>Tổng tiền:</span>
                        <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Hủy</button>
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                    {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật phiếu" : "Tạo phiếu nhập")}
                </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition.Root>
  );
}