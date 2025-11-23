import React, { useEffect, useState } from "react";
import { Users, MoreVertical, Lock, Unlock, Search } from "lucide-react";
import { getAllUser, updateUserStatus } from "../api/user/user";
import toast from "react-hot-toast";
import { UserModal } from "../components/User/UserModal";

interface Role {
  id: number;
  name: string;
}
interface User {
  id: number;
  fullName: string;
  gender: string;
  userName: string;
  email: string;
  status: string;
  roles: Role[];
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [hasUserRole, setHasUserRole] = useState<boolean | null>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    const res: any = await getAllUser({ keyword, page, size, hasUserRole });
    if (res.success) {
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } else {
      toast.error(res.error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword, hasUserRole]);

  const toggleLock = async (user: User) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await updateUserStatus(user.id, newStatus);
      if (res.success) {
        toast.success(
          `User ${newStatus === "ACTIVE" ? "mở khoá" : "khoá"} thành công!`
        );
        fetchUsers();
      } else {
        toast.error("Có lỗi xảy ra !");
      }
    } catch (error: any) {
      toast.error(error.response?.data || error.message);
    }
  };

  const openUserModal = (user?: User) => {
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <span className="text-slate-800 dark:text-slate-400">
            Users Management
          </span>
        </h1>
        <button
          onClick={() => openUserModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        fetchUser={fetchUsers}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Users */}
        <div className="relative w-full md:w-1/2">
          <Search
            className="absolute left-3 top-3 text-slate-500 dark:text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-500 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full bg-white dark:bg-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <thead className="bg-slate-100 dark:bg-green-800/60">
          <tr>
            <th className="p-4 text-left">Username</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Gender</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t hover:bg-slate-50 dark:hover:bg-slate-300/50 transition"
            >
              <td className="p-4">{u.userName}</td>
              <td className="p-4">{u.fullName}</td>
              <td className="p-4">{u.email}</td>
              <td className="p-4">
                {u.roles.map((r) => (
                  <span
                    key={r.id}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs mr-1"
                  >
                    {r.name}
                  </span>
                ))}
              </td>
              <td className="p-4">{u.gender}</td>
              <td className="p-4">
                {u.status === "ACTIVE" ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                    Inactive
                  </span>
                )}
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button
                  onClick={() => toggleLock(u)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {u.status === "ACTIVE" ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Unlock className="w-5 h-5" />
                  )}
                </button>

                {/* Nút xem chi tiết */}
                <button
                  onClick={() => openUserModal(u)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <MoreVertical className="w-5 h-5" /> {/* hoặc icon khác */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
