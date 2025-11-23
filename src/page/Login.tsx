import React, { useState } from "react";
import { login } from "../api/auth/auth";
import {
  findByUserName,
  sendOTP,
  verifyOTP,
  forgotPassword,
} from "../api/user/user";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"username" | "otp" | "reset">(
    "username"
  );
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotUser, setForgotUser] = useState<any>(null);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotPasswordVal, setForgotPasswordVal] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
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
        // Check role
        const tokenPayload = JSON.parse(atob(result.token.split(".")[1]));
        const roles = Array.isArray(tokenPayload.role)
          ? tokenPayload.role
          : [tokenPayload.role];
        if (roles.length === 1 && roles[0] === "USER") {
          toast.error("Bạn không có quyền truy cập trang này!");
          setLoading(false);
          return;
        }
        toast.success("Đăng nhập thành công!");
        onLogin();
        navigate("/");
      } else {
        // Show backend error message if available
        const errorMsg =
          result.error?.message || result.error || "Đăng nhập thất bại";
        if (errorMsg === "Invalid password") {
          toast.error("Mật khẩu không đúng!");
        } else {
          if (errorMsg === "Your account is inactive") {
            toast.error("Tài khoản của bạn đang bị vô hiệu hóa!");
          } else {
            toast.error("Đăng nhập thất bại: " + errorMsg);
          }
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const handleFindUser = async () => {
    if (!forgotUsername.trim()) {
      toast.error("Vui lòng nhập username!");
      return;
    }
    setForgotLoading(true);
    const res = await findByUserName(forgotUsername.trim());
    if (res.success && res.data) {
      setForgotUser(res.data);
      setForgotStep("otp");
      // Send OTP
      await sendOTP(res.data.id, "PASSWORD_RESET");
      toast.success("Đã gửi mã OTP đến email của bạn!");
    } else {
      toast.error("Không tìm thấy user!");
    }
    setForgotLoading(false);
  };

  const handleVerifyForgotOtp = async () => {
    if (!/^\d{6}$/.test(forgotOtp)) {
      toast.error("OTP phải có 6 chữ số");
      return;
    }
    setForgotLoading(true);
    const res = await verifyOTP(forgotUser.id, forgotOtp, "PASSWORD_RESET");
    if (res.success && res.data) {
      setForgotResetToken(res.data);
      setForgotStep("reset");
      toast.success("Xác thực OTP thành công!");
    } else {
      toast.error("OTP không đúng!");
    }
    setForgotLoading(false);
  };

  const handleForgotPasswordReset = async () => {
    if (!forgotPasswordVal.trim() || !forgotConfirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu mới!");
      return;
    }
    if (forgotPasswordVal.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (forgotPasswordVal !== forgotConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setForgotLoading(true);
    const res = await forgotPassword(
      {
        userId: forgotUser.id,
        password: forgotPasswordVal,
        confirmPassword: forgotConfirmPassword,
      },
      forgotResetToken
    );
    if (res.success) {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setShowForgotModal(false);
      setForgotStep("username");
      setForgotUsername("");
      setForgotUser(null);
      setForgotOtp("");
      setForgotResetToken("");
      setForgotPasswordVal("");
      setForgotConfirmPassword("");
    } else {
      toast.error("Đổi mật khẩu thất bại: " + res.error);
    }
    setForgotLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
          Đăng nhập
        </h2>

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

        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="w-full mt-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
        >
          Quên mật khẩu?
        </button>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quên mật khẩu
              </h3>
              {forgotStep === "username" && (
                <>
                  <input
                    type="text"
                    placeholder="Nhập username"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleFindUser}
                      disabled={forgotLoading}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? "Đang kiểm tra..." : "Tiếp tục"}
                    </button>
                  </div>
                </>
              )}
              {forgotStep === "otp" && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã 6
                      chữ số để xác thực.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) =>
                      setForgotOtp(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotStep("username");
                        setForgotUsername("");
                        setForgotUser(null);
                        setForgotOtp("");
                        setForgotResetToken("");
                        setForgotPasswordVal("");
                        setForgotConfirmPassword("");
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleVerifyForgotOtp}
                      disabled={forgotLoading || forgotOtp.length !== 6}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? "Đang xác thực..." : "Xác thực"}
                    </button>
                  </div>
                </>
              )}
              {forgotStep === "reset" && (
                <>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={forgotPasswordVal}
                    onChange={(e) => setForgotPasswordVal(e.target.value)}
                    className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotStep("username");
                        setForgotUsername("");
                        setForgotUser(null);
                        setForgotOtp("");
                        setForgotResetToken("");
                        setForgotPasswordVal("");
                        setForgotConfirmPassword("");
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleForgotPasswordReset}
                      disabled={forgotLoading}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
