// src/pages/Juices.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Juices = () => {
  const navigate = useNavigate();
  
  // State for juices and loading
  const [juices, setJuices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [hoveredJuice, setHoveredJuice] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [buyNowLoading, setBuyNowLoading] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  
  const limit = 8;

  // Categories with beautiful icons and colors
  const categories = [
    { value: "", label: "All Juices", icon: "🧃", color: "gray", bg: "bg-gray-100", text: "text-gray-700" },
    { value: "detox", label: "Detox Cleanse", icon: "🌿", color: "emerald", bg: "bg-emerald-100", text: "text-emerald-700" },
    { value: "vitamin", label: "Vitamin Boost", icon: "🍊", color: "orange", bg: "bg-orange-100", text: "text-orange-700" },
    { value: "energy", label: "Energy Rush", icon: "⚡", color: "yellow", bg: "bg-yellow-100", text: "text-yellow-700" },
    { value: "protein", label: "Protein Power", icon: "💪", color: "blue", bg: "bg-blue-100", text: "text-blue-700" },
    { value: "weight-loss", label: "Weight Loss", icon: "⚖️", color: "purple", bg: "bg-purple-100", text: "text-purple-700" },
    { value: "immunity", label: "Immunity Shield", icon: "🛡️", color: "red", bg: "bg-red-100", text: "text-red-700" },
    { value: "hydration", label: "Hydration", icon: "💧", color: "cyan", bg: "bg-cyan-100", text: "text-cyan-700" },
    { value: "antioxidant", label: "Antioxidant", icon: "✨", color: "pink", bg: "bg-pink-100", text: "text-pink-700" },
    { value: "fitness", label: "Fitness Fuel", icon: "🏋️", color: "indigo", bg: "bg-indigo-100", text: "text-indigo-700" },
    { value: "skin", label: "Skin Glow", icon: "🌟", color: "amber", bg: "bg-amber-100", text: "text-amber-700" },
    { value: "digestive", label: "Digestive Aid", icon: "🌱", color: "lime", bg: "bg-lime-100", text: "text-lime-700" }
  ];

  // Sort options
  const sortOptions = [
    { value: "new", label: "✨ Newest First" },
    { value: "price_asc", label: "💰 Price: Low to High" },
    { value: "price_desc", label: "💰 Price: High to Low" },
    { value: "rating", label: "⭐ Top Rated" }
  ];

  useEffect(() => {
    fetchJuices();
  }, [currentPage, sort, category, minPrice, maxPrice, search]);

  const fetchJuices = async () => {
    setFilterLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        sort,
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(search && { search })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/juices/search/filter?${params}`
      );

      await new Promise(resolve => setTimeout(resolve, 600));
      setJuices(response.data.juices);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
      setError("");
    } catch (err) {
      setError("Failed to fetch juices. Please try again.");
    } finally {
      setFilterLoading(false);
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleAddToCart = async (juiceId, e) => {
    e.stopPropagation();
    setAddingToCart(prev => ({ ...prev, [juiceId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-in';
      toast.textContent = '✅ Added to cart successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
    } catch (err) {
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(prev => ({ ...prev, [juiceId]: false }));
    }
  };

  // Buy Now function - Direct checkout
  const handleBuyNow = async (juice, e) => {
    e.stopPropagation();
    setBuyNowLoading(prev => ({ ...prev, [juice._id]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // First add to cart
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId: juice._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then navigate to checkout
      navigate("/checkout", { 
        state: { 
          directCheckout: true,
          juice: juice,
          quantity: 1
        } 
      });
      
    } catch (err) {
      alert("Failed to process. Please try again.");
    } finally {
      setBuyNowLoading(prev => ({ ...prev, [juice._id]: false }));
    }
  };

  // ✅ CORRECT VERSION for Juices.jsx
const handleAddToWishlist = async (juiceId, e) => {
  e.stopPropagation();
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login", { state: { from: "/juices" } });
    return;
  }

  setWishlistLoading(prev => ({ ...prev, [juiceId]: true }));
  
  try {
    // ✅ Send EMPTY body (no data), juiceId is in URL
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/wishlists/add/${juiceId}`,
      {}, // ⭐ IMPORTANT: Send empty object, not { juiceId }
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log("Wishlist response:", response.data); // Debug

    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-in';
    toast.textContent = '❤️ Added to wishlist!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
  } catch (err) {
    console.error("Wishlist error:", err.response?.data || err);
    
    // Show error toast with backend message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-in';
    toast.textContent = err.response?.data?.message || 'Failed to add to wishlist';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
  } finally {
    setWishlistLoading(prev => ({ ...prev, [juiceId]: false }));
  }
};

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (pageLoading) {
    return <PageLoader text="Loading delicious juices..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-300 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400 rounded-full animate-pulse animation-delay-4000"></div>
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center text-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 animate-fade-in-up drop-shadow-2xl">
              Fresh Juice <span className="text-yellow-300">Collection</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              {totalItems}+ varieties of healthy, delicious juices made with love ❤️
            </p>
            <div className="flex items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-400">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                ⚡ Free shipping over ₹499
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                🎁 10% off on first order
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                🚚 Same day delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ENHANCED SEARCH BAR - Premium Design */}
        <div className="relative -mt-16 mb-12 z-30">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              {/* Background Blur Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              
              {/* Main Search Container */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-white/20 group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center gap-2">
                  {/* Search Icon */}
                  <div className="pl-4">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Input Field */}
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search your favorite juice... (e.g., Orange, Detox, Mango)"
                    className="flex-1 py-5 px-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-lg"
                  />
                  
                  {/* Clear Button */}
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    disabled={filterLoading}
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 min-w-[140px] group/search"
                  >
                    {filterLoading ? (
                      <ButtonLoader />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 group-hover/search:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Popular Search Suggestions */}
              <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2 text-sm">
                <span className="text-gray-500">Popular:</span>
                {["Orange", "Detox", "Mango", "Protein", "Immunity"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchInput(term);
                      setSearch(term);
                      setCurrentPage(1);
                    }}
                    className="text-orange-600 hover:text-orange-800 font-medium hover:underline transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Filter Toggle - Premium Design */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-6 bg-white border-2 border-orange-200 rounded-2xl py-5 px-6 flex items-center justify-between text-gray-700 hover:border-orange-500 hover:shadow-xl transition-all group"
        >
          <span className="flex items-center gap-3 font-semibold text-lg">
            <svg className="w-6 h-6 text-orange-600 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters & Sort
          </span>
          <div className="flex items-center gap-2">
            {(category || minPrice || maxPrice || sort !== "new") && (
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {(category ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (sort !== "new" ? 1 : 0)}
              </span>
            )}
            <svg className={`w-6 h-6 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar - Premium Design */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-24 border border-orange-100/50 transition-all duration-500 hover:shadow-3xl">
              
              {/* Header with Animation */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-orange-100">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-2 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </span>
                  Filters
                </h3>
                {(category || minPrice || maxPrice || sort !== "new") && (
                  <button
                    onClick={() => {
                      setCategory("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSort("new");
                      setPriceRange({ min: 0, max: 1000 });
                    }}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories - Premium Grid */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                  Categories
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const isActive = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value);
                          setCurrentPage(1);
                        }}
                        className={`relative overflow-hidden group p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `${cat.bg} ${cat.text} ring-2 ring-offset-2 ring-${cat.color}-500 scale-105`
                            : 'bg-gray-50 text-gray-600 hover:scale-105 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">
                            {cat.icon}
                          </span>
                          <span className="text-xs font-medium">{cat.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range - Premium Slider */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                  Price Range
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMinPrice(priceRange.min.toString());
                      setMaxPrice(priceRange.max.toString());
                      setCurrentPage(1);
                    }}
                    disabled={filterLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 hover:shadow-xl disabled:opacity-50"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </div>

              {/* Sort By - Premium Select */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                  Sort By
                </h4>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="py-2">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {(category || minPrice || maxPrice) && (
                <div className="mt-6 pt-4 border-t border-orange-100">
                  <h5 className="text-sm font-medium text-gray-500 mb-3">Active Filters:</h5>
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {categories.find(c => c.value === category)?.icon} {categories.find(c => c.value === category)?.label}
                        <button onClick={() => setCategory("")} className="ml-1 hover:text-orange-900">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        ₹{minPrice || 0} - ₹{maxPrice || 1000}
                        <button onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                          setPriceRange({ min: 0, max: 1000 });
                        }} className="ml-1 hover:text-orange-900">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            
            {/* Results Info - Premium Badge */}
            <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold">
                  {juices.length}
                </span>
                <p className="text-gray-600">
                  <span className="font-medium">juices</span> out of{' '}
                  <span className="font-bold text-orange-600">{totalItems}</span>
                </p>
              </div>
              {filterLoading && (
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <Loader type="spinner" size="sm" color="orange" />
                  <span className="text-sm text-orange-600 font-medium">Updating...</span>
                </div>
              )}
            </div>

            {/* Loading State - Premium Skeleton */}
            {loading || filterLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-lg p-4 animate-pulse">
                    <div className="h-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                      <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-2xl">
                <div className="bg-red-50 inline-block p-6 rounded-full mb-4">
                  <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchJuices}
                  className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl"
                >
                  Try Again
                </button>
              </div>
            ) : juices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-2xl">
                <div className="bg-orange-50 inline-block p-6 rounded-full mb-4">
                  <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No juices found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
                <button
                  onClick={() => {
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    setSort("new");
                    setSearch("");
                    setSearchInput("");
                    setPriceRange({ min: 0, max: 1000 });
                  }}
                  className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid - Premium Cards with Buy Now Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {juices.map((juice) => {
                    const discount = calculateDiscount(juice.price, juice.originalPrice);
                    const catInfo = categories.find(c => c.value === juice.category) || categories[0];
                    const isHovered = hoveredJuice === juice._id;
                    
                    return (
                      <div
                        key={juice._id}
                        onMouseEnter={() => setHoveredJuice(juice._id)}
                        onMouseLeave={() => setHoveredJuice(null)}
                        className="group relative bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
                        onClick={() => navigate(`/juices/${juice._id}`)}
                      >
                        {/* Image Container with Overlay */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={juice.images?.[0] || "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60"}
                            alt={juice.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Discount Badge */}
                          {discount && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                              {discount}% OFF
                            </div>
                          )}
                          
                          {/* Category Icon - Always visible */}
                          <div className={`absolute top-3 right-12 w-8 h-8 ${catInfo.bg} rounded-lg flex items-center justify-center text-lg shadow-lg z-10`}>
                            {catInfo.icon}
                          </div>

                          {/* Wishlist Button - ALWAYS VISIBLE */}
                          <button
                            onClick={(e) => handleAddToWishlist(juice._id, e)}
                            disabled={wishlistLoading[juice._id]}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-orange-600 rounded-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-20"
                            title="Add to Wishlist"
                          >
                            {wishlistLoading[juice._id] ? (
                              <Loader type="spinner" size="sm" color="orange" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            )}
                          </button>

                          {/* Stock Status */}
                          {juice.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-30">
                              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform -rotate-3 shadow-2xl">
                                Out of Stock
                              </span>
                            </div>
                          )}

                          {/* Hover Action Buttons - ONLY Buy Now & Add to Cart (2 buttons) */}
                          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                            {/* Buy Now Button */}
                            <button
                              onClick={(e) => handleBuyNow(juice, e)}
                              disabled={buyNowLoading[juice._id] || juice.stock <= 0}
                              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center gap-1"
                            >
                              {buyNowLoading[juice._id] ? (
                                <ButtonLoader />
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Buy Now
                                </>
                              )}
                            </button>
                            
                            {/* Add to Cart Button */}
                            <button
                              onClick={(e) => handleAddToCart(juice._id, e)}
                              disabled={addingToCart[juice._id] || juice.stock <= 0}
                              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center gap-1"
                            >
                              {addingToCart[juice._id] ? (
                                <ButtonLoader />
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content - WITH DESCRIPTION */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                              {juice.name}
                            </h3>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(juice.averageRating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              ({juice.reviewCount || 0})
                            </span>
                          </div>

                          {/* Description - ADDED HERE */}
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {juice.description || "Freshly squeezed juice packed with nutrients and vitamins. Perfect for a healthy lifestyle."}
                          </p>

                          {/* Price and Category */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-orange-600">
                                ₹{juice.price}
                              </span>
                              {juice.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{juice.originalPrice}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 ${catInfo.bg} ${catInfo.text} rounded-full font-medium`}>
                              {catInfo.label}
                            </span>
                          </div>

                          {/* Quick Action Buttons for Mobile */}
                          <div className="lg:hidden flex gap-2 mt-3">
                            <button
                              onClick={(e) => handleBuyNow(juice, e)}
                              disabled={buyNowLoading[juice._id] || juice.stock <= 0}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              {buyNowLoading[juice._id] ? <ButtonLoader /> : "Buy Now"}
                            </button>
                            <button
                              onClick={(e) => handleAddToCart(juice._id, e)}
                              disabled={addingToCart[juice._id] || juice.stock <= 0}
                              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            >
                              {addingToCart[juice._id] ? <ButtonLoader /> : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination - Premium Design */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || filterLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-2">
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
                              disabled={filterLoading}
                              className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-110'
                                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={i} className="w-8 text-center text-gray-400 font-bold">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || filterLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
    </div>
  );
};

export default Juices;