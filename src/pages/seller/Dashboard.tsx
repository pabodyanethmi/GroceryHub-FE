import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, currency } = useAppContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/v1/order/dashboard-stats");
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll md:p-10 p-4 space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">Seller Overview</h2>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {currency}
            {stats?.totalRevenue || 0}
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats?.deliveredOrders || 0} Delivered •{" "}
            {stats?.pendingOrders || 0} Active
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats?.totalProducts || 0}
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats?.lowStockProducts?.length || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Items with ≤ 5 units left
          </p>
        </div>
      </div>

      {/* Low Stock Products Alert Section */}
      {stats?.lowStockProducts?.length > 0 && (
        <div className="max-w-5xl bg-red-50/60 border border-red-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-red-700 mb-3">
            Low / Out of Stock Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.lowStockProducts.map((item: any) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100"
              >
                <img
                  src={item.image?.[0] || ""}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs font-semibold text-red-600">
                    Remaining: {item.stockQuantity ?? 0} units
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="max-w-5xl bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">
            Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-medium">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order: any) => (
                <tr key={order._id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-mono text-xs">{order._id}</td>
                  <td className="px-5 py-3">
                    {order.address?.firstName} {order.address?.lastName}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {currency}
                    {order.amount}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
