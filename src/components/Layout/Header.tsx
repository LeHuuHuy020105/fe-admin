import { Bell, ChevronDown, Filter, Menu, Plus, Search, Settings, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCurrentUser, logoutApi } from "../../api/auth/auth";
import { useNavigate } from "react-router-dom";

export default function Header({sideBarCollapsed, onToggleSideBar}: {sideBarCollapsed: boolean; onToggleSideBar: () => void}) {
  const [user, setUser] = useState<any | null>(null);
 const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getCurrentUser();
      console.log("res ", res.data)
      if (res.success) {
        setUser(res.data);
      } else {
        console.error("Lỗi khi lấy user:", res.error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    navigate("/login");
  };

  return (
    <div
      className="bg-white/-80 dark:bg-slate-900/80 backdrop-blur-xl border-b
    border-slate-200/50 dark:border-slate-700/50 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={onToggleSideBar}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Welcome back , {user?.fullName || "Guest"}! here's what's happening today
            </p>
          </div>
        </div>

        {/* Center */}

        <div className="flex items-center space-x-3">

          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <img
              src={user?.avatar || "/assest/default-avatar.webp"}
              alt="User"
              className="w-8 h-8 rounded-full ring-2 ring-blue-500 object-cover"
            />
            <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{user?.fullName || "Guest"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors flex items-center gap-1"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
