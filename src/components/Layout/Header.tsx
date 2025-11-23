import { Bell, ChevronDown, Filter, Menu, Plus, Search, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/auth/auth";

export default function Header({sideBarCollapsed, onToggleSideBar}: {sideBarCollapsed: boolean; onToggleSideBar: () => void}) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getCurrentUser();
      if (res.success) {
        setUser(res.data.data);
      } else {
        console.error("Lỗi khi lấy user:", res.error);
      }
    };
    fetchUser();
  }, []);

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

          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100
          dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
            </span>
          </button>

          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100
          dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5"/>
          </button>

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

            <ChevronDown className="w-4 h-4 text-slate-400"/>
          </div>
        </div>
      </div>
    </div>
  );
}
