import React, { useState, useEffect } from "react";
import StatsGrid from "./StatsGrid";
import ChartSection from "./ChartSection";
import TableSection from "./TableSection";
import ActivityFeed from "./ActivityFeed";
import { StatisticalAPI } from "../../api/statistical/statistical";
import toast from "react-hot-toast";

import { ref, onValue , off } from "firebase/database";
// Add this import to fix TS7016 error:
import type { Database } from "firebase/database";
// @ts-ignore: No type declaration for Firebase.js
import { db } from '../../firebase/Firebase.js';

export default function Dashboard() {
  const [period, setPeriod] = useState<number>(1); // default 3 tháng
  const [loading, setLoading] = useState(true);

  const [activeUsers, setActiveUsers] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [revenueYear , setRevenueYear] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState([]);

   useEffect(() => {
    // Create a reference to the specific path in your database
  const dataRef = ref(db, "/admin/orders"); // e.g., 'users/user123'

    // Attach the onValue listener
    const unsubscribe = onValue(dataRef, (snapshot) => {
      console.log("stats firebase ", snapshot.exportVal());
      const fetchedData = snapshot.exportVal();
      // Only keep the last 3 orders
      const lastThree =
        fetchedData && typeof fetchedData === "object"
          ? Object.values(fetchedData).slice(-3)
          : [];
      setRecentOrders(lastThree);
    });
    // Clean up the listener when the component unmounts
    // This prevents memory leaks and unnecessary subscriptions
    return () => {
      off(dataRef, 'value', unsubscribe); 
      // Or simply: unsubscribe(); // if using the function returned by onValue
    };
  }, []);


  useEffect(() => {
    setLoading(true);

    Promise.all([
      StatisticalAPI.getActiveUserStatistics(period),
      StatisticalAPI.getOrderStatistics(period),
      StatisticalAPI.getRevenueStatistics(period),
      StatisticalAPI.getTopProducts(period, 5),
      StatisticalAPI.getCategoryStatistics(period),
      StatisticalAPI.getRevenueCostProfit12Months(),
    ])
      .then(([usersData, ordersData, revenueData, topProductsData, categoriesData , revenueYear]) => {
        setActiveUsers(usersData);
        setOrders(ordersData);
        setRevenue(revenueData);
        setTopProducts(topProductsData);
        setCategories(categoriesData.data); // vì backend trả { period, data: [...] }
        setRevenueYear(revenueYear);
      })
      .catch((err) => {
        toast.error("Error fetching dashboard data:", err);
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>

        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid activeUsers={activeUsers} orders={orders} revenue={revenue} />

      {/* Charts */}
      <ChartSection revenue={revenueYear} categories={categories} />

      {/* Table + Activity */}
      <div className="w-full">
    
          <TableSection recentOrders={recentOrders} topProducts={topProducts} />

      </div>
    </div>
  );
}
