import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications = [
        { id: 1, text: "New order received", time: "2 min ago", read: false, type: "order" },
        { id: 2, text: "New user registered", time: "15 min ago", read: false, type: "user" },
        { id: 3, text: "Low stock alert: Orange Juice", time: "1 hour ago", read: true, type: "stock" },
        { id: 4, text: "New review posted", time: "3 hours ago", read: true, type: "review" },
        { id: 5, text: "Payment received for order #12345", time: "5 hours ago", read: true, type: "payment" },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification Center */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${showNotifications ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowNotifications(false)}
      />
      
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Notification Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-orange-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length > 0 ? (
              <>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="w-full py-2 text-sm text-orange-600 hover:text-orange-800 font-medium border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors mb-4"
                  >
                    Mark all as read
                  </button>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                      notification.read 
                        ? 'bg-gray-50' 
                        : 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-600'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'user' ? 'bg-green-100 text-green-600' :
                        notification.type === 'stock' ? 'bg-yellow-100 text-yellow-600' :
                        notification.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notification.type === 'order' && '📦'}
                        {notification.type === 'user' && '👤'}
                        {notification.type === 'stock' && '⚠️'}
                        {notification.type === 'review' && '⭐'}
                        {notification.type === 'payment' && '💰'}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                          {notification.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={user}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={() => setShowNotifications(!showNotifications)}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.username || 'Admin'}! 👋
                </h2>
                <p className="text-orange-100">
                  Here's what's happening with your store today.
                </p>
              </div>
            </div>

            {/* Outlet for nested routes */}
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} JuiceShop Admin Panel. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">v2.0.0</span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;