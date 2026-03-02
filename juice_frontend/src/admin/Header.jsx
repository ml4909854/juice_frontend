// src/admin/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({
  toggleSidebar,
  user: propUser,
  notifications: propNotifications,
  unreadCount: propUnreadCount,
  onNotificationClick,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(propNotifications || []);
  const [unreadCount, setUnreadCount] = useState(propUnreadCount || 0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [user, setUser] = useState(propUser || null);

  const navigate = useNavigate();

  // Fetch user data if not provided as prop
  useEffect(() => {
    if (!propUser) {
      fetchUserData();
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // Get user display name
  const getUserName = () => {
    return user?.username || localStorage.getItem("username") || "Admin User";
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email || localStorage.getItem("email") || "admin@juiceshop.com";
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Mock search results
  const searchResults = [
    { type: "user", name: "John Doe", email: "john@example.com", icon: "👤" },
    { type: "order", id: "ORD12345", amount: "₹1,299", icon: "📦" },
    { type: "juice", name: "Orange Juice", category: "vitamin", icon: "🧃" },
    { type: "review", user: "Alice", rating: 5, icon: "⭐" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${searchQuery}`);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "📦";
      case "user":
        return "👤";
      case "stock":
        return "⚠️";
      case "review":
        return "⭐";
      case "payment":
        return "💰";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-600";
      case "user":
        return "bg-green-100 text-green-600";
      case "stock":
        return "bg-yellow-100 text-yellow-600";
      case "review":
        return "bg-purple-100 text-purple-600";
      case "payment":
        return "bg-emerald-100 text-emerald-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      {/* Top Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>

      <div className="px-4 md:px-6 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Sidebar Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 lg:hidden group relative"
              title="Toggle Sidebar"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Toggle Menu
              </span>
            </button>

            <Link to="/admin" className="hidden sm:block">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <span className="font-bold text-gray-800">Admin Panel</span>
                  <p className="text-xs text-gray-500">
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Center Section - Search Bar (Hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search users, orders, juices..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
              />
              <svg
                className="absolute left-4 top-3 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slide-down">
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                    <p className="text-sm font-medium text-orange-800">
                      Search Results
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${getNotificationColor(result.type)} flex items-center justify-center`}
                        >
                          <span className="text-lg">{result.icon}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-800">
                            {result.name || result.id || result.user}
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.email ||
                              result.amount ||
                              result.category ||
                              `${result.rating} stars`}
                          </p>
                        </div>
                        <span className="text-xs text-orange-600">View →</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <button className="text-sm text-orange-600 hover:text-orange-800 font-medium">
                      View all results →
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Actions Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 relative group"
                title="Quick Actions"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>

              {/* Quick Actions Dropdown */}
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-down">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      Quick Actions
                    </p>
                  </div>
                  <button className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">➕</span>
                    </div>
                    <span className="text-sm text-gray-700">Add New Juice</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <span className="text-sm text-gray-700">Create Order</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👥</span>
                    </div>
                    <span className="text-sm text-gray-700">Add New User</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      Generate Report
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  setShowQuickActions(false);
                  if (onNotificationClick) onNotificationClick();
                }}
                className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 relative group"
                title="Notifications"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse shadow-lg">
                    {unreadCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Notifications
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slide-down">
                  <div className="p-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 last:border-0 hover:bg-orange-50 transition-colors cursor-pointer ${
                            !notification.read ? "bg-orange-50/50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}
                            >
                              <span className="text-xl">
                                {getNotificationIcon(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${!notification.read ? "font-semibold text-gray-800" : "text-gray-600"}`}
                              >
                                {notification.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">
                          No new notifications
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <button className="w-full text-sm text-orange-600 hover:text-orange-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowQuickActions(false);
                }}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-orange-50 transition-all duration-300 group border border-transparent hover:border-orange-200"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {getUserInitial()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getUserEmail()}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 hidden lg:block ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-down">
                  {/* User Info Card */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {getUserName()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getUserEmail()}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ● Administrator
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/admin/profile"
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 group"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">My Profile</span>
                    </Link>

                    <Link
                      to="/admin/settings"
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 group"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>

                    <Link
                      to="/admin/help"
                      className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 group"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">
                        Help & Support
                      </span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Visible only on mobile) */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none text-sm"
            />
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
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
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;