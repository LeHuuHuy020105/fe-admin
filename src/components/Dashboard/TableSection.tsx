import { MoreHorizontal, TrendingUp } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface TableSectionProps {
  recentOrders: any; // now expects an object, not array
  topProducts: any[];
}
export default function TableSection({ recentOrders, topProducts }: TableSectionProps) {
  const navigate = useNavigate();

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "PACKED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "UNPAID":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "PAID":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const ordersArray = Object.values(recentOrders);

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Recent Orders
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest customer orders
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => navigate("/order")}>
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Order ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Product</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Variant</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Image</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Delivery Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Payment Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {ordersArray.map((order: any, index) => {
                const item = order.orderItemResponses ? Object.values(order.orderItemResponses)[0] : {};
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate--200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-sm font-medium text-blue dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        {item.nameProductSnapShot}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        {item.variantSnapShot}
                      </span>
                    </td>
                    <td className="p-4">
                      <img
                        src={item.urlImageSnapShot}
                        alt={item.nameProductSnapShot}
                        className="w-12 h-12 rounded object-cover border"
                      />
                    </td>
                    <td className="p-4">
                      <span className={`font-medium text-xs px-3 py-1 rounded-full ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium text-xs px-3 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {order.paymentType}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-slate-800 dark:text-white">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Top Products
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 ml-4">
                Best performing products
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={()=> navigate("/products")}>
              View All
            </button>
          </div>

          <div className="p-6 space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50
        dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={product.urlCoverImage}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sold: {product.soldQuantity}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.salePrice)}
                  </p>
                  <div className="flex items-center space-x-1 justify-end">
                    <TrendingUp
                      className={`w-3 h-3 ${
                        product.percentChange >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        product.percentChange >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {product.percentChange}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
