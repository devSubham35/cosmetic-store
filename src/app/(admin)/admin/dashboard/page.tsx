import { connectDB } from "@/lib/db";
import { Order } from "@/models/order.model";
import { User } from "@/models/user.model";
import { Product } from "@/models/product.model";
import DashboardClient from "@/components/admin/DashboardClient";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getDayLabels(count: number) {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(`${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return labels;
}

function getWeekLabels(count: number) {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    labels.push(`Week ${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return labels;
}

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

async function getDashboardStats() {
  try {
    await connectDB();

    const now = new Date();

    // Date boundaries
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const [totalUsers, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const conversionRate =
      totalUsers > 0
        ? Math.round((totalOrders / totalUsers) * 100 * 10) / 10
        : 0;

    // ── Current month vs previous month (for KPI trends) ──
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      thisMonthUsers, prevMonthUsers,
      thisMonthOrders, prevMonthOrders,
      thisMonthRevenueAgg, prevMonthRevenueAgg,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      User.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      Order.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      Order.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const thisMonthRevenue = thisMonthRevenueAgg[0]?.total ?? 0;
    const prevMonthRevenue = prevMonthRevenueAgg[0]?.total ?? 0;

    // ── Orders aggregations ──
    const [ordersByDay, ordersByWeek, ordersByMonth, revenueByMonth, prevRevenueByMonth] =
      await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $isoWeek: "$createdAt" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: yearStart } } },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: yearStart } } },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total: { $sum: "$totalAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: prevYearStart, $lte: prevYearEnd } } },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total: { $sum: "$totalAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    // ── Users aggregations ──
    const [usersByDay, usersByWeek, usersByMonth] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $isoWeek: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: yearStart } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // ── Top selling products (by quantity sold) ──
    const topProductsAgg = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$products.name" },
          image: { $first: "$products.image" },
          totalSales: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    // Look up stock and category for each top product
    const topProductIds = topProductsAgg.map((p: { _id: string }) => p._id);
    const productDetails = await Product.find(
      { _id: { $in: topProductIds } },
      { stock: 1, category: 1 }
    ).lean();

    const productDetailsMap = new Map(
      productDetails.map((p) => [p._id.toString(), p])
    );

    const topProducts: TopProductItem[] = topProductsAgg.map(
      (p: { _id: string; name: string; image: string; totalSales: number }) => {
        const details = productDetailsMap.get(p._id);
        return {
          name: p.name,
          image: p.image,
          category: (details?.category ?? "").replace(/-/g, " "),
          stock: details?.stock ?? 0,
          totalSales: p.totalSales,
        };
      }
    );

    // ── Top customers (by total spent) ──
    const topCustomersAgg = await Order.aggregate([
      {
        $group: {
          _id: "$customerDetails.email",
          name: { $first: "$customerDetails.fullName" },
          email: { $first: "$customerDetails.email" },
          purchases: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 4 },
    ]);

    const topCustomers: TopCustomerItem[] = topCustomersAgg.map(
      (c: { name: string; email: string; purchases: number; totalSpent: number }) => ({
        name: c.name,
        email: c.email,
        purchases: c.purchases,
        totalSpent: c.totalSpent,
      })
    );

    // ── Recent orders ──
    const recentOrdersDocs = await Order.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const recentOrders: RecentOrderItem[] = recentOrdersDocs.map((o) => ({
      _id: o._id.toString(),
      productName: o.products[0]?.name ?? "Unknown",
      productImage: o.products[0]?.image ?? "",
      category: "",
      amount: o.totalAmount,
      date: o.createdAt.toISOString(),
    }));

    // Look up categories for recent order products
    const recentProductIds = recentOrdersDocs
      .map((o) => o.products[0]?.productId)
      .filter(Boolean);
    if (recentProductIds.length > 0) {
      const recentProductDetails = await Product.find(
        { _id: { $in: recentProductIds } },
        { category: 1 }
      ).lean();
      const rpMap = new Map(
        recentProductDetails.map((p) => [p._id.toString(), p.category])
      );
      recentOrders.forEach((ro, i) => {
        const pid = recentOrdersDocs[i]?.products[0]?.productId;
        if (pid) {
          ro.category = (rpMap.get(pid) ?? "").replace(/-/g, " ");
        }
      });
    }

    // ── Top states by sells ──
    const topStatesAgg = await Order.aggregate([
      {
        $group: {
          _id: "$customerDetails.state",
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const topStates = topStatesAgg.map(
      (s: { _id: string; total: number }) => ({
        name: s._id || "Unknown",
        total: s.total,
      })
    );

    // ── Build chart data arrays ──

    // Daily — last 14 days
    const dayLabels = getDayLabels(14);
    const dayKeys: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayKeys.push(d.toISOString().split("T")[0]);
    }

    const ordersDaily = dayKeys.map((key, i) => ({
      label: dayLabels[i],
      value: ordersByDay.find((o: { _id: string }) => o._id === key)?.count ?? 0,
    }));

    const usersDaily = dayKeys.map((key, i) => ({
      label: dayLabels[i],
      value: usersByDay.find((u: { _id: string }) => u._id === key)?.count ?? 0,
    }));

    // Weekly — last 4 weeks
    const weekLabels = getWeekLabels(4);
    const weekNums: number[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
      );
      weekNums.push(week);
    }

    const ordersWeekly = weekNums.map((w, i) => ({
      label: weekLabels[i],
      value: ordersByWeek.find((o: { _id: number }) => o._id === w)?.count ?? 0,
    }));

    const usersWeekly = weekNums.map((w, i) => ({
      label: weekLabels[i],
      value: usersByWeek.find((u: { _id: number }) => u._id === w)?.count ?? 0,
    }));

    // Monthly — all 12 months
    const ordersMonthly = MONTHS.map((m, i) => ({
      label: m,
      value: ordersByMonth.find((o: { _id: number }) => o._id === i + 1)?.count ?? 0,
    }));

    const usersMonthly = MONTHS.map((m, i) => ({
      label: m,
      value: usersByMonth.find((u: { _id: number }) => u._id === i + 1)?.count ?? 0,
    }));

    const revenueMonthly = MONTHS.map((m, i) => ({
      label: m,
      value: revenueByMonth.find((r: { _id: number }) => r._id === i + 1)?.total ?? 0,
    }));

    const prevRevenueMonthly = MONTHS.map((m, i) => ({
      label: m,
      value: prevRevenueByMonth.find((r: { _id: number }) => r._id === i + 1)?.total ?? 0,
    }));

    // Earnings chart: current year revenue vs previous year revenue
    const earningsData = MONTHS.map((m, i) => ({
      label: m,
      current: revenueMonthly[i].value,
      previous: prevRevenueMonthly[i].value,
    }));

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      conversionRate,
      thisMonthUsers,
      prevMonthUsers,
      thisMonthOrders,
      prevMonthOrders,
      thisMonthRevenue,
      prevMonthRevenue,
      ordersDaily,
      ordersWeekly,
      ordersMonthly,
      usersDaily,
      usersWeekly,
      usersMonthly,
      revenueMonthly,
      earningsData,
      topProducts,
      topCustomers,
      recentOrders,
      topStates,
    };
  } catch {
    const empty12 = MONTHS.map((m) => ({ label: m, value: 0 }));
    const empty14 = getDayLabels(14).map((l) => ({ label: l, value: 0 }));
    const empty4 = getWeekLabels(4).map((l) => ({ label: l, value: 0 }));
    const emptyEarnings = MONTHS.map((m) => ({ label: m, current: 0, previous: 0 }));

    return {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      conversionRate: 0,
      thisMonthUsers: 0,
      prevMonthUsers: 0,
      thisMonthOrders: 0,
      prevMonthOrders: 0,
      thisMonthRevenue: 0,
      prevMonthRevenue: 0,
      ordersDaily: empty14,
      ordersWeekly: empty4,
      ordersMonthly: empty12,
      usersDaily: empty14,
      usersWeekly: empty4,
      usersMonthly: empty12,
      revenueMonthly: empty12,
      earningsData: emptyEarnings,
      topProducts: [],
      topCustomers: [],
      recentOrders: [],
      topStates: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  return <DashboardClient stats={stats} />;
}
