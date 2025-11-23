import React, { useEffect, useState } from "react";
import { Users, MoreVertical, Search, Lock, Unlock } from "lucide-react";
import { getAllUser, updateUserStatus } from "../api/user/user";
import toast from "react-hot-toast";
import { CustomerModal } from "../components/Customer/CustomerModal";

interface Role { id: number; name: string; }
interface UserRank { id: number; name: string; }
interface User {
  id: number;
  fullName: string;
  gender: string | null;
  userName: string | null;
  email: string;
  status: string;
  point: number;
  userRankResponse: UserRank;
  roles: Role[];
}

export default function Customer() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res: any = await getAllUser({ keyword, page, size });
      if (res.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error("Lỗi khi tải danh sách khách hàng");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  const openUserModal = (user?: User) => {
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <span className="text-slate-800 dark:text-slate-400">
            Customer Management
          </span>
        </h1>
      </div>

      <CustomerModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4">
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
            <th className="p-4 text-left">Full Name</th>
            <th className="p-4 text-left">Username</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Point</th>
            <th className="p-4 text-left">Gender</th>
            <th className="p-4 text-left">User Rank</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t hover:bg-slate-50 dark:hover:bg-slate-300/50 transition"
            >
              <td className="p-4">{u.fullName || "-"}</td>
              <td className="p-4">{u.userName || "-"}</td>
              <td className="p-4">{u.email}</td>
              <td className="p-4">{u.point}</td>
              <td className="p-4">{u.gender || "-"}</td>
              <td className="p-4">{u.userRankResponse?.name || "-"}</td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button
                  onClick={() => openUserModal(u)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleLock(u)}
                  className={`p-2 rounded-lg transition ${
                    u.status === "ACTIVE"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {u.status === "ACTIVE" ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
