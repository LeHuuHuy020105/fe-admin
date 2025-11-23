import { useState, useRef } from "react";
import { uploadFiles } from "../../api/uploadFile/uploadFile";
import { updateUser, changePassword, sendOTP, verifyOTP, changeEmail, verifyAccount } from "../../api/user/user";
import toast from "react-hot-toast";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: any;
}

type Tab = "info" | "email" | "password";

export default function ProfileEdit({ isOpen, onClose, onSave, user }: ProfileEditProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // track selected file

  // Info Tab State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Email Tab State
  const [emailOtpStep, setEmailOtpStep] = useState<"new" | "otp" | "verify">("new");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [emailResetToken, setEmailResetToken] = useState("");

  // Password Tab State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Email Verification State
  const [emailVerifyStep, setEmailVerifyStep] = useState<"idle" | "otp" | "done">("idle");
  const [emailVerifyOtp, setEmailVerifyOtp] = useState("");
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);

  console.log("emailVerifyOtp ", emailVerifyOtp )
  // Avatar upload preview only
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setUploadedAvatar(URL.createObjectURL(file)); // show preview
  };

  // Info Tab - Save
  const handleSaveInfo = async () => {
    if (!fullName.trim()) {
      alert("Vui lòng nhập tên đầy đủ");
      return;
    }

    const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
    if (phone && !phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = uploadedAvatar;
      // If user selected a new avatar, upload it now
      if (avatarFile) {
        const uploadedUrls = await uploadFiles(avatarFile);
        if (uploadedUrls && uploadedUrls.length > 0) {
          avatarUrl = uploadedUrls[0];
        }
      }

      const payload = {
        fullName: fullName.trim(),
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        phone: phone || undefined,
        avatar: avatarUrl || undefined,
      };

      const result = await updateUser(payload);
      if (result.success) {
        alert("Cập nhật thông tin thành công");
        await onSave();
        onClose();
      } else {
        alert(`Lỗi: ${result.error || "Không thể cập nhật thông tin"}`);
      }
    } catch (error) {
      console.error("Save info error:", error);
      alert("Lỗi khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  // Email Verification - Send OTP
  const handleSendEmailVerifyOtp = async () => {
    setEmailVerifyLoading(true);
    try {
      const result = await sendOTP(user.id, "VERIFICATION");
      if (result.success) {
        setEmailVerifyStep("otp");
        toast.success("Đã gửi mã OTP xác thực email");
      } else {
        toast.error(result.error || "Không thể gửi OTP xác thực email");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi OTP xác thực email");
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  // Email Verification - Verify OTP
  const handleVerifyEmailOtp = async () => {
    const otp = emailVerifyOtp.trim();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP phải có 6 chữ số");
      return;
    }
    setEmailVerifyLoading(true);
    try {
      const result = await verifyOTP(user.id, otp, "VERIFICATION");
      if (result.success && result.data) {
        // Call verifyAccount API
        const verifyRes = await verifyAccount(user.id, result.data);
        if (verifyRes.success) {
          setEmailVerifyStep("done");
          toast.success("Xác thực email thành công");
          await onSave();
        } else {
          toast.error(verifyRes.error || "Không thể xác thực email");
        }
      } else {
        toast.error("OTP không đúng");
      }
    } catch (error) {
      toast.error("Lỗi khi xác thực email");
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  // Email Tab - Send OTP for Change Email
  const handleSendEmailOtp = async () => {
    if (!newEmail.trim()) {
      alert("Vui lòng nhập email mới");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Email không hợp lệ");
      return;
    }

    setEmailOtpSending(true);
    try {
      const result = await sendOTP(user.id, "EMAIL_RESET");
      if (result.success) {
        setEmailOtpStep("otp");
      } else {
        alert(`Lỗi: ${result.error || "Không thể gửi OTP"}`);
      }
    } catch (error) {
      console.error("Send email OTP error:", error);
      alert("Lỗi khi gửi OTP");
    } finally {
      setEmailOtpSending(false);
    }
  };

  // Email Tab - Confirm Email Change (use changeEmail API)
  const handleConfirmEmailChange = async () => {
    setEmailOtpVerifying(true);
    try {
      const result = await changeEmail(newEmail, emailResetToken);
      if (result.success) {
        toast.success("Thay đổi email thành công");
        setEmailOtpStep("new");
        setNewEmail("");
        setEmailOtp("");
        setEmailResetToken("");
        await onSave();
      } else {
        alert(`Lỗi: ${result.error || "Không thể cập nhật email"}`);
      }
    } catch (error) {
      console.error("Confirm email change error:", error);
      alert("Lỗi khi thay đổi email");
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  // Password Tab - Change Password
  const handleChangePassword = async () => {
    setPasswordError("");

    if (!oldPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu cũ");
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordChanging(true);
    try {
      const payload = {
        oldPassword: oldPassword.trim(),
        password: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      };

      const result = await changePassword(payload);
      if (result.success) {
        alert("Đổi mật khẩu thành công");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        // Check for nested error message
        let errorMsg = result.error?.message || result.error;
        if (errorMsg === "Old password does not match") {
          toast.error("Mật khẩu cũ không đúng");
        } else if (errorMsg) {
          toast.error(errorMsg);
        }
        setPasswordError(errorMsg || "Không thể đổi mật khẩu");
        console.error("Change password failed:", result.error);
      }
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError("Lỗi khi đổi mật khẩu");
    } finally {
      setPasswordChanging(false);
    }
  };

  // Email Tab - Verify OTP for Change Email
  const handleVerifyEmailOtpChangeEmail = async () => {
    const otp = emailOtp.trim();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP phải có 6 chữ số");
      return;
    }
    setEmailOtpVerifying(true);
    try {
      const result = await verifyOTP(user.id, otp, "EMAIL_RESET");
      if (result.success) {
        setEmailResetToken(result.data);
        setEmailOtpStep("verify");
      } else {
        toast.error(`Lỗi: OTP không đúng`);
      }
    } catch (error) {
      console.error("Verify email OTP error:", error);
      alert("Lỗi khi xác thực OTP");
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✏️ Chỉnh sửa thông tin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 px-4 font-medium text-center transition-all ${
              activeTab === "info"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            👤 Thông tin cơ bản
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-3 px-4 font-medium text-center transition-all ${
              activeTab === "email"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            📧 Đổi email
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-3 px-4 font-medium text-center transition-all ${
              activeTab === "password"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            🔐 Đổi mật khẩu
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <img
                  src={uploadedAvatar || user?.avatar || "/assest/default-avatar.webp"}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-200 dark:border-indigo-700"
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tải..." : "📷 Thay đổi avatar"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={user?.userName || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên đầy đủ
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xxxxxxxxx hoặc +84..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveInfo}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <div className="space-y-6">
              {/* Show verify email if not verified */}
              {user?.verifiedEmail === false && (
                <div className="mb-6">
                  {emailVerifyStep === "idle" && (
                    <button
                      onClick={handleSendEmailVerifyOtp}
                      disabled={emailVerifyLoading}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailVerifyLoading ? "Đang gửi..." : "🔒 Xác thực email"}
                    </button>
                  )}
                  {emailVerifyStep === "otp" && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã 6 chữ số để xác thực email.
                        </p>
                      </div>
                      <input
                        type="text"
                        value={emailVerifyOtp}
                        onChange={(e) => {
                          // Only allow digits, max 6
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setEmailVerifyOtp(val);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setEmailVerifyStep("idle");
                            setEmailVerifyOtp("");
                          }}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                        >
                          Quay lại
                        </button>
                        <button
                          onClick={handleVerifyEmailOtp}
                          disabled={emailVerifyLoading || !/^\d{6}$/.test(emailVerifyOtp)}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailVerifyLoading ? "Đang xác thực..." : "✓ Xác thực"}
                        </button>
                      </div>
                    </div>
                  )}
                  {emailVerifyStep === "done" && (
                    <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-200">
                        ✓ Email đã được xác thực thành công!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Only allow change email if verified */}
              {user?.verifiedEmail === true && (
                <>
                  {emailOtpStep === "new" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email hiện tại
                        </label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email mới
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Nhập email mới"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSendEmailOtp}
                          disabled={emailOtpSending || !newEmail.trim()}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailOtpSending ? "Đang gửi..." : "📧 Gửi mã OTP"}
                        </button>
                      </div>
                    </>
                  )}

                  {emailOtpStep === "otp" && (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Mã OTP đã được gửi đến email mới của bạn. Vui lòng nhập mã 6 chữ số để xác thực.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mã OTP (6 chữ số)
                        </label>
                        <input
                          type="text"
                          value={emailOtp}
                          onChange={(e) => {
                            // Only allow digits, max 6
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setEmailOtp(val);
                          }}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEmailOtpStep("new")}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                        >
                          Quay lại
                        </button>
                        <button
                          onClick={handleVerifyEmailOtpChangeEmail}
                          disabled={emailOtpVerifying || !/^\d{6}$/.test(emailOtp)}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailOtpVerifying ? "Đang xác thực..." : "✓ Xác thực"}
                        </button>
                      </div>
                    </>
                  )}

                  {emailOtpStep === "verify" && (
                    <>
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-200">
                          ✓ Mã OTP đã được xác thực. Nhấn "Xác nhận thay đổi" để hoàn tất việc đổi email.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={() => {
                            setEmailOtpStep("new");
                            setNewEmail("");
                            setEmailOtp("");
                          }}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleConfirmEmailChange}
                          disabled={emailOtpVerifying}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailOtpVerifying ? "Đang xác nhận..." : "✓ Xác nhận thay đổi"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu cũ"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-200">❌ {passwordError}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordChanging}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordChanging ? "Đang thay đổi..." : "🔐 Đổi mật khẩu"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
