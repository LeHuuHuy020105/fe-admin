import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import { formatCurrency } from "../helper/Currency";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getDetailProduct,
  restoreProduct,
} from "../api/product/product";
import toast from "react-hot-toast";
import ProductDialog from "../components/Product/ProductDialog";

interface ProductType {
  id: number;
  name: string;
  listPrice: number;
  salePrice: number;
  urlCoverImage: string;
  soldQuantity: number;
  avgRating: number;
  status: string;
  createdAt: string;
  updateAt: string;
}

export default function Product() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); // dữ liệu edit

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms sau khi user ngừng gõ

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, sort, page, size]);

  const fetchProducts = async () => {
    setLoading(true);
    const params: any = {
      sort,
      status: statusFilter,
      size,
    };

    if (!search || search.trim() === "") {
      params.page = page;
    }

    if (search && search.trim() !== "") {
      params.keyword = search.trim();
    }
    const result = await getAllProduct(params);
    if (result.success) {
      setProducts(result.data.data);
      setTotalPages(result.data.totalPages);
      setLoading(false);
    } else {
      toast.error("Lấy sản phẩm thất bại: " + result.error);
      setLoading(false); // ensure loading is turned off on error
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này không?"
    );
    if (!confirm) return;

    const res = await deleteProduct(productId);
    if (!res.success) toast.error("Xóa sản phẩm thất bại: " + res.error);
    else {
      toast.success("Xóa sản phẩm thành công!");
      fetchProducts();
      setSearch(""); // Reset form after delete
      setDebouncedSearch(""); // Reset debounce search
    }
  };

  const handleEditClick = async (productId: number) => {
    setLoading(true);
    const res = await getDetailProduct(productId);
    setLoading(false);
    if (res.success) {
      setEditingProduct(res.data);
      setIsDialogOpen(true);
    } else {
      toast.error("Lấy chi tiết sản phẩm thất bại: " + res.error);
    }
  };

  const handleSaveActive = async (productId: number) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn khôi phục sản phẩm này không?"
    );
    if (!confirm) return;

    const res = await restoreProduct(productId);
    if (!res.success) toast.error("Khôi phục sản phẩm thất bại: " + res.error);
    else {
      toast.success("Khôi phục sản phẩm thành công!");
      fetchProducts();
      setSearch(""); // Reset form after restore
      setDebouncedSearch(""); // Reset debounce search
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Sản phẩm
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          onClick={() => {
            setEditingProduct(null);
            setIsDialogOpen(true);
          }}
        >
          <FiPlus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* ProductDialog */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingProduct(null);
          setSearch(""); // Reset form after add/edit
          setDebouncedSearch(""); // Reset debounce search
        }}
        fetchData={() => {
          fetchProducts();
          setSearch(""); // Reset form after add/edit
          setDebouncedSearch(""); // Reset debounce search
        }}
        productData={editingProduct}
      />

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full md:w-1/2">
          <FiSearch
            className="absolute left-3 top-3 text-slate-500 dark:text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Do NOT call fetchProducts() here
            }}
          />
        </div>

        <div className="relative w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <FiChevronDown
            className="absolute right-3 top-3 text-slate-500 dark:text-slate-300 pointer-events-none"
            size={18}
          />
        </div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={p.urlCoverImage}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                  {p.name}
                </h3>
                <div className="space-y-1">
                  {p.listPrice !== p.salePrice && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-through">
                      {formatCurrency(p.listPrice)}
                    </p>
                  )}
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {formatCurrency(p.salePrice)}
                  </p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Trạng thái: {p.status}
                </p>
                <div className="flex justify-between pt-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    onClick={() => handleEditClick(p.id)}
                  >
                    <FiEdit2 size={16} /> Sửa
                  </button>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                      p.status === "INACTIVE"
                        ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-600"
                        : "bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-600"
                    }`}
                    onClick={() => {
                      if (p.status === "INACTIVE") handleSaveActive(p.id);
                      else handleDeleteProduct(p.id);
                    }}
                  >
                    {p.status === "INACTIVE" ? (
                      "Khôi phục"
                    ) : (
                      <>
                        <FiTrash2 size={16} /> Xóa
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-300 disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPage(idx + 1)}
            className={`px-3 py-1 rounded-lg ${
              idx + 1 === page
                ? "bg-indigo-600 text-white"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
