import React, { useState } from "react";
import { login } from "../api/auth/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username, password });
      if (result.success) {
        toast.success("Đăng nhập thành công!");
        onLogin(); // cập nhật state App là đã login
        navigate("/");
      } else {
        toast.error("Đăng nhập thất bại: " + result.error);
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Đăng nhập</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}
