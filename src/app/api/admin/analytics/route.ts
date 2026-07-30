import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [orders, lowStock, productCount] = await Promise.all([
    Order.find({
      createdAt: { $gte: since },
      status: { $ne: "cancelled" },
    })
      .select("total items createdAt status")
      .lean(),
    Product.find({ stock: { $lte: 5 }, stockStatus: { $ne: "out_of_stock" } })
      .select("name sku stock slug")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
    Product.countDocuments(),
  ]);

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const orderCount = orders.length;

  const salesByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    salesByDay[key] = 0;
  }
  for (const o of orders) {
    const key = new Date(o.createdAt as Date).toISOString().slice(0, 10);
    if (key in salesByDay) salesByDay[key] += o.total || 0;
  }

  const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    for (const item of o.items || []) {
      const cur = topMap.get(item.name) || { name: item.name, qty: 0, revenue: 0 };
      cur.qty += item.quantity;
      cur.revenue += item.price * item.quantity;
      topMap.set(item.name, cur);
    }
  }
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const todayKey = new Date().toISOString().slice(0, 10);
  const revenueToday = salesByDay[todayKey] || 0;

  return NextResponse.json({
    summary: {
      revenue30d: revenue,
      orders30d: orderCount,
      revenueToday,
      productCount,
      lowStockCount: lowStock.length,
    },
    salesByDay: Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount,
    })),
    topProducts,
    lowStock,
  });
}
