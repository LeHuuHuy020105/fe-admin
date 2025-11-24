import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth/auth";
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from "../api/user/user";
import { getProvinces, getDistricts, getWards } from "../api/ghn/ghn";
import Address from "../components/setting/Address";
import ProfileEdit from "../components/setting/ProfileEdit";
import type { AddressFormData } from "../components/setting/Address";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  status?: string;
  permissions?: Permission[];
}

interface Address {
  id: number;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  addressType: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  defaultAddress: boolean;
}

interface UserResponse {
  id: number;
  userName: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  status?: string;
  verifiedEmail?: boolean;
  roles?: Role[];
  addressResponses?: Address[];
}

export default function Setting() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFormData | undefined>();
  const [editingAddressId, setEditingAddressId] = useState<number | undefined>();
  const [addressLoading, setAddressLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; addressId?: number; name?: string }>({ show: false });
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getCurrentUser();
        if (!mounted) return;
        if (res.success) {
          setUser(res.data);
        } else {
          setError(res.error || "Không thể lấy thông tin user");
        }
      } catch (err: any) {
        setError(err?.message || "Lỗi khi gọi API");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const renderAvatar = () => {
    if (!user) return null;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar ? user.avatar : "/asset/default-avatar.webp"}
        alt={user.fullName || user.userName}
        className="w-24 h-24 rounded-full object-cover"
      />
    );
  };

  const handleAddAddress = () => {
    // Nếu user có thông tin, prefill customerName và phoneNumber
    setEditingAddressId(undefined);
    setEditingAddress(user
      ? {
          customerName: user.fullName || "",
          phoneNumber: user.phone || "",
          provinceId: null,
          districtId: null,
          wardCode: null,
          streetAddress: "",
          addressType: "HOME",
          defaultAddress: false,
        }
      : undefined
    );
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    console.log("Adresss " , address)
    setEditingAddress({
      customerName: address.customerName,
      phoneNumber: address.phoneNumber,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardCode: address.wardId,
      streetAddress: address.streetAddress,
      addressType: address.addressType as "HOME" | "WORK" | "OTHER",
      defaultAddress: address.defaultAddress,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (formData: AddressFormData) => {
    setAddressLoading(true);
    try {
      // Get province, district, ward names from GHN API
      const provincesRes = await getProvinces();
      const provinces = provincesRes.data || [];
      const province = provinces.find(p => p.ProvinceID === formData.provinceId);

      const districtsRes = await getDistricts(formData.provinceId || 0);
      const districts = districtsRes.data || [];
      const district = districts.find(d => d.DistrictID === formData.districtId);

      const wardsRes = await getWards(formData.districtId || 0);
      const wards = wardsRes.data || [];
      const ward = wards.find(w => w.WardCode === formData.wardCode);

      // Nối chuỗi địa chỉ chi tiết
      const fullAddress =
        [
          formData.streetAddress,
          ward?.WardName,
          district?.DistrictName,
          province?.ProvinceName,
        ]
          .filter(Boolean)
          .join(", ");

      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.phoneNumber,
        province: province?.ProvinceName || "",
        district: district?.DistrictName || "",
        ward: ward?.WardName || "",
        provinceId: formData.provinceId,
        districtId: formData.districtId,
        wardId: formData.wardCode,
        streetAddress: fullAddress,
        addressType: formData.addressType,
      };

      let result;
      if (editingAddressId) {
        // Update existing address
        result = await updateAddress(editingAddressId, payload);
    
      } else {
        // Add new address
        result = await addAddress(payload);
      }

      if (result.success) {
        setShowAddressModal(false);
        setEditingAddress(undefined);
        setEditingAddressId(undefined);
        // Re-fetch user data
        const res = await getCurrentUser();
        if (res.success) {
          setUser(res.data);
        }
      } else {
        alert(`Lỗi: ${result.error || "Không thể lưu địa chỉ"}`);
      }
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Lỗi khi lưu địa chỉ");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number, name: string) => {
    setDeleteConfirm({ show: true, addressId, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.addressId) return;
    
    setAddressLoading(true);
    try {
      const result = await deleteAddress(deleteConfirm.addressId);
      if (result.success) {
        setDeleteConfirm({ show: false });
        // Re-fetch user data
        const res = await getCurrentUser();
        if (res.success) {
          setUser(res.data);
        }
      } else {
        alert(`Lỗi: ${result.error || "Không thể xóa địa chỉ"}`);
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      alert("Lỗi khi xóa địa chỉ");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    setAddressLoading(true);
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        // Re-fetch user data
        const res = await getCurrentUser();
        if (res.success) {
          setUser(res.data);
        }
      } else {
        alert(`Lỗi: ${result.error || "Không thể đặt địa chỉ mặc định"}`);
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      alert("Lỗi khi đặt địa chỉ mặc định");
    } finally {
      setAddressLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          ⚙️ Tài khoản của tôi
        </h1>

        {loading ? (
          <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow text-center text-gray-700 dark:text-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4">Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900 rounded-lg shadow text-red-700 dark:text-red-200 border-l-4 border-red-500">
            ❌ {error}
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-500"></div>
              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:gap-6 -mt-16 mb-6">
                  <div className="mb-4 md:mb-0">
                    {renderAvatar()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.fullName || user.userName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">@{user.userName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {user.status}
                      </span>
                      {user.verifiedEmail && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          ✓ Email Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setShowProfileEdit(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all">
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Email</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{user.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Số điện thoại</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{user.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Giới tính</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{user.gender ? (user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : user.gender) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Ngày sinh</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👥 Vai trò & Quyền</h3>
              <div className="space-y-4">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          role.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {role.status}
                        </span>
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {role.permissions.map((perm) => (
                            <span key={perm.id} className="text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded">
                              {perm.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Không có vai trò nào</p>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">📍 Địa chỉ</h3>
                <button onClick={handleAddAddress} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all">
                  ➕ Thêm địa chỉ
                </button>
              </div>
              {user.addressResponses && user.addressResponses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {user.addressResponses.map((address) => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        address.defaultAddress
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{address.customerName}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{address.addressType === "HOME" ? "🏠 Nhà riêng" : address.addressType}</p>
                        </div>
                        {address.defaultAddress && (
                          <span className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-semibold">
                            ⭐ Mặc định
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm mb-3">
                        <p className="text-gray-700 dark:text-gray-200">{address.streetAddress}</p>
                        <p className="text-gray-600 dark:text-gray-300">{address.ward}, {address.district}</p>
                        <p className="text-gray-600 dark:text-gray-300">{address.province}</p>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">📞 {address.phoneNumber}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          address.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {address.status}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditAddress(address)} className="text-xs px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-all">
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteAddress(address.id, address.customerName)} className="text-xs px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-all">
                            🗑️
                          </button>
                          {!address.defaultAddress && (
                            <button onClick={() => handleSetDefault(address.id)} className="text-xs px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white transition-all">
                              ⭐
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Chưa có địa chỉ nào</p>
                  <button onClick={handleAddAddress} className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all">
                    ➕ Thêm địa chỉ
                  </button>
                </div>
              )}
            </div>

            {/* Address Modal */}
            <Address
              isOpen={showAddressModal}
              onClose={() => {
                setShowAddressModal(false);
                setEditingAddress(undefined);
                setEditingAddressId(undefined);
              }}
              onSave={handleSaveAddress}
              initialData={editingAddress}
              isLoading={addressLoading}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Xác nhận xóa địa chỉ
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Bạn có chắc chắn muốn xóa địa chỉ của <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setDeleteConfirm({ show: false })}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={addressLoading}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addressLoading ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Edit Modal */}
            <ProfileEdit
              isOpen={showProfileEdit}
              onClose={() => setShowProfileEdit(false)}
              onSave={async () => {
                const res = await getCurrentUser();
                if (res.success) {
                  setUser(res.data);
                }
              }}
              user={user}
            />
          </div>
        ) : (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500">
            ⚠️ Không có dữ liệu user
          </div>
        )}
      </div>
    </div>
  );
}
