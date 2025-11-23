import { useEffect, useState } from "react";
import { getProvinces, getDistricts, getWards } from "../../api/ghn/ghn";
import type { Province, District, Ward } from "../../api/ghn/ghn";

export interface AddressFormData {
  customerName: string;
  phoneNumber: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  streetAddress: string;
  addressType: "HOME" | "WORK" ;
  defaultAddress: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => void;
  initialData?: AddressFormData;
  isLoading?: boolean;
}

export default function Address({ isOpen, onClose, onSave, initialData, isLoading }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>(
    initialData || {
      customerName: "",
      phoneNumber: "",
      provinceId: null,
      districtId: null,
      wardCode: null,
      streetAddress: "",
      addressType: "HOME",
      defaultAddress: false,
    }
  );

  // Prefill form when initialData changes (e.g. when opening modal)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        provinceId: initialData.provinceId ?? initialData.provinceId ?? null,
        districtId: initialData.districtId ?? initialData.districtId ?? null,
        wardCode: initialData.wardCode ?? initialData.wardCode ?? null,
      }));
    }
  }, [initialData, isOpen]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      const res = await getProvinces();
      if (res.success && res.data) {
        setProvinces(res.data);
      }
      setLoadingProvinces(false);
    };

    if (isOpen) {
      void fetchProvinces();
    }
  }, [isOpen]);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.provinceId) {
        setDistricts([]);
        setWards([]);
        setFormData(prev => ({ ...prev, districtId: null, wardCode: null }));
        return;
      }

      setLoadingDistricts(true);
      const res = await getDistricts(formData.provinceId);
      if (res.success && res.data) {
        setDistricts(res.data);
      }
      setLoadingDistricts(false);
    };

    void fetchDistricts();
  }, [formData.provinceId]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.districtId) {
        setWards([]);
        setFormData(prev => ({ ...prev, wardCode: null }));
        return;
      }

      setLoadingWards(true);
      const res = await getWards(formData.districtId);
      if (res.success && res.data) {
        setWards(res.data);
      }
      setLoadingWards(false);
    };

    void fetchWards();
  }, [formData.districtId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) newErrors.customerName = "Tên người nhận là bắt buộc";
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    } else {
      // Kiểm tra định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Số điện thoại không hợp lệ";
      }
    }
    if (!formData.provinceId) newErrors.provinceId = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.districtId) newErrors.districtId = "Quận/Huyện là bắt buộc";
    if (!formData.wardCode) newErrors.wardCode = "Phường/Xã là bắt buộc";
    if (!formData.streetAddress.trim()) newErrors.streetAddress = "Địa chỉ chi tiết là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const selectedProvince = provinces.find(p => p.ProvinceID === formData.provinceId);
  const selectedDistrict = districts.find(d => d.DistrictID === formData.districtId);
  const selectedWard = wards.find(w => w.WardCode === formData.wardCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {initialData ? "✏️ Chỉnh sửa địa chỉ" : "➕ Thêm địa chỉ mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.customerName ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                }`}
                placeholder="Lê Hữu Huy"
              />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                }`}
                placeholder="0399097211"
              />
              {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>

          {/* Address Type & Default */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Loại địa chỉ
              </label>
              <select
                value={formData.addressType}
                onChange={e => setFormData({ ...formData, addressType: e.target.value as "HOME" | "WORK" })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="HOME">🏠 Nhà riêng</option>
                <option value="WORK">💼 Cơ quan</option>
              </select>
            </div>

    
          </div>

          {/* Province, District, Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Province */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.provinceId || ""}
                onChange={e => setFormData({ ...formData, provinceId: e.target.value ? parseInt(e.target.value) : null })}
                disabled={loadingProvinces}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.provinceId ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                } ${loadingProvinces ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                </option>
                {provinces.map(p => (
                  <option key={p.ProvinceID} value={p.ProvinceID}>
                    {p.ProvinceName}
                  </option>
                ))}
              </select>
              {errors.provinceId && <p className="text-xs text-red-500 mt-1">{errors.provinceId}</p>}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.districtId || ""}
                onChange={e => setFormData({ ...formData, districtId: e.target.value ? parseInt(e.target.value) : null })}
                disabled={!formData.provinceId || loadingDistricts}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.districtId ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                } ${!formData.provinceId || loadingDistricts ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {!formData.provinceId ? "Chọn tỉnh trước" : loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}
                </option>
                {districts.map(d => (
                  <option key={d.DistrictID} value={d.DistrictID}>
                    {d.DistrictName}
                  </option>
                ))}
              </select>
              {errors.districtId && <p className="text-xs text-red-500 mt-1">{errors.districtId}</p>}
            </div>

            {/* Ward */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.wardCode || ""}
                onChange={e => setFormData({ ...formData, wardCode: e.target.value || null })}
                disabled={!formData.districtId || loadingWards}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                  errors.wardCode ? "border-red-500" : "border-gray-300 dark:border-slate-600"
                } ${!formData.districtId || loadingWards ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {!formData.districtId ? "Chọn quận trước" : loadingWards ? "Đang tải..." : "Chọn phường/xã"}
                </option>
                {wards.map(w => (
                  <option key={w.WardCode} value={w.WardCode}>
                    {w.WardName}
                  </option>
                ))}
              </select>
              {errors.wardCode && <p className="text-xs text-red-500 mt-1">{errors.wardCode}</p>}
            </div>
          </div>

          {/* Selected Location Display */}
          {selectedProvince && selectedDistrict && selectedWard && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📍 {selectedWard.WardName}, {selectedDistrict.DistrictName}, {selectedProvince.ProvinceName}
              </p>
            </div>
          )}

          {/* Street Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.streetAddress}
              onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none ${
                errors.streetAddress ? "border-red-500" : "border-gray-300 dark:border-slate-600"
              }`}
              placeholder="Nhập số nhà, tên đường, địa điểm nổi bật, v.v..."
            />
            {errors.streetAddress && <p className="text-xs text-red-500 mt-1">{errors.streetAddress}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 font-medium transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
