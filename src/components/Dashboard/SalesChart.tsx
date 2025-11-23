import React from "react";
import { Cell, Pie, ResponsiveContainer, Tooltip, PieChart } from "recharts";

interface SalesChartProps {
  categories: { categoryId: number; categoryName: string; quantity: number }[];
}
export default function SalesChart({ categories }: SalesChartProps) {
    console.log("categories " , categories)
  const total = categories.reduce((sum, item) => sum + item.quantity, 0);
  const chartData = categories.map((item, index) => ({
    name: item.categoryName,
    value: (item.quantity / total) * 100,
    rawValue: item.quantity,
    color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][index % 4],
  }));

  return (
    <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Sales by Category
        </h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name, props) => [
                `${props.payload.rawValue} units`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {chartData.map((item, index) => (
          <div className="flex items-center justify-between" key={index}>
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.name}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white">
              {item.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
