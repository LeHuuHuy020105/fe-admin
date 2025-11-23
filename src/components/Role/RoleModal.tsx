import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createRole, getAllPermission, updateRole } from "../../api/role/role";

// Interfaces
interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RoleModalProps {
  role?: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleModal({ role, isOpen, onClose }: RoleModalProps) {
  const [formData, setFormData] = useState<Role>({
    name: "",
    description: "",
    permissions: [],
  });

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  console.log("Permission " , formData.permissions)
  // Khi mở modal: load role nếu có và fetch tất cả permission
  useEffect(() => {
    if (isOpen) {
      if (role) {
        setFormData(role);
      } else {
        setFormData({ name: "", description: "", permissions: [] });
      }
      fetchAllPermissions();
    }
  }, [role, isOpen]);

  const fetchAllPermissions = async () => {
    setLoadingPerms(true);
    try {
      const res: any = await getAllPermission();
      if (res.success) {
        setAllPermissions(res.data.data || []);
      } else {
        toast.error("Không tải được permissions");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải permissions");
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (perm: Permission) => {
    const exists = formData.permissions.find((p) => p.name === perm.name);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p.name !== perm.name),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, perm],
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Chuyển formData.permissions từ object sang id
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions.map((p: any) => p.id), // cần đảm bảo p có id
      };

      if (role?.id) {
        const res = await updateRole(role.id, payload);
        if (res.success) {
          toast.success("Cập nhật role thành công!");
        } else {
          toast.error("Cập nhật role thất bại");
        }
        toast.success("Cập nhật role thành công!");
      } else {
        const res = await createRole(payload);
        if (res.success) {
          toast.success("Tạo role thành công!");
        } else {
          toast.error("Tạo role thất bại");
        }
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu role");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-30"
          leave="ease-in duration-200"
          leaveFrom="opacity-30"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" />
        </Transition.Child>

        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg overflow-auto max-h-[90vh]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <Dialog.Title className="text-xl font-semibold mb-4 text-center">
                {role ? "Cập nhật Role" : "Tạo Role mới"}
              </Dialog.Title>

              <div className="flex flex-col gap-4">
                {/* Input tên và mô tả */}
                <input
                  type="text"
                  placeholder="Tên Role"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Mô tả"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                {/* Checkbox permission */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Chọn Permissions</label>
                  <div className="max-h-40 overflow-auto border rounded p-2">
                    {loadingPerms ? (
                      <p>Đang tải permissions...</p>
                    ) : (
                      allPermissions.map((perm) => (
                        <label
                          key={perm.name}
                          className="flex items-center gap-2 mb-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              !!formData.permissions.find(
                                (p) => p.name === perm.name
                              )
                            }
                            onChange={() => togglePermission(perm)}
                          />
                          <span>{perm.name}</span>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Badge permissions đã chọn */}
                  {formData.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.permissions.map((p) => (
                        <span
                          key={p.name}
                          className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                        >
                          {p.name}
                          <button
                            onClick={() => togglePermission(p)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  {role ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
