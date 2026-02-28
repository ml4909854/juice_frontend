// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderPlaced = location.state?.orderPlaced;
  const newOrderId = location.state?.orderId;
  const estimatedDelivery = location.state?.estimatedDelivery;

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const limit = 5;

  // Fetch orders on load and when filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit,
        ...(selectedStatus !== "all" && { status: selectedStatus })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/orders/my-orders?${params}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalOrders(response.data.totalOrders || 0);
      
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingOrder(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/orders/cancelOrder/${orderId}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));

      showToast("Order cancelled successfully", "success");
      
    } catch (err) {
      console.error("Error cancelling order:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Helper function to get juice image
  const getJuiceImage = (item) => {
    if (item.juice?.images?.[0]) {
      return item.juice.images[0];
    }
    if (item.juiceId?.images?.[0]) {
      return item.juiceId.images[0];
    }
    return null;
  };

  // Handle image error
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statuses = {
      placed: { bg: "bg-blue-100", text: "text-blue-800", label: "Placed", icon: "📝" },
      processing: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Processing", icon: "⚙️" },
      shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Shipped", icon: "🚚" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered", icon: "✅" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled", icon: "❌" }
    };
    return statuses[status] || statuses.placed;
  };

  // ✅ NEW: Get payment status badge
  const getPaymentBadge = (status) => {
    const statuses = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending", icon: "⏳" },
      paid: { bg: "bg-green-100", text: "text-green-800", label: "Paid", icon: "💰" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed", icon: "❌" }
    };
    return statuses[status] || statuses.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get delivery status
  const getDeliveryStatus = (order) => {
    if (order.orderStatus === "delivered") return "Delivered";
    if (order.orderStatus === "cancelled") return "Cancelled";
    
    if (!order.estimatedDelivery) return "Processing";
    
    const deliveryTime = new Date(order.estimatedDelivery);
    const now = new Date();
    
    if (now > deliveryTime) return "Delayed";
    
    const diff = deliveryTime - now;
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min remaining`;
  };

  // Status filter options
  const statusFilters = [
    { value: "all", label: "All Orders" },
    { value: "placed", label: "Placed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  if (pageLoading) return <PageLoader text="Loading your orders..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
          {totalOrders > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Total orders: {totalOrders}
            </p>
          )}
        </div>

        {/* Order Placed Success Message */}
        {orderPlaced && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">Order placed successfully!</p>
                <p className="text-sm text-green-600">
                  Order ID: #{newOrderId?.slice(-8).toUpperCase()}
                  {estimatedDelivery && ` • Est: ${new Date(estimatedDelivery).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setSelectedStatus(filter.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === filter.value
                  ? "bg-orange-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader type="bounce" size="lg" color="orange" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {selectedStatus !== "all" 
                ? `You don't have any ${selectedStatus} orders`
                : "You haven't placed any orders yet"}
            </p>
            <Link
              to="/juices"
              className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.orderStatus);
                const paymentBadge = getPaymentBadge(order.paymentStatus);
                const canCancel = ["placed", "processing"].includes(order.orderStatus);

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order Header - WITH PAYMENT STATUS */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-mono font-medium text-gray-800">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                        <div>
                          <p className="text-sm text-gray-500">Placed on</p>
                          <p className="font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* ✅ Payment Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.bg} ${paymentBadge.text} flex items-center gap-1`}>
                          <span>{paymentBadge.icon}</span>
                          <span>{paymentBadge.label}</span>
                        </span>
                        {/* Order Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1`}>
                          <span>{statusBadge.icon}</span>
                          <span>{statusBadge.label}</span>
                        </span>
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Order Summary - All Items Visible */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => {
                          const juiceImage = getJuiceImage(item);
                          const itemId = `${order._id}-${idx}`;
                          
                          return (
                            <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                              {/* Product Image */}
                              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                                {juiceImage && !imageErrors[itemId] ? (
                                  <img
                                    src={juiceImage}
                                    alt={item.name}
                                    onError={() => handleImageError(itemId)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                    <span className="text-2xl">🧃</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-600">₹{item.price} per glass</span>
                                  <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                                    {item.quantity} {item.quantity === 1 ? 'Glass' : 'Glasses'}
                                  </span>
                                  <span className="text-sm font-semibold text-orange-600">
                                    Total: ₹{item.subtotal || (item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Total and Delivery Status */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-gray-700">Order Total:</span>
                          <span className="text-lg font-bold text-orange-600">₹{order.finalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-orange-600">{getDeliveryStatus(order)}</span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {canCancel && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingOrder[order._id]}
                            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {cancellingOrder[order._id] ? <ButtonLoader /> : "Cancel Order"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === order._id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Delivery Address */}
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              Delivery Address
                            </h3>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-sm text-gray-800">{order.address?.street}</p>
                              <p className="text-sm text-gray-600">
                                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">📞 {order.address?.phone}</p>
                            </div>
                          </div>

                          {/* Payment Details - WITH PAYMENT STATUS */}
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Payment Details
                            </h3>
                            <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Method</span>
                                <span className="font-medium capitalize">{order.paymentMethod}</span>
                              </div>
                              {/* ✅ Payment Status */}
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`font-medium ${paymentBadge.text}`}>
                                  {paymentBadge.icon} {paymentBadge.label}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{order.totalPrice?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount</span>
                                <span className="text-green-600">-₹{order.discount?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
                                <span>Total Paid</span>
                                <span className="text-orange-600">₹{order.finalPrice?.toFixed(2)}</span>
                              </div>
                              {order.appliedCoupon && (
                                <p className="text-xs text-green-600 mt-2">
                                  Coupon: {order.appliedCoupon.code} (₹{order.appliedCoupon.discount} off)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Orders;