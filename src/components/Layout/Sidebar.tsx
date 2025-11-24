import {
  BarChart3,
  Briefcase,
  ChevronDown,
  CreditCard,
  Factory,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Package,
  PersonStanding,
  Settings,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};
const menuItems = [
  {
    id: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    id: "users",
    icon: Users,
    label: "Users",
    submenu: [
      { id: "/users/all", label: "All Users" },
      { id: "/users/roles", label: "Roles & Permissions" },
    ],
  },
  {
    id: "/customers",
    icon: PersonStanding,
    label: "Customers",
  },
  {
    id: "/products",
    icon: ShoppingBag,
    label: "Products",
  },
  {
    id: "/vouchers",
    icon: Tag,
    label: "Vouchers",
  },
  {
    id: "/category",
    icon: Layers,
    label: "Category",
  },
  {
    id: "/supplier",
    icon: Briefcase,
    label: "Supplier",
  },
  {
    id: "/inventory",
    icon: Package,
    label: "Inventory",
  },
  {
    id: "/order",
    icon: Truck,
    label: "Order",
  },
  {
    id: "/messages",
    icon: MessageSquare,
    label: "Messages",
  },
  {
    id: "/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // mở rộng menu
  const [expandItems, setExpandItems] = useState(new Set(["analytics"]));

  const toggleExpanded = (id: any) => {
    const newExpanded = new Set(expandItems);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandItems(newExpanded);
  };

  const isActive = (id: any, submenu: any) => {
    if (submenu) {
      return submenu.some((s: any) => pathname.startsWith(s.id));
    }
    return pathname === id;
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Shop Zues
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.id, item.submenu);

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleExpanded(item.id);
                  } else {
                    navigate(item.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.submenu && (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* submenu */}
              {!collapsed && item.submenu && expandItems.has(item.id) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((sub) => (
                    <button
                      key={sub.id}
                      className={`w-full text-left p-2 text-sm rounded-lg transition-all ${
                        pathname === sub.id
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => navigate(sub.id)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
