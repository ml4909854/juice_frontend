// src/pages/Wishlist.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Wishlist = () => {
  const navigate = useNavigate();

  // State
  const [wishlist, setWishlist] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [clearingWishlist, setClearingWishlist] = useState(false);
  const [error, setError] = useState("");

  // Fetch wishlist on load
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/wishlist" } });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist(response.data.wishlist || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // Remove item from wishlist
  const handleRemoveItem = async (juiceId) => {
    if (!window.confirm("Remove this item from wishlist?")) return;

    setRemovingItems(prev => ({ ...prev, [juiceId]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists/${juiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update wishlist
      setWishlist(prev => prev.filter(item => item.juice._id !== juiceId));
      setCount(prev => prev - 1);

      // Show success toast
      showToast("Item removed from wishlist", "red");
    } catch (err) {
      alert("Failed to remove item");
    } finally {
      setRemovingItems(prev => ({ ...prev, [juiceId]: false }));
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) return;

    setClearingWishlist(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist([]);
      setCount(0);
      showToast("Wishlist cleared", "orange");
    } catch (err) {
      alert("Failed to clear wishlist");
    } finally {
      setClearingWishlist(false);
    }
  };

  // Add to cart from wishlist
  const handleAddToCart = async (juice, e) => {
    e.stopPropagation();
    
    setAddingToCart(prev => ({ ...prev, [juice._id]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId: juice._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("✅ Added to cart!", "green");

      // Optional: Remove from wishlist after adding to cart
      // Uncomment if you want this behavior
      // await handleRemoveItem(juice._id);
      
    } catch (err) {
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(prev => ({ ...prev, [juice._id]: false }));
    }
  };

  // Move all to cart
  const handleMoveAllToCart = async () => {
    if (wishlist.length === 0) return;
    
    setClearingWishlist(true);
    try {
      const token = localStorage.getItem("token");
      
      // Add each item to cart
      for (const item of wishlist) {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
          { juiceId: item.juice._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Clear wishlist after adding all to cart
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist([]);
      setCount(0);
      showToast("✨ All items moved to cart!", "green");
      
    } catch (err) {
      alert("Failed to move items to cart");
    } finally {
      setClearingWishlist(false);
    }
  };

  const showToast = (message, color) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 bg-${color}-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Category icons mapping
  const getCategoryIcon = (category) => {
    const icons = {
      detox: "🌿",
      vitamin: "🍊",
      energy: "⚡",
      protein: "💪",
      "weight-loss": "⚖️",
      immunity: "🛡️",
      hydration: "💧",
      antioxidant: "✨",
      fitness: "🏋️",
      skin: "🌟",
      digestive: "🌱"
    };
    return icons[category] || "🧃";
  };

  if (pageLoading) return <PageLoader text="Loading your wishlist..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with gradient */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </div>
          <p className="text-gray-600">
            {count > 0 
              ? `You have ${count} item${count !== 1 ? 's' : ''} saved for later` 
              : 'Save your favorite juices for later'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader type="bounce" size="lg" color="pink" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchWishlist}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-2xl mx-auto border border-pink-100">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-pink-100 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-16 h-16 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
                0
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding your favorite juices to wishlist</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/juices"
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Browse Juices
              </Link>
              <Link
                to="/juices?category=top-rated"
                className="px-8 py-3 border-2 border-pink-500 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all transform hover:scale-105"
              >
                Top Rated
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Wishlist Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-semibold">
                  {count} {count === 1 ? 'Item' : 'Items'}
                </span>
                <button
                  onClick={handleMoveAllToCart}
                  disabled={clearingWishlist}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {clearingWishlist ? (
                    <ButtonLoader />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Move All to Cart
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={handleClearWishlist}
                disabled={clearingWishlist}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Wishlist
              </button>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => {
                const juice = item.juice;
                const categoryIcon = getCategoryIcon(juice.category);
                
                return (
                  <div
                    key={juice._id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-pink-100"
                  >
                    {/* Image Container */}
                    <Link to={`/juices/${juice._id}`} className="block relative h-48 overflow-hidden">
                      <img
                        src={juice.images?.[0] || "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60"}
                        alt={juice.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-lg">
                        <span className="mr-1">{categoryIcon}</span>
                        <span className="text-xs font-medium capitalize">{juice.category}</span>
                      </div>

                      {/* Heart Icon (Already in wishlist) */}
                      <div className="absolute top-3 right-3 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>

                      {/* Stock Status */}
                      {juice.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform -rotate-3 shadow-xl">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link to={`/juices/${juice._id}`} className="block mb-2">
                        <h3 className="font-bold text-gray-800 hover:text-pink-600 transition-colors line-clamp-1">
                          {juice.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
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
                        <span className="text-xs text-gray-500">
                          ({juice.reviewCount || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-lg font-bold text-pink-600">
                            ₹{juice.price}
                          </span>
                          {juice.originalPrice && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                              ₹{juice.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/juices/${juice._id}`)}
                          className="flex-1 px-3 py-2 border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(juice, e)}
                          disabled={addingToCart[juice._id] || juice.stock <= 0}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
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
                        <button
                          onClick={() => handleRemoveItem(juice._id)}
                          disabled={removingItems[juice._id]}
                          className="w-10 h-10 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                          title="Remove from wishlist"
                        >
                          {removingItems[juice._id] ? (
                            <Loader type="spinner" size="sm" color="red" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">
                  <span className="font-semibold text-pink-600">{count}</span> items in wishlist
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/cart"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Go to Cart
                </Link>
                <Link
                  to="/juices"
                  className="px-6 py-2 border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

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
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;