import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as adminService from "./adminService";
import { PageLoader } from "../components/Loader";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    search: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [sortBy, setSortBy] = useState("newest");

  const limit = 10;
  const orderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
  const paymentStatuses = ["pending", "paid", "failed"];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders(currentPage, limit, filters);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      showToast("Order status updated successfully", "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handlePaymentUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await adminService.updatePaymentStatus(orderId, newStatus);
      await fetchOrders();
      showToast("Payment status updated successfully", "success");
    } catch (err) {
      showToast("Failed to update payment status", "error");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl animate-slide-in ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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

  const getPaymentColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentIcon = (status) => {
    switch(status) {
      case "pending": return "⏳";
      case "paid": return "💰";
      case "failed": return "❌";
      default: return "💳";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOrderSummary = (order) => {
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return `${items.length} items (${totalItems} units)`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const clearFilters = () => {
    setFilters({ status: "", paymentStatus: "", search: "" });
    setDateRange({ start: "", end: "" });
    setSortBy("newest");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Items", "Total", "Order Status", "Payment Status", "Date"];
    const csvData = orders.map(order => [
      order._id.slice(-8).toUpperCase(),
      order.user?.username || "Unknown",
      getOrderSummary(order),
      formatCurrency(order.finalPrice),
      order.orderStatus,
      order.paymentStatus,
      formatDate(order.createdAt)
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && orders.length === 0) return <PageLoader text="Loading orders..." />;

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 animate-pulse delay-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Orders Management</h1>
            <p className="text-purple-100 text-lg">Track, manage and update customer orders</p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <span className="text-2xl">📦</span>
            <span className="font-semibold">{totalOrders} Total Orders</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(orders.reduce((sum, o) => sum + (o.finalPrice || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.filter(o => o.orderStatus === "placed" || o.orderStatus === "processing").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.filter(o => o.orderStatus === "delivered").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* Main Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by order ID, customer or city..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
              />
              <svg
                className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                showFilterPanel 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilterPanel ? "Hide Filters" : "Show Filters"}
            </button>

            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilterPanel && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 animate-slide-down">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                >
                  <option value="">All Status</option>
                  {orderStatuses.map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => {
                    setFilters({ ...filters, paymentStatus: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                >
                  <option value="">All Payment</option>
                  {paymentStatuses.map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 animate-shake">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(order.user?.username)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{order.user?.username || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{order.user?.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.items?.length || 0}</span>
                        <span className="text-xs text-gray-400">items</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0)} units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-purple-600">{formatCurrency(order.finalPrice)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {updatingStatus[order._id] ? (
                        <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      ) : (
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 ${getStatusColor(order.orderStatus)}`}
                        >
                          {orderStatuses.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {updatingStatus[order._id] ? (
                        <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${getPaymentColor(order.paymentStatus)}`}>
                            <span>{getPaymentIcon(order.paymentStatus)}</span>
                            <span className="capitalize">{order.paymentStatus}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedOrder === order._id ? "Hide Details" : "View Details"}
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr className="bg-gradient-to-r from-purple-50 to-purple-100/50">
                      <td colSpan="8" className="px-6 py-6">
                        <div className="space-y-6">
                          {/* Order Items Grid */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              Order Items
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg overflow-hidden">
                                      <img
                                        src={item.juice?.images?.[0] || "https://via.placeholder.com/64"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800">{item.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                          {item.quantity} × ₹{item.price}
                                        </span>
                                        <span className="text-xs text-gray-500">=</span>
                                        <span className="text-sm font-bold text-orange-600">₹{item.subtotal}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Delivery Address */}
                            <div className="bg-white rounded-xl p-4 shadow-md">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Delivery Address
                              </h5>
                              <p className="text-sm text-gray-600">{order.address?.street}</p>
                              <p className="text-sm text-gray-600">
                                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                              </p>
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {order.address?.phone}
                                </p>
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-xl p-4 shadow-md">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Payment Summary
                              </h5>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Discount:</span>
                                  <span className="font-medium text-green-600">-{formatCurrency(order.discount)}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                  <span className="font-semibold">Total:</span>
                                  <span className="font-bold text-purple-600 text-lg">{formatCurrency(order.finalPrice)}</span>
                                </div>
                                {order.appliedCoupon && (
                                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                    <p className="text-xs text-green-700 flex items-center gap-1">
                                      <span>🏷️</span>
                                      Coupon {order.appliedCoupon.code} applied: -₹{order.appliedCoupon.discount}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl p-4 shadow-md">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Actions
                              </h5>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Update Order Status</label>
                                  <select
                                    value={order.orderStatus}
                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                    disabled={updatingStatus[order._id]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none disabled:opacity-50"
                                  >
                                    {orderStatuses.map(s => (
                                      <option key={s} value={s} className="capitalize">{s}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Update Payment Status</label>
                                  <select
                                    value={order.paymentStatus}
                                    onChange={(e) => handlePaymentUpdate(order._id, e.target.value)}
                                    disabled={updatingStatus[order._id]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none disabled:opacity-50"
                                  >
                                    {paymentStatuses.map(s => (
                                      <option key={s} value={s} className="capitalize">{s}</option>
                                    ))}
                                  </select>
                                </div>
                                {updatingStatus[order._id] && (
                                  <p className="text-xs text-purple-600 animate-pulse">Updating...</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div
                className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <svg
                    className={`w-5 h-5 text-purple-600 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-medium">{order.user?.username || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-bold text-purple-600">{formatCurrency(order.finalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment</p>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getPaymentColor(order.paymentStatus)}`}>
                      {getPaymentIcon(order.paymentStatus)} {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedOrder === order._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={item.juice?.images?.[0] || "https://via.placeholder.com/40"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} × ₹{item.price} = ₹{item.subtotal}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Address</h4>
                      <p className="text-xs text-gray-600">{order.address?.street}</p>
                      <p className="text-xs text-gray-600">
                        {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">📞 {order.address?.phone}</p>
                    </div>

                    {/* Status Updates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Order Status</label>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus[order._id]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {orderStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentUpdate(order._id, e.target.value)}
                          disabled={updatingStatus[order._id]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {paymentStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Orders State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalOrders)} of {totalOrders} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110"
                          : "border border-gray-300 hover:bg-gray-50 hover:scale-105"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={i} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;