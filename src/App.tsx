import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

import Dashboard from "./components/Dashboard/Dashboard";
import UserPage from "./page/User";
import Product from "./page/Product";
import Login from "./page/Login";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Supplier from "./page/Supplier";
import Order from "./page/Order";
import RolePermission from "./page/RolePermission";
import Customer from "./page/Customer";

export default function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
  const token = localStorage.getItem("token");
  return !!token; 
});


  return (
    <Router>
      <Toaster
        position="top-right" // góc phải trên
        reverseOrder={false}
      />
      <Routes>
        {/* Login page */}
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />

        {/* Protected pages */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Dashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Dashboard />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/all"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <UserPage />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Product />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Supplier />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

         <Route
          path="/order"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Order />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/roles"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <RolePermission />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardWrapper collapsed={sideBarCollapsed} setCollapsed={setSideBarCollapsed}>
                <Customer />
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}


// Wrapper layout
interface DashboardWrapperProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

function DashboardWrapper({ collapsed, setCollapsed, children }: DashboardWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sideBarCollapsed={collapsed} onToggleSideBar={() => setCollapsed(!collapsed)} />
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
