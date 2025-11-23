import { MoreHorizontal, TrendingUp } from "lucide-react";
import React from "react";

export default function TableSection() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const recentOrders = [
    {
      orderId: "#OD1234",
      customer: "John Doe",
      product: "Wireless Headphones",
      amount: "$99.99",
      status: "Completed",
      date: "2024-06-15",
    },
    {
      orderId: "#OD1235",
      customer: "Jane Smith",
      product: "Smart Watch",
      amount: "$199.99",
      status: "Pending",
      date: "2024-06-14",
    },
    {
      orderId: "#OD1236",
      customer: "Mike Johnson",
      product: "Bluetooth Speaker",
      amount: "$49.99",
      status: "Cancelled",
      date: "2024-06-13",
    },
  ];

  const topProducts = [
    {
      name: "Product A",
      sales: "$5,000",
      change: "+10%",
      trend: "up",
      revenue: "$15,000",
    },
    {
      name: "Product B",
      sales: "$3,500",
      change: "-5%",
      trend: "down",
      revenue: "$10,500",
    },
    {
      name: "Product C",
      sales: "$4,200",
      change: "+8%",
      trend: "up",
      revenue: "$12,600",
    },
  ];
  return (
    <div className="space-y-6">
      <div
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50
        dark:border-slate-700/50 overflow-hidden"
      >
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
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  Order ID
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  Customer
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200 ">
                  Product
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  className="border-b border-slate--200/50 dark:border-slate-700/50 hover:bg-slate-50/50
                dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4" key={index}>
                    <span className="text-sm font-medium text-blue dark:text-white">
                      {order.orderId}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white text-blue">
                      {order.customer}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white text-blue">
                      {order.product}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white text-blue">
                      {order.amount}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-slate-400 ${getStatusColor(
                        order.status
                      )} dark:text-white font-medium text-xs px-3 py-1 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white text-blue">
                      {order.date}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-800 dark:text-white text-blue">
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
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
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium ">
              View All
            </button>
          </div>

          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50
                    dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm ont-semibold text-slate-800 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {product.sales}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {product.revenue}
                  </p>
                  <div className="flex items-center space-x-1">
                    {product.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        product.trend === "up"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {product.change}
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
