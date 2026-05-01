const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function computeDashboardStats({ users = [], products = [], orders = [] }) {
  const today = new Date().toDateString();
  const now = new Date();

  const revenueByDay = Array(7).fill(0);
  const ordersByDay = Array(7).fill(0);
  let todayOrders = 0;
  let pendingOrders = 0;

  for (const order of orders) {
    const created = new Date(order.createdAt);
    if (created.toDateString() === today) todayOrders += 1;
    if (order.status === "pending") pendingOrders += 1;

    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 6) {
      const i = 6 - diffDays;
      ordersByDay[i] += 1;
      if (order.status !== "cancelled") revenueByDay[i] += order.totalAmount;
    }
  }

  const weeklyRevenue = revenueByDay.reduce((a, b) => a + b, 0);

  // Top selling products
  const productCount = {};
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const pid = item.productId?._id || item.productId;
      if (!pid) continue;
      productCount[pid] = (productCount[pid] || 0) + item.quantity;
    }
  }

  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => {
      const p = products.find((x) => x._id === id);
      if (!p) return null;
      return { id, qty, name: p.name, image: p.image?.[0] || "/placeholder.jpg", price: p.salePrice };
    })
    .filter(Boolean);

  const lowStock = products
    .filter((p) => !p.deleted && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  return {
    users: users.length,
    products: products.length,
    orders: orders.length,
    todayOrders,
    pendingOrders,
    weeklyRevenue,
    revenueByDay,
    ordersByDay,
    daysOfWeek: DAYS_OF_WEEK,
    recentUsers: users.slice(0, 5),
    topProducts,
    lowStock,
  };
}
