"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useAuthStore } from "@/store/authStore";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface TopProductItem {
  name: string;
  image: string;
  category: string;
  stock: number;
  totalSales: number;
}

interface TopCustomerItem {
  name: string;
  email: string;
  purchases: number;
  totalSpent: number;
}

interface RecentOrderItem {
  _id: string;
  productName: string;
  productImage: string;
  category: string;
  amount: number;
  date: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  thisMonthUsers: number;
  prevMonthUsers: number;
  thisMonthOrders: number;
  prevMonthOrders: number;
  thisMonthRevenue: number;
  prevMonthRevenue: number;
  ordersDaily: { label: string; value: number }[];
  ordersWeekly: { label: string; value: number }[];
  ordersMonthly: { label: string; value: number }[];
  usersDaily: { label: string; value: number }[];
  usersWeekly: { label: string; value: number }[];
  usersMonthly: { label: string; value: number }[];
  revenueMonthly: { label: string; value: number }[];
  earningsData: { label: string; current: number; previous: number }[];
  topProducts: TopProductItem[];
  topCustomers: TopCustomerItem[];
  recentOrders: RecentOrderItem[];
  topStates: { name: string; total: number }[];
}

type FilterType = "Daily" | "Weekly" | "Monthly";

// ──────────────────────────────────────────────
// Mini Sparkline
// ──────────────────────────────────────────────
function Sparkline({
  data,
  color,
  id,
}: {
  data: { label: string; value: number }[];
  color: string;
  id: string;
}) {
  return (
    <div className="w-[90px] h-[36px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${id})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────
// KPI Card (Xenith exact style)
// ──────────────────────────────────────────────
function KPICard({
  value,
  label,
  color,
  cardBg,
  trend,
  sparkData,
  sparkId,
}: {
  value: string;
  label: string;
  color: string;
  cardBg: string;
  trend: { value: string; positive: boolean };
  sparkData: { label: string; value: number }[];
  sparkId: string;
}) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${cardBg}`}>
      <h3
        className="text-[28px] font-bold text-gray-800 tracking-tight leading-tight"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {value}
      </h3>
      <p className="text-[13px] text-gray-500 mt-0.5">{label}</p>

      <div className="flex items-end justify-between mt-2">
        <div>
          <span
            className={`text-sm font-semibold ${
              trend.positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend.positive ? "+" : ""}{trend.value}
          </span>
          <p className="text-[11px] text-gray-400">This month</p>
        </div>
        <Sparkline data={sparkData} color={color} id={sparkId} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Earnings Tooltip (custom)
// ──────────────────────────────────────────────
function EarningsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm shadow-xl">
      <p className="font-bold text-white">
        ₹{payload[0]?.value?.toLocaleString() ?? 0}
      </p>
      <p className="text-gray-400 text-xs">{label} {new Date().getFullYear()}</p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Filter Dropdown
// ──────────────────────────────────────────────
function FilterDropdown({
  value,
  onChange,
  isDark,
}: {
  value: FilterType;
  onChange: (v: FilterType) => void;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options: FilterType[] = ["Daily", "Weekly", "Monthly"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
          isDark
            ? "text-gray-400 bg-white/5 hover:bg-white/10 border-white/5"
            : "text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200"
        }`}
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 top-full mt-1 rounded-lg shadow-xl border z-20 overflow-hidden min-w-[100px] ${
              isDark
                ? "bg-[#1a1d2e] border-white/10"
                : "bg-white border-gray-100"
            }`}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  opt === value
                    ? "bg-pink-500/10 text-pink-400 font-medium"
                    : isDark
                      ? "text-gray-400 hover:bg-white/5"
                      : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Chart Tooltip (for Orders/Users)
// ──────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  prefix,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-white/10">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="font-bold">
        {prefix}
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Chart Card (Orders/Users analytics)
// ──────────────────────────────────────────────
function ChartCard({
  data,
  color,
  gradientId,
  prefix,
  isDark,
}: {
  data: { label: string; value: number }[];
  color: string;
  gradientId: string;
  prefix?: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
      }`}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.2 : 0.12} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6"}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 12 }}
              dx={-4}
              tickFormatter={(v) =>
                prefix === "₹"
                  ? v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
              }
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as { value: number }[]}
                  label={label}
                  prefix={prefix}
                />
              )}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: isDark ? "#1a1d2e" : "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Format helpers
// ──────────────────────────────────────────────
function formatValue(n: number, prefix = ""): string {
  if (n >= 100000) return `${prefix}${(n / 1000).toFixed(2)}K`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(2)}K`;
  return `${prefix}${n.toLocaleString()}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
];

// ──────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────
export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const { isDark } = useAdminTheme();
  const { user } = useAuthStore();
  const [ordersFilter, setOrdersFilter] = useState<FilterType>("Monthly");
  const [usersFilter, setUsersFilter] = useState<FilterType>("Monthly");

  const firstName = user?.name?.split(" ")[0] || "Admin";

  const ordersData =
    ordersFilter === "Daily"
      ? stats.ordersDaily
      : ordersFilter === "Weekly"
        ? stats.ordersWeekly
        : stats.ordersMonthly;

  const usersData =
    usersFilter === "Daily"
      ? stats.usersDaily
      : usersFilter === "Weekly"
        ? stats.usersWeekly
        : stats.usersMonthly;

  const usersSparkData = stats.usersMonthly.slice(-6);
  const ordersSparkData = stats.ordersMonthly.slice(-6);
  const revenueSparkData = stats.revenueMonthly.slice(-6);

  const totalStates = stats.topStates.reduce((s, t) => s + t.total, 0);

  // Compute real month-over-month trend percentages
  function calcTrend(current: number, previous: number): { value: string; positive: boolean } {
    if (previous === 0) {
      return current > 0
        ? { value: "100%", positive: true }
        : { value: "0%", positive: true };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(change).toFixed(1)}%`,
      positive: change >= 0,
    };
  }

  const usersTrend = calcTrend(stats.thisMonthUsers, stats.prevMonthUsers);
  const revenueTrend = calcTrend(stats.thisMonthRevenue, stats.prevMonthRevenue);
  const ordersTrend = calcTrend(stats.thisMonthOrders, stats.prevMonthOrders);

  const kpis = [
    {
      value: formatValue(stats.totalUsers),
      label: "Total Customer",
      color: "#3b9b8f",
      cardBg: isDark ? "bg-[#182828]" : "bg-[#e8f5f2]",
      trend: usersTrend,
      sparkData: usersSparkData,
      sparkId: "users",
    },
    {
      value: formatValue(stats.totalRevenue, "₹"),
      label: "Total Revenue",
      color: "#e87c7c",
      cardBg: isDark ? "bg-[#1f2a1f]" : "bg-[#eef8e8]",
      trend: revenueTrend,
      sparkData: revenueSparkData,
      sparkId: "revenue",
    },
    {
      value: formatValue(stats.totalOrders),
      label: "Total Deals",
      color: "#6b8cc7",
      cardBg: isDark ? "bg-[#1a1f2e]" : "bg-[#e8edf5]",
      trend: ordersTrend,
      sparkData: ordersSparkData,
      sparkId: "orders",
    },
  ];

  return (
    <div>
      {/* ─── Greeting Header ─── */}
      <div className="mb-6">
        <h1
          className={`text-[28px] font-bold ${isDark ? "text-white" : "text-gray-800"}`}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Welcome Back, {firstName}!
        </h1>
        <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Here&apos;s what happening with your store today
        </p>
      </div>

      {/* ─── Main Layout: Left content + Right sidebar ─── */}
      <div className="flex gap-6">
        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <KPICard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Earnings Chart */}
          <div
            className={`rounded-2xl border p-5 ${
              isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Earnings
              </h2>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.earningsData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 12 }}
                    dx={-4}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}` : `${v}`
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <EarningsTooltip
                        active={active}
                        payload={
                          payload as {
                            value: number;
                            name: string;
                            color: string;
                          }[]
                        }
                        label={label}
                      />
                    )}
                    cursor={{
                      stroke: isDark ? "#ffffff20" : "#00000010",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                    formatter={(val: string) => (
                      <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                        {val}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Previous Year"
                    stroke={isDark ? "#4b5563" : "#d1d5db"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: isDark ? "#4b5563" : "#d1d5db" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="This Year"
                    stroke="#3b9b8f"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#3b9b8f", stroke: isDark ? "#1a1d2e" : "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products */}
          <div
            className={`rounded-2xl border p-5 ${
              isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <h2
              className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Top selling products
            </h2>

            {/* Table Header */}
            <div
              className={`grid grid-cols-[40px_1fr_1fr_100px_100px] gap-4 pb-3 border-b text-xs font-medium uppercase tracking-wider ${
                isDark
                  ? "text-gray-500 border-white/5"
                  : "text-gray-400 border-gray-100"
              }`}
            >
              <span>S/NO</span>
              <span>Product Name</span>
              <span>Category</span>
              <span>Stock</span>
              <span className="text-right">Total sales</span>
            </div>

            {/* Table Rows */}
            {stats.topProducts.length === 0 ? (
              <p className={`text-sm py-8 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                No product data yet
              </p>
            ) : (
              stats.topProducts.map((p, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[40px_1fr_1fr_100px_100px] gap-4 py-3 items-center border-b last:border-0 ${
                    isDark ? "border-white/5" : "border-gray-50"
                  }`}
                >
                  <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`relative w-9 h-9 rounded-lg overflow-hidden shrink-0 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                      <Image
                        src={p.image || "https://placehold.co/100x100/f3f4f6/9ca3af?text=N"}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                    <span className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                      {p.name}
                    </span>
                  </div>
                  <span className={`text-sm capitalize ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {p.category}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      p.stock > 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <span className={`text-sm font-medium text-right ${isDark ? "text-white" : "text-gray-800"}`}>
                    {p.totalSales >= 1000
                      ? `${(p.totalSales / 1000).toFixed(2)}k`
                      : p.totalSales.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Two Charts side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2
                  className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  Orders Analytics
                </h2>
                <FilterDropdown value={ordersFilter} onChange={setOrdersFilter} isDark={isDark} />
              </div>
              <ChartCard data={ordersData} color="#a855f7" gradientId="ordersGrad" isDark={isDark} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2
                  className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  Users Analytics
                </h2>
                <FilterDropdown value={usersFilter} onChange={setUsersFilter} isDark={isDark} />
              </div>
              <ChartCard data={usersData} color="#f43f5e" gradientId="usersGrad" isDark={isDark} />
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="hidden lg:block w-[280px] shrink-0 space-y-6">
          {/* Top States by Sells */}
          <div
            className={`rounded-2xl border p-5 ${
              isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3
                className={`text-[15px] font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Top States by Sells
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {formatValue(totalStates, "₹")}
              </span>
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Since last week
              </span>
            </div>

            <div className="space-y-3">
              {stats.topStates.length === 0 ? (
                <p className={`text-sm text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  No data yet
                </p>
              ) : (
                stats.topStates.map((state, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {state.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {state.name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                      {formatValue(state.total, "₹")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div
            className={`rounded-2xl border p-5 ${
              isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-[15px] font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Top Customers
              </h3>
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                See all
              </span>
            </div>

            <div className="space-y-3">
              {stats.topCustomers.length === 0 ? (
                <p className={`text-sm text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  No customer data yet
                </p>
              ) : (
                stats.topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                          {c.name}
                        </p>
                        <p className={`text-[11px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {c.purchases} Purchase{c.purchases !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${isDark ? "text-white" : "text-gray-800"}`}>
                      ₹{c.totalSpent.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div
            className={`rounded-2xl border p-5 ${
              isDark ? "bg-[#1a1d2e] border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-[15px] font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Recent Orders
              </h3>
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                See all
              </span>
            </div>

            <div className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className={`text-sm text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  No orders yet
                </p>
              ) : (
                stats.recentOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                        {o.productName}
                      </p>
                      <p className={`text-[11px] capitalize ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {o.category || "Product"}
                      </p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${isDark ? "text-white" : "text-gray-800"}`}>
                      ₹{o.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
