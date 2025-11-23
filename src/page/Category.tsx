import React, { useState, useEffect } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getCategoryList, deleteCategory, restoreCategory, addCategories, moveCategory, updateCategory } from "../api/category/category";

interface Category {
  id: number;
  name: string;
  childCategory: Category[];
  status?: string;
  createAt?: string;
  updatedAt?: string | null;
  locked?: boolean;
}



export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<number | 'root' | null>(null);
  const [newName, setNewName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editingFor, setEditingFor] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  // Reusable fetch function so we can re-sync after actions
  const fetchCategories = async () => {
    setLoading(true);
    const result = await getCategoryList();
    if (result.success) {
      // Lọc ra chỉ những category cấp 1 (không phải là con của category khác)
      const topLevel = result.data.filter((cat: Category) => {
        for (let item of result.data) {
          if (item.childCategory && item.childCategory.some((child: Category) => child.id === cat.id)) {
            return false;
          }
        }
        return true;
      });

      setCategories(topLevel);
    }
    setLoading(false);
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    void fetchCategories();
  }, []);

  // Tìm phần tử theo ID trong toàn bộ cây
  const findItemById = (items: Category[], id: number): { item: Category | null; parent: Category | null } => {
    for (let item of items) {
      if (item.id === id) return { item, parent: null };
      const result = findItemInChildren(item.childCategory, id, item);
      if (result.item) return result;
    }
    return { item: null, parent: null };
  };

  const findItemInChildren = (items: Category[], id: number, parent: Category): { item: Category | null; parent: Category | null } => {
    for (let item of items) {
      if (item.id === id) return { item, parent };
      const result = findItemInChildren(item.childCategory, id, item);
      if (result.item) return result;
    }
    return { item: null, parent: null };
  };

  // Xóa item từ cây
  const removeItemFromTree = (items: Category[], id: number): Category[] => {
    return items.reduce((acc, item) => {
      if (item.id === id) return acc;
      return [...acc, { ...item, childCategory: removeItemFromTree(item.childCategory, id) }];
    }, [] as Category[]);
  };

  // Thêm item vào children của target
  const addItemToTarget = (items: Category[], targetId: number, itemToAdd: Category): Category[] => {
    return items.map(item => {
      if (item.id === targetId) {
        return { ...item, childCategory: [...item.childCategory, itemToAdd] };
      }
      return { ...item, childCategory: addItemToTarget(item.childCategory, targetId, itemToAdd) };
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    
    if (!destination) return;

    const draggedId = parseInt(draggableId);
    const targetId = destination.droppableId === "root" ? null : parseInt(destination.droppableId);

    if (draggedId === targetId) return; // Không drop vào chính nó

    const { item: draggedItem } = findItemById(categories, draggedId);
    // Chặn nếu item bị lock hoặc status là INACTIVE
    if (!draggedItem || draggedItem.locked || draggedItem.status === "INACTIVE") return;

    // Nếu drop vào một item bị lock hoặc INACTIVE, không cho drop
    if (targetId !== null) {
      const { item: targetItem } = findItemById(categories, targetId);
      if (targetItem?.locked || targetItem?.status === "INACTIVE") return;
    }

    // Update local view optimistically
    let newCategories = removeItemFromTree(categories, draggedId);
    if (targetId !== null) {
      newCategories = addItemToTarget(newCategories, targetId, draggedItem);
    } else {
      newCategories = [...newCategories, draggedItem];
    }
    setCategories(newCategories);

    // Call backend to move
    (async () => {
      const payload = { categoryId: draggedId, categoryParentId: targetId };
      const res = await moveCategory(payload);
      if (res && res.success) {
        await fetchCategories();
      } else {
        console.error('Move failed', res?.error);
        // revert by re-fetching
        await fetchCategories();
        alert('Di chuyển không thành công');
      }
    })();
  };

  const toggleLock = async (id: number) => {
    const { item } = findItemById(categories, id);
    if (!item) return;

    let result;
    try {
      if (item.status === "ACTIVE") {
        // lock => call delete endpoint (makes it INACTIVE)
        result = await deleteCategory(id);
      } else {
        // restore => call restore endpoint (makes it ACTIVE)
        result = await restoreCategory(id);
      }
    } catch (err) {
      console.error("Toggle status request failed", err);
      alert("Lỗi khi gọi API");
      return;
    }

    if (result && result.success) {
      // Re-fetch from server to keep data fully in sync
      await fetchCategories();
    } else {
      console.error("Toggle status failed:", result?.error);
      alert("Thao tác không thành công");
    }
  };

  // Add new category (single item) under parentId (null for root)
  const handleAdd = async (parentId: number | null) => {
    if (!newName.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    setAddLoading(true);
    const payload = [
      {
        name: newName.trim(),
        parentId: parentId,
        childCategories: [],
      },
    ];
    const result = await addCategories(payload);
    setAddLoading(false);
    if (result && result.success) {
      setNewName("");
      setAddingFor(null);
      await fetchCategories();
    } else {
      console.error("Add failed:", result?.error);
      alert("Thêm thất bại");
    }
  };

  // Start inline edit for a category
  const startEdit = (cat: Category) => {
    if (cat.locked || cat.status === 'INACTIVE') return;
    setEditingFor(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingFor(null);
    setEditingName("");
  };

  const submitEdit = async (cat: Category) => {
    if (!editingName.trim()) { alert('Tên không được để trống'); return; }
    setUpdateLoading(cat.id);
    const payload: any = { id: cat.id, name: editingName.trim() };
    const res = await updateCategory(payload);
    setUpdateLoading(null);
    if (res && res.success) {
      await fetchCategories();
      cancelEdit();
    } else {
      console.error('Update failed', res?.error);
      alert('Cập nhật không thành công');
    }
  };

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id} style={{ marginLeft: `${level * 24}px` }} className="py-2">
      <Draggable 
        draggableId={category.id.toString()} 
        index={level}
        isDragDisabled={category.locked || category.status === "INACTIVE"}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`p-3 rounded mb-2 border-l-4 border-blue-500 transition-all flex items-center justify-between ${
              category.locked || category.status === "INACTIVE"
                ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 cursor-not-allowed opacity-75"
                : snapshot.isDragging 
                  ? "bg-blue-400 text-white shadow-lg scale-105 cursor-move" 
                  : "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-slate-600 shadow cursor-move"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
              {category.status === "INACTIVE" && (
                <span className="text-xs px-2 py-1 bg-red-500 text-white rounded">INACTIVE</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLock(category.id)}
                className={`px-2 py-1 rounded text-sm font-semibold transition-all ${
                  category.locked
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : category.status === "INACTIVE"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-900 dark:text-white"
                }`}
              >
                {category.locked ? "🔒 Mở" : category.status === "INACTIVE" ? "✓ Khôi phục" : "🔓 Khóa"}
              </button>

              <button
                onClick={() => { if (!category.locked && category.status !== "INACTIVE") setAddingFor(category.id); }}
                disabled={category.locked || category.status === "INACTIVE"}
                className={`px-2 py-1 rounded text-sm text-white ${
                  category.locked || category.status === "INACTIVE"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-400 hover:bg-green-500"
                }`}
              >
                ➕ Thêm con
              </button>

              <button
                onClick={() => startEdit(category)}
                disabled={category.locked || category.status === "INACTIVE"}
                className={`px-2 py-1 rounded text-sm ${category.locked || category.status === "INACTIVE" ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-400 hover:bg-indigo-500 text-white'}`}
              >
                ✏️ Sửa
              </button>
            </div>
          </div>
        )}
      </Draggable>

      {/* Inline add form for this category */}
      {addingFor === category.id && !category.locked && category.status !== "INACTIVE" && (
        <div className="ml-6 mt-2 flex gap-2 items-center">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="px-2 py-1 border rounded w-64 bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-slate-600"
            placeholder="Tên danh mục mới"
          />
          <button
            onClick={() => handleAdd(category.id)}
            disabled={addLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            {addLoading ? "Đang thêm..." : "Thêm"}
          </button>
          <button
            onClick={() => { setAddingFor(null); setNewName(""); }}
            className="px-3 py-1 bg-gray-200 rounded"
          >Hủy</button>
        </div>
      )}

      {/* Inline edit form */}
      {editingFor === category.id && (
        <div className="ml-6 mt-2 flex gap-2 items-center">
          <input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            className="px-2 py-1 border rounded w-64 bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-slate-600"
          />
          <button onClick={() => submitEdit(category)} disabled={updateLoading === category.id} className="px-3 py-1 bg-blue-500 text-white rounded">{updateLoading === category.id ? 'Đang lưu...' : 'Lưu'}</button>
          <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Hủy</button>
        </div>
      )}

      {category.childCategory.length > 0 && (
        <Droppable 
          droppableId={category.id.toString()} 
          type="CATEGORY"
          isDropDisabled={category.locked || category.status === "INACTIVE"}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`ml-6 p-3 rounded border-2 transition-all ${
                category.locked || category.status === "INACTIVE"
                  ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 opacity-50"
                  : snapshot.isDraggingOver 
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500" 
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              }`}
            >
              {category.childCategory.map((child) => renderCategory(child, level + 1))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Category Tree</h2>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setAddingFor('root')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >➕ Thêm danh mục cha</button>
        {addingFor === 'root' && (
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="px-2 py-1 border rounded w-64 bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-slate-600"
              placeholder="Tên danh mục mới"
            />
            <button
              onClick={() => handleAdd(null)}
              disabled={addLoading}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >{addLoading ? 'Đang thêm...' : 'Thêm'}</button>
            <button onClick={() => { setAddingFor(null); setNewName(''); }} className="px-3 py-1 bg-gray-200 rounded">Hủy</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600 dark:text-gray-300">Loading categories...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600 dark:text-gray-300">No categories found</div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="root" type="CATEGORY">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-6 rounded-lg border-2 transition-all ${
                  snapshot.isDraggingOver 
                    ? "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700" 
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                {categories.map((cat) => renderCategory(cat, 0))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
