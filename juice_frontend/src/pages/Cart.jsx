// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Cart = () => {
  const navigate = useNavigate();
  
  // State
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState({});
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch cart on load
  useEffect(() => {
    fetchCart();
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/cart`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // ✅ Agar cart empty hai to null set karo
      if (response.data.message === "Cart empty" || !response.data.items || response.data.items.length === 0) {
        setCart(null);
        setSelectedItems([]);
        setSelectAll(false);
      } else {
        // ✅ Cart mil gaya to set karo
        setCart(response.data);
        // ✅ Sab items select karo
        const allItemIds = response.data.items
          .filter(item => item.juice && item.juice._id)
          .map(item => item.juice._id);
        setSelectedItems(allItemIds);
        setSelectAll(true);
      }
    } catch (err) {
      console.error("Error fetching cart:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // ✅ QUANTITY UPDATE - Perfectly kaam karega
  const handleUpdateQuantity = async (juiceId, action) => {
    // Agar juiceId nahi hai to return
    if (!juiceId) return;
    
    // Agar ye item already processing hai to return (multiple clicks rokne ke liye)
    if (processingItems[juiceId]) return;
    
    // Processing start
    setProcessingItems(prev => ({ ...prev, [juiceId]: true }));

    try {
      const token = localStorage.getItem("token");
      
      // API call
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/cart/update/${juiceId}`,
        { action },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // ✅ IMPORTANT - Server se jo response aaya, wahi cart set karo
      setCart(response.data.cart);
      
      // ✅ Agar quantity decrease karke 0 ho gayi to selected items se hatao
      if (action === "decrease") {
        const itemStillExists = response.data.cart.items.some(
          item => item.juice._id === juiceId
        );
        if (!itemStillExists) {
          // Item remove ho gaya to selected items se hatao
          setSelectedItems(prev => prev.filter(id => id !== juiceId));
          
          // Select all status check karo
          if (selectAll) {
            const allItemIds = response.data.cart.items.map(item => item.juice._id);
            if (selectedItems.length - 1 === allItemIds.length) {
              setSelectAll(true);
            } else {
              setSelectAll(false);
            }
          }
        }
      }

      // ✅ Success message
      showToast(
        action === "increase" ? "✅ Quantity increased" : "✅ Quantity decreased",
        "success"
      );

    } catch (err) {
      console.error("Error updating quantity:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "❌ Failed to update quantity",
        "error"
      );
    } finally {
      // Processing end - is item ka processing khatam
      setProcessingItems(prev => ({ ...prev, [juiceId]: false }));
    }
  };

  // ✅ REMOVE ITEM - Perfectly kaam karega, kuch hide nahi hoga
  const handleRemoveItem = async (juiceId) => {
    // Agar juiceId nahi hai to return
    if (!juiceId) return;
    
    // Agar ye item already processing hai to return
    if (processingItems[juiceId]) return;
    
    // Confirmation
    if (!window.confirm("Remove this item from cart?")) return;
    
    // Processing start
    setProcessingItems(prev => ({ ...prev, [juiceId]: true }));

    try {
      const token = localStorage.getItem("token");

      // API call
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/cart/remove/${juiceId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // ✅ IMPORTANT - Server se jo response aaya, wahi cart set karo
      setCart(response.data.cart);
      
      // ✅ Selected items se hatao
      setSelectedItems(prev => prev.filter(id => id !== juiceId));
      
      // ✅ Select all status update karo
      if (selectAll) {
        const allItemIds = response.data.cart.items.map(item => item.juice._id);
        if (selectedItems.length - 1 === allItemIds.length) {
          setSelectAll(true);
        } else {
          setSelectAll(false);
        }
      }

      // ✅ Success message
      showToast("✅ Item removed from cart", "success");

    } catch (err) {
      console.error("Error removing item:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "❌ Failed to remove item",
        "error"
      );
    } finally {
      // Processing end
      setProcessingItems(prev => ({ ...prev, [juiceId]: false }));
    }
  };

  // ✅ CLEAR CART
  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    
    if (processingItems.clear) return;
    setProcessingItems(prev => ({ ...prev, clear: true }));

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/cart/clear`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // ✅ Cart empty - null set karo
      setCart(null);
      setSelectedItems([]);
      setSelectAll(false);
      showToast("✅ Cart cleared successfully", "success");

    } catch (err) {
      console.error("Error clearing cart:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "❌ Failed to clear cart",
        "error"
      );
    } finally {
      setProcessingItems(prev => ({ ...prev, clear: false }));
    }
  };

  // ✅ SELECT/DESELECT ITEM
  const handleSelectItem = (juiceId) => {
    if (!juiceId || !cart) return;
    
    setSelectedItems(prev => {
      // Agar already selected hai to deselect karo
      if (prev.includes(juiceId)) {
        const newSelected = prev.filter(id => id !== juiceId);
        setSelectAll(false);
        return newSelected;
      } 
      // Agar selected nahi hai to select karo
      else {
        const newSelected = [...prev, juiceId];
        // Agar sare items select ho gaye to selectAll true karo
        if (newSelected.length === cart.items.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  // ✅ SELECT ALL
  const handleSelectAll = () => {
    if (!cart || !cart.items) return;
    
    if (selectAll) {
      // Sab deselected
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      // Sab selected
      const allItemIds = cart.items
        .filter(item => item.juice && item.juice._id)
        .map(item => item.juice._id);
      setSelectedItems(allItemIds);
      setSelectAll(true);
    }
  };

  // ✅ IMAGE ERROR HANDLER
  const handleImageError = (juiceId) => {
    if (juiceId) {
      setImageErrors(prev => ({ ...prev, [juiceId]: true }));
    }
  };

  // ✅ CALCULATE SELECTED ITEMS TOTAL
  const getSelectedTotal = () => {
    if (!cart || !cart.items || selectedItems.length === 0) return 0;
    
    return cart.items
      .filter(item => item.juice && selectedItems.includes(item.juice._id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // ✅ CHECKOUT SELECTED ITEMS
  const handleCheckoutSelected = () => {
    if (selectedItems.length === 0) {
      showToast("Please select items to checkout", "error");
      return;
    }

    const selectedCartItems = cart.items.filter(
      item => item.juice && selectedItems.includes(item.juice._id)
    );

    navigate("/checkout", {
      state: {
        directCheckout: false,
        selectedItems: selectedCartItems,
        totalPrice: getSelectedTotal(),
        discount: getSelectedDiscount(getSelectedTotal()),
        finalPrice: getSelectedFinalPrice()
      }
    });
  };

  // ✅ CALCULATE DISCOUNT (10% on ₹50000+)
  const getSelectedDiscount = (total) => {
    return total >= 50000 ? total * 0.1 : 0;
  };

  // ✅ CALCULATE FINAL PRICE
  const getSelectedFinalPrice = () => {
    const total = getSelectedTotal();
    const discount = getSelectedDiscount(total);
    return total - discount;
  };

  if (pageLoading) return <PageLoader text="Loading your cart..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ TOAST NOTIFICATION */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
            toast.type === "success" ? "bg-green-500" :
            toast.type === "error" ? "bg-red-500" :
            "bg-blue-500"
          } text-white`}>
            <div className="flex items-center gap-2">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* ✅ HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Review and manage your items</p>
        </div>

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchCart}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader type="bounce" size="lg" color="orange" />
          </div>
        ) : !cart ? (
          /* ✅ EMPTY CART */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
            <Link
              to="/juices"
              className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* ✅ CART WITH ITEMS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ✅ LEFT SIDE - CART ITEMS */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* ✅ CART HEADER - SELECT ALL + CLEAR CART */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Select All</span>
                    </label>
                    <span className="text-sm text-gray-500">
                      ({selectedItems.length} of {cart.items.length} selected)
                    </span>
                  </div>
                  <button
                    onClick={handleClearCart}
                    disabled={processingItems.clear}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    {processingItems.clear ? (
                      <ButtonLoader />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cart
                      </>
                    )}
                  </button>
                </div>

                {/* ✅ CART ITEMS LIST - KABHI HIDE NAHI HOGA */}
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => {
                    if (!item || !item.juice || !item.juice._id) return null;
                    const isProcessing = processingItems[item.juice._id];
                    
                    return (
                      <div 
                        key={item.juice._id} 
                        className={`p-4 hover:bg-gray-50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}
                      >
                        <div className="flex gap-4">
                          {/* CHECKBOX */}
                          <div className="flex items-start pt-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.juice._id)}
                              onChange={() => handleSelectItem(item.juice._id)}
                              disabled={isProcessing}
                              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 disabled:opacity-50"
                            />
                          </div>

                          {/* PRODUCT IMAGE */}
                          <Link to={`/juices/${item.juice._id}`} className={`flex-shrink-0 ${isProcessing ? 'pointer-events-none' : ''}`}>
                            <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                              {!imageErrors[item.juice._id] ? (
                                <img
                                  src={item.juice.images?.[0]}
                                  alt={item.juice.name}
                                  onError={() => handleImageError(item.juice._id)}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-2xl">🧃</span>
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* PRODUCT DETAILS */}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <Link 
                                  to={`/juices/${item.juice._id}`}
                                  className={`font-semibold text-gray-800 hover:text-orange-600 ${isProcessing ? 'pointer-events-none' : ''}`}
                                >
                                  {item.juice.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1 capitalize">
                                  {item.juice.category}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Price: ₹{item.price}
                                </p>
                              </div>
                              <p className="font-bold text-orange-600">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* QUANTITY CONTROLS */}
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => handleUpdateQuantity(item.juice._id, "decrease")}
                                  disabled={isProcessing}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                  {isProcessing ? (
                                    <Loader type="spinner" size="sm" color="orange" />
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  )}
                                </button>
                                <span className="w-10 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.juice._id, "increase")}
                                  disabled={isProcessing}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                  {isProcessing ? (
                                    <Loader type="spinner" size="sm" color="orange" />
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  )}
                                </button>
                              </div>

                              {/* REMOVE BUTTON */}
                              <button
                                onClick={() => handleRemoveItem(item.juice._id)}
                                disabled={isProcessing}
                                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50 transition-colors"
                              >
                                {isProcessing ? (
                                  <ButtonLoader />
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ✅ RIGHT SIDE - ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h2>

                {/* PRICE DETAILS */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{cart.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {cart.totalPrice >= 50000 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount (10%)</span>
                      <span className="font-medium text-green-600">
                        -₹{(cart.totalPrice * 0.1).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                    <span>Total</span>
                    <span className="text-orange-600">
                      ₹{cart.finalPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                {/* CHECKOUT BUTTON */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleCheckoutSelected}
                    disabled={selectedItems.length === 0}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Checkout ({selectedItems.length} items)
                  </button>
                  
                  <Link
                    to="/juices"
                    className="block text-center w-full border border-orange-600 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
      `}</style>
    </div>
  );
};

export default Cart;