import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCard from "./StatsCard";
import * as adminService from "./adminService";
import { PageLoader } from "../components/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topJuices, setTopJuices] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
      setRecentOrders(data.recentOrders || []);
      setTopJuices(data.topJuices || []);
      setOrdersByStatus(data.ordersByStatus || []);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: "bg-blue-100 text-blue-800 border-l-4 border-blue-500",
      processing: "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500",
      shipped: "bg-purple-100 text-purple-800 border-l-4 border-purple-500",
      delivered: "bg-green-100 text-green-800 border-l-4 border-green-500",
      cancelled: "bg-red-100 text-red-800 border-l-4 border-red-500"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-l-4 border-gray-500";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) return <PageLoader text="Loading dashboard..." />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-orange-100 text-lg">Welcome back! Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Stats Grid with Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatsCard 
            title="Total Users" 
            value={stats?.users || 0} 
            icon="👥" 
            color="blue" 
            trend="+12"
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatsCard 
            title="Total Orders" 
            value={stats?.orders || 0} 
            icon="📦" 
            color="green" 
            trend="+8"
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatsCard 
            title="Total Revenue" 
            value={`₹${stats?.revenue?.toLocaleString() || 0}`} 
            icon="💰" 
            color="orange" 
            trend="+15"
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatsCard 
            title="Total Juices" 
            value={stats?.juices || 0} 
            icon="🧃" 
            color="purple" 
            trend="+5"
          />
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Orders by Status</h2>
              <p className="text-sm text-gray-500 mt-1">Current order distribution</p>
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              Total: {stats?.orders || 0}
            </div>
          </div>
          
          <div className="space-y-4">
            {ordersByStatus.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-150 transition-transform"></span>
                    <span className="text-sm font-medium capitalize text-gray-700">{item._id}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 group-hover:from-orange-600 group-hover:to-orange-500"
                    style={{ width: `${(item.count / stats?.orders) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Juices */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Top Selling</h2>
              <p className="text-sm text-gray-500 mt-1">Best performing juices</p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
          
          <div className="space-y-4">
            {topJuices.map((item, index) => {
              const colors = [
                "from-yellow-400 to-yellow-500",
                "from-gray-400 to-gray-500",
                "from-orange-400 to-orange-500",
                "from-blue-400 to-blue-500",
                "from-green-400 to-green-500"
              ];
              const badges = ["🥇", "🥈", "🥉", "4th", "5th"];
              
              return (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index]} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.juice?.[0]?.name || "Unknown"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                        {badges[index]}
                      </span>
                      <span className="text-xs text-gray-500">{item.totalSold} units sold</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Latest 5 orders in your store</p>
          </div>
          <Link 
            to="/admin/orders" 
            className="group inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all transform hover:scale-105"
          >
            <span>View All Orders</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {order.user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{order.user?.username || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-orange-600">₹{order.finalPrice}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/admin/orders?order=${order._id}`}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {recentOrders.map((order) => (
            <div key={order._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {order.user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{order.user?.username || "Unknown"}</p>
                  <p className="text-xs text-gray-500">₹{order.finalPrice}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(order.createdAt)}
                </div>
                <Link to={`/admin/orders?order=${order._id}`} className="text-orange-600">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link for Mobile */}
        <div className="mt-4 text-center md:hidden">
          <Link 
            to="/admin/orders" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            View All Orders
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "➕", label: "Add Juice", color: "from-green-500 to-green-600", link: "/admin/juices?add=true" },
          { icon: "👥", label: "Manage Users", color: "from-blue-500 to-blue-600", link: "/admin/users" },
          { icon: "📦", label: "Process Orders", color: "from-purple-500 to-purple-600", link: "/admin/orders" },
          { icon: "⭐", label: "Moderate Reviews", color: "from-yellow-500 to-yellow-600", link: "/admin/reviews" }
        ].map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-6 text-white transform hover:scale-105 transition-all duration-300"
            style={{ backgroundImage: `linear-gradient(135deg, ${action.color.split(' ')[0]}, ${action.color.split(' ')[2]})` }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold text-sm">{action.label}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;