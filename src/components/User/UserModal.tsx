import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import {
  X,
  Trash2,
  Eye,
  EyeOff,
  Check,
  UploadCloud,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import { addUser, getAllRoles, updateRoleUser } from "../../api/user/user";
import { deleteFiles, uploadFiles } from "../../api/uploadFile/uploadFile";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: any[];
}

interface UserModalProps {
  user?: any | null;
  isOpen: boolean;
  onClose: () => void;
  fetchUser?: (userData: any) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  fetchUser,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData(user);
      setSelectedRoles(user.roles || []);
      setAvatarPreview(user.avatar || "/assest/default-avatar.webp");
    } else {
      setFormData({});
      setSelectedRoles([]);
      setAvatarPreview("");
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: Role) => {
    if (selectedRoles.find((r) => r.id === role.id)) {
      setSelectedRoles(selectedRoles.filter((r) => r.id !== role.id));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev: any) => ({ ...prev, avatarFile: null, avatar: null }));
    setAvatarPreview("");
  };

  const loadRoles = async () => {
    if (allRoles.length > 0 || loadingRoles) return;
    setLoadingRoles(true);
    try {
      const res: any = await getAllRoles();
      console.log("res ", res);
      if (res.success) {
        setAllRoles(res.data.data);
      } else {
        toast.error("Không thể load roles");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSave = async () => {
    let uploadedAvatarUrls: string[] = [];

    try {
      const payload = {
        fullName: formData.fullName,
        username: formData.userName,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        roleId: selectedRoles.map((r) => r.id), // ✔ trả về [1,2,3]
      };

      // 2) Gọi API tạo user
      const res = await addUser(payload);

      if (res.success) {
        toast.success(user ? "Cập nhật thành công!" : "Tạo user thành công!");
        fetchUser && fetchUser({});
        onClose();
        return;
      }

      // 3) Nếu API thất bại → rollback avatar đã upload
      if (uploadedAvatarUrls.length > 0) {
        await deleteFiles(uploadedAvatarUrls);
      }

      if (!res.success) {
        const error = res.error;

        // Nếu backend gửi array details → toast từng lỗi
        if (Array.isArray(error.details)) {
          error.details.forEach((msg: string) => toast.error(msg));
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Tạo user thất bại!");
        }

        return;
      }
    } catch (err: any) {
      console.log("Lỗi:", err);

      // rollback avatar nếu chưa rollback
      if (uploadedAvatarUrls.length > 0) {
        await deleteFiles(uploadedAvatarUrls);
      }

      toast.error(err.message || "Có lỗi xảy ra!");
    }
  };

  const handleUpdate = async()=>{
    try {
        const res = await updateRoleUser(user.id, selectedRoles.map((r) => r.id));
        if(res.success){
            toast.success("Cập nhật thành công");
            fetchUser();
            onClose();
        }else{
            toast.error("Cập nhật thất bại")
        }
    } catch (error) {
        toast.error(error);
    }
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="absolute inset-0 z-50" onClose={onClose}>
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
            <Dialog.Panel className="bg-white dark:bg-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-lg overflow-auto max-h-[90vh] sm:max-w-lg md:max-w-xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>

              <Dialog.Title className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">
                {user ? "Chi tiết user" : "Tạo mới user"}
              </Dialog.Title>

              <div className="flex flex-col gap-4">
                {/* Avatar Upload */}
                {/* Avatar – chỉ hiển thị khi update */}
                {user && (
                  <div className="flex items-center gap-4 justify-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-100">
                      <img
                        src={
                          avatarPreview && avatarPreview.trim() !== ""
                            ? avatarPreview
                            : "/assest/default-avatar.webp" //Avatar mặc định
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Basic fields */}
                <input
                  type="text"
                   disabled={!!user}
                  placeholder="Full Name"
                  value={formData.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                />
                <input
                  type="text"
                  disabled={!!user}
                  placeholder="Username"
                  value={formData.userName || ""}
                  onChange={(e) => handleChange("userName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                />
                <input
                  type="email"
                  disabled={!!user}
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                />
                <input
                  type="text"
                  disabled={!!user}
                  placeholder="Phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                />
                {!user && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password || ""}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {/* Gender & DOB */}
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <select
                    disabled={!!user}
                    value={formData.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full sm:w-1/2 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>

                  <input
                    disabled={!!user}
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) =>
                      handleChange("dateOfBirth", e.target.value)
                    }
                    className="w-full sm:w-1/2 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none mt-2 sm:mt-0 dark:text-slate-300"
                  />
                </div>

                {/* Roles multi-select */}
                <div className="flex flex-col gap-2 relative">
                  <label className="font-semibold text-slate-700 dark:text-slate-200">
                    Roles
                  </label>
                  <div className="flex flex-wrap gap-2 mb-1 ">
                    {selectedRoles.map((r) => (
                      <span
                        key={r.id}
                        className="flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-sm "
                      >
                        {r.name}
                        <button onClick={() => handleRoleToggle(r)}>
                          <Trash2 size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <Combobox value={null} onChange={handleRoleToggle}>
                    <Combobox.Button
                      className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none text-left dark:text-slate-300"
                      onClick={loadRoles}
                    >
                      Chọn role...
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {Array.isArray(allRoles) &&
                        allRoles.map((role) => (
                          <Combobox.Option
                            key={role.id}
                            value={role}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                                active
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {role.name}
                                </span>
                                {selected && (
                                  <span
                                    className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                      active ? "text-white" : "text-indigo-600"
                                    }`}
                                  >
                                    <Check size={16} />
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </Combobox>
                </div>

                <button
                  onClick={user ? handleUpdate : handleSave}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  {user ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
