import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { createSupplier, updateSupplier, type Supplier, type SupplierRequest } from "../../api/supplier/supplier";
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from "../../api/ghn/address";

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
  supplierData?: Supplier | null;
}

export default function SupplierDialog({ isOpen, onClose, fetchData, supplierData }: SupplierDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetails, setAddressDetails] = useState(""); // Chỉ lưu số nhà/tên đường
  
  // Data danh sách cho dropdown
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Giá trị đang chọn
  const [selectedProv, setSelectedProv] = useState<Province | null>(null);
  const [selectedDist, setSelectedDist] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const [loading, setLoading] = useState(false);

  // 1. Load Tỉnh/Thành khi mở dialog
  useEffect(() => {
    if (isOpen) {
      getProvinces().then((res) => {
        if (res.success) setProvinces(res.data);
      });
    }
  }, [isOpen]);

  // 2. Load Quận/Huyện khi chọn Tỉnh
  useEffect(() => {
    if (selectedProv) {
      getDistricts(selectedProv.ProvinceID).then((res) => {
        if (res.success) setDistricts(res.data);
      });
    } else {
      setDistricts([]);
    }
    // Nếu thay đổi tỉnh mà không phải do load dữ liệu cũ -> reset quận/xã
    if (selectedProv?.ProvinceID !== supplierData?.provinceId) {
       // Logic này để tránh reset khi đang fill data edit (sẽ xử lý kỹ hơn ở useEffect fill data)
    }
  }, [selectedProv]);

  // 3. Load Phường/Xã khi chọn Quận
  useEffect(() => {
    if (selectedDist) {
      getWards(selectedDist.DistrictID).then((res) => {
        if (res.success) setWards(res.data);
      });
    } else {
      setWards([]);
    }
  }, [selectedDist]);

  // 4. Xử lý Fill Data khi Sửa (Edit)
  useEffect(() => {
    if (isOpen && supplierData) {
      setName(supplierData.name);
      setPhone(supplierData.phone);
      setAddressDetails(supplierData.address);

      // Fill lại địa chỉ nếu có ID trong DB
      if (supplierData.provinceId) {
        // Cần load list tỉnh trước (đã làm ở useEffect 1), sau đó find
        // Tuy nhiên vì bất đồng bộ, ta set object tạm thời chỉ có ID để trigger useEffect load District
        // Cách tốt nhất là tìm trong list provinces đã load, nhưng nếu chưa load xong thì set tạm
        
        // Giả lập việc chọn lại:
        const prov = { ProvinceID: supplierData.provinceId, ProvinceName: supplierData.province || "", Code: "" };
        setSelectedProv(prov);

        // Load District ngay lập tức để fill tiếp
        getDistricts(supplierData.provinceId).then(res => {
            if(res.success) {
                setDistricts(res.data);
                if(supplierData.districtId) {
                    const dist = res.data.find(d => d.DistrictID === supplierData.districtId);
                    if(dist) {
                        setSelectedDist(dist);
                        // Load Ward
                        getWards(dist.DistrictID).then(wRes => {
                            if(wRes.success) {
                                setWards(wRes.data);
                                if(supplierData.wardId) {
                                    const w = wRes.data.find(x => x.WardCode === supplierData.wardId);
                                    if(w) setSelectedWard(w);
                                }
                            }
                        });
                    }
                }
            }
        });
      }
    } else if (isOpen && !supplierData) {
      // Reset form khi thêm mới
      setName("");
      setPhone("");
      setAddressDetails("");
      setSelectedProv(null);
      setSelectedDist(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
    }
  }, [isOpen, supplierData]);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập tên và số điện thoại!");
      return;
    }

    if (!selectedProv || !selectedDist || !selectedWard || !addressDetails.trim()) {
        toast.error("Vui lòng nhập đầy đủ địa chỉ (Tỉnh, Quận, Phường, Số nhà)!");
        return;
    }

    setLoading(true);
    
    // Tạo payload đúng chuẩn Entity Java yêu cầu
    const payload: SupplierRequest = {
        name,
        phone,
        address: addressDetails, // Chỉ lưu phần chi tiết
        province: selectedProv.ProvinceName,
        provinceId: selectedProv.ProvinceID,
        district: selectedDist.DistrictName,
        districtId: selectedDist.DistrictID,
        ward: selectedWard.WardName,
        wardId: selectedWard.WardCode
    };

    // Nếu là update thì thêm ID
    if (supplierData) {
        payload.id = supplierData.id;
    }

    try {
      let res;
      if (supplierData) {
        res = await updateSupplier(payload);
      } else {
        res = await createSupplier(payload);
      }

      if (res.success) {
        toast.success(supplierData ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchData();
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm bg-white/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {supplierData ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
                </h3>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Tên nhà cung cấp <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập tên..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập SĐT..."
                        />
                    </div>
                </div>

                {/* --- PHẦN ĐỊA CHỈ GHN --- */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Địa chỉ (Dữ liệu từ GHN)
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* Tỉnh/Thành */}
                        <select 
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            onChange={(e) => {
                                const prov = provinces.find(p => p.ProvinceID === Number(e.target.value));
                                setSelectedProv(prov || null);
                                setSelectedDist(null); // Reset cấp con
                                setSelectedWard(null);
                            }}
                            value={selectedProv?.ProvinceID || ""}
                        >
                            <option value="">-- Tỉnh/Thành --</option>
                            {provinces.map(p => (
                                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                            ))}
                        </select>

                        {/* Quận/Huyện */}
                        <select 
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            onChange={(e) => {
                                const dist = districts.find(d => d.DistrictID === Number(e.target.value));
                                setSelectedDist(dist || null);
                                setSelectedWard(null); // Reset cấp con
                            }}
                            value={selectedDist?.DistrictID || ""}
                            disabled={!selectedProv}
                        >
                            <option value="">-- Quận/Huyện --</option>
                            {districts.map(d => (
                                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                            ))}
                        </select>

                        {/* Phường/Xã */}
                        <select 
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            onChange={(e) => {
                                const ward = wards.find(w => w.WardCode === e.target.value);
                                setSelectedWard(ward || null);
                            }}
                            value={selectedWard?.WardCode || ""}
                            disabled={!selectedDist}
                        >
                            <option value="">-- Phường/Xã --</option>
                            {wards.map(w => (
                                <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="text"
                        value={addressDetails}
                        onChange={(e) => setAddressDetails(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Số nhà, tên đường..."
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-500/30"
                  >
                    {loading ? "Đang lưu..." : (supplierData ? "Cập nhật" : "Thêm mới")}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}