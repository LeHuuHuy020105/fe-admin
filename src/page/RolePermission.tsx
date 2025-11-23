import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RoleModal from "../components/Role/RoleModal";
import { getAllRoles } from "../api/user/user";
import { getRoleDetail, updateRoleStatus } from "../api/role/role";
import { MoreVertical, RefreshCcw, Trash2 } from "lucide-react";

interface Permission {
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  status: string;
  description: string;
  permissions: Permission[];
}

interface RoleApiResponse {
  data: Role[];
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

export default function RolePermission() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoles = async (page: number = 0) => {
    setLoading(true);
    try {
      const res: any = await getAllRoles(); // API phân trang
      if (res.success) {
        setRoles(res.data.data);
      } else {
        toast.error("Không load được roles");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEdit = async (roleId: number) => {
    try {
      const res: any = await getRoleDetail(roleId);
      if (res.success) {
        setSelectedRole(res.data);
        setIsModalOpen(true);
      } else {
        toast.error("Không load được chi tiết role");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi load chi tiết role");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    fetchRoles(); // reload table sau khi update / create
  };

  const handleUpdateStatus = async (roleId: number, status: string) => {
    try {
      const res = await updateRoleStatus(roleId,  status);
      if (res.success) {
        toast.success("Cập nhật thành công !");
        fetchRoles();
      } else {
        toast.error("Lỗi cập nhật role");
      }
    } catch (error: any) {
      toast.error(err || "Lỗi cập nhật role");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-400">
          Danh sách Role
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Tạo Role mới
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Permissions</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{role.id}</td>
              <td className="px-4 py-2">{role.name}</td>
              <td className="px-4 py-2">{role.description}</td>
              <td className="px-4 py-2">
                {role.permissions.slice(0, 3).map((p) => (
                  <span
                    key={p.name}
                    className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                  >
                    {p.name}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="inline-block text-xs text-gray-500 ml-1">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </td>

              {/* Hiển thị status */}
              <td className="px-4 py-2">
                {role.status === "ACTIVE" ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                    INACTIVE
                  </span>
                )}
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => handleEdit(role.id)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {role.status === "INACTIVE" ? ( // nếu đã xóa → hiện nút restore
                  <button
                    onClick={() => handleUpdateStatus(role.id, "ACTIVE")}
                    className="p-2 rounded-lg hover:bg-green-100 transition"
                  >
                    <RefreshCcw className="w-5 h-5 text-green-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(role.id, "INACTIVE")}
                    className="p-2 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal tạo / update */}
      <RoleModal
        role={selectedRole}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
