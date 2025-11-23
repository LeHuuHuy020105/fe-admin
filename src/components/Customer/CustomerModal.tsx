import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Mail, MapPin } from "lucide-react";

interface CustomerModalProps {
  user?: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || "/assest/default-avatar.webp");
    } else {
      setAvatarPreview("/assest/default-avatar.webp");
    }
  }, [user]);

  if (!user) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="absolute inset-0 z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-30"
          leave="ease-in duration-200"
          leaveFrom="opacity-30"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" />
        </Transition.Child>

        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white dark:bg-slate-600 rounded-2xl w-full max-w-lg p-6 relative shadow-lg overflow-auto max-h-[90vh] sm:max-w-xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>

              <Dialog.Title className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">
                Thông tin khách hàng
              </Dialog.Title>

              <div className="flex flex-col gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-100">
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info fields */}
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={user.fullName || ""}
                    disabled
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <input
                    type="text"
                    value={user.userName || ""}
                    disabled
                    placeholder="Username"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email || ""}
                      disabled
                      placeholder="Email"
                      className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                    />
                    <Mail
                      className={`absolute right-3 top-3 w-5 h-5 ${
                        user.verifiedEmail ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    value={user.phone || ""}
                    disabled
                    placeholder="Phone"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <input
                    type="text"
                    value={user.gender || ""}
                    disabled
                    placeholder="Gender"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <input
                    type="text"
                    value={user.dateOfBirth || ""}
                    disabled
                    placeholder="Date of Birth"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <input
                    type="text"
                    value={user.point || 0}
                    disabled
                    placeholder="Point"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />
                  <input
                    type="text"
                    value={user.userRankResponse?.name || ""}
                    disabled
                    placeholder="User Rank"
                    className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                  />

                  {/* Addresses */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                      Địa chỉ
                    </label>
                    {user.addressResponses && user.addressResponses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                        {user.addressResponses.map((addr: any, idx: number) => (
                          <div
                            key={addr.id}
                            className={`flex flex-col justify-between p-4 rounded-lg border shadow-sm ${
                              idx % 2 === 0
                                ? "bg-blue-50 dark:bg-slate-600"
                                : "bg-green-50 dark:bg-slate-700"
                            }`}
                          >
                            {/* Customer Name + Phone */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {addr.customerName || "-"}
                              </span>
                              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                {addr.phoneNumber || "-"}
                              </span>
                            </div>

                            {/* Address */}
                            <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                              <MapPin className="inline w-4 h-4 mr-1 text-red-500" />
                              {`${addr.streetAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                            </div>

                            {/* Address Type */}
                            <div className="text-xs font-medium text-white bg-gray-400 dark:bg-gray-500 px-2 py-1 rounded self-start">
                              {addr.addressType || "DEFAULT"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value="Chưa có địa chỉ"
                        disabled
                        className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-slate-600"
                      />
                    )}
                  </div>

                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
