import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Fetch pending orders count
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });

    // 2. Fetch all non-cancelled orders for revenue calculations
    const allValidOrders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { totalAmount: true, createdAt: true },
    });

    let totalRevenue = 0;
    let salesToday = 0;
    let ordersToday = 0;

    allValidOrders.forEach(order => {
      const amount = Number(order.totalAmount);
      totalRevenue += amount;
      if (order.createdAt >= startOfToday) {
        salesToday += amount;
        ordersToday += 1;
      }
    });

    // 3. Build 7-day revenue chart data
    const chartDataMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartDataMap[dateStr] = 0;
    }

    allValidOrders.forEach(order => {
      const dateStr = order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (chartDataMap[dateStr] !== undefined) {
        chartDataMap[dateStr] += Number(order.totalAmount);
      }
    });
    
    const revenueChart = Object.keys(chartDataMap).map(date => ({
      date,
      revenue: chartDataMap[date],
    }));

    // 4. Fetch Popular Items
    // We aggregate OrderItems to find the top 5 most ordered
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { status: { not: 'CANCELLED' } } },
      include: { menuItem: { select: { name: true } } }
    });

    const itemCounts: Record<string, number> = {};
    orderItems.forEach(oi => {
      const name = oi.menuItem.name;
      itemCounts[name] = (itemCounts[name] || 0) + oi.quantity;
    });

    const popularItems = Object.keys(itemCounts)
      .map(name => ({ name, quantity: itemCounts[name] }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      salesToday,
      ordersToday,
      totalRevenue,
      pendingOrders,
      revenueChart,
      popularItems
    });

  } catch (err) {
    console.error('[stats]', err);
    return NextResponse.json({
      salesToday: 0,
      ordersToday: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      revenueChart: [],
      popularItems: []
    });
  }
}
