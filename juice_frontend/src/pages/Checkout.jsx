// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const directCheckout = location.state?.directCheckout;
  const directJuice = location.state?.juice;
  const directQuantity = location.state?.quantity || 1;

  // Loading states
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [error, setError] = useState("");

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // New address form
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    alternatePhone: "",
    addressType: "home",
    isDefault: false
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });

  // Order summary
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    totalPrice: 0,
    discount: 0,
    finalPrice: 0
  });

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Form errors
  const [addressErrors, setAddressErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  // Fetch data on load
  useEffect(() => {
    fetchAddresses();
    if (!directCheckout) {
      fetchCart();
    } else {
      // Direct buy now
      if (directJuice) {
        const itemTotal = directJuice.price * directQuantity;
        const discount = itemTotal >= 500 ? itemTotal * 0.1 : 0;
        
        setOrderSummary({
          items: [{
            juice: directJuice,
            juiceId: directJuice._id,
            name: directJuice.name,
            quantity: directQuantity,
            price: directJuice.price,
            subtotal: itemTotal
          }],
          totalPrice: itemTotal,
          discount,
          finalPrice: itemTotal - discount
        });
      }
      setPageLoading(false);
    }
  }, []);

  // Fetch user's saved addresses from backend
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      // Fetch profile which contains addresses
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const profileAddresses = response.data.profile?.addresses || [];
      setAddresses(profileAddresses);
      
      // Auto-select default address if exists
      const defaultAddr = profileAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
      
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartData(response.data);
      
      const items = response.data.items?.map(item => ({
        juiceId: item.juice?._id,
        name: item.juice?.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })) || [];
      
      const totalPrice = response.data.totalPrice || 0;
      const discount = response.data.discount || 0;

      setOrderSummary({
        items,
        totalPrice,
        discount,
        finalPrice: totalPrice - discount
      });

    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setPageLoading(false);
    }
  };

  // Address validation
  const validateAddressForm = () => {
    const errors = {};
    if (!addressForm.street.trim()) errors.street = "Street address required";
    if (!addressForm.city.trim()) errors.city = "City required";
    if (!addressForm.state.trim()) errors.state = "State required";
    if (!addressForm.pincode.trim()) errors.pincode = "Pincode required";
    if (!/^\d{6}$/.test(addressForm.pincode)) errors.pincode = "Invalid pincode (6 digits)";
    if (!addressForm.phone.trim()) errors.phone = "Phone number required";
    if (!/^\d{10}$/.test(addressForm.phone)) errors.phone = "Invalid phone (10 digits)";
    if (addressForm.alternatePhone && !/^\d{10}$/.test(addressForm.alternatePhone)) {
      errors.alternatePhone = "Invalid alternate phone (10 digits)";
    }
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new address to backend
  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let response;
      
      if (editingAddress) {
        // Update existing address
        response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${editingAddress._id}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Add new address
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update addresses list
      setAddresses(response.data.addresses);
      
      // Select the newly added/updated address if it's default or first address
      const updatedAddr = response.data.addresses.find(
        addr => addr.isDefault || (!editingAddress && response.data.addresses.length === 1)
      );
      
      if (updatedAddr) {
        setSelectedAddress(updatedAddr);
      }

      // Reset form
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        street: "", city: "", state: "", pincode: "", country: "India", 
        phone: "", alternatePhone: "", addressType: "home", isDefault: false
      });
      setAddressErrors({});

      showToast(editingAddress ? "Address updated successfully" : "Address added successfully", "success");

    } catch (err) {
      console.error("Error saving address:", err);
      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // Delete address from backend
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses(response.data.addresses);
      
      // If selected address was deleted, select default or first address
      if (selectedAddress?._id === addressId) {
        const defaultAddr = response.data.addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (response.data.addresses.length > 0) {
          setSelectedAddress(response.data.addresses[0]);
        } else {
          setSelectedAddress(null);
        }
      }

      showToast("Address deleted successfully", "success");

    } catch (err) {
      console.error("Error deleting address:", err);
      setError(err.response?.data?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      phone: address.phone,
      alternatePhone: address.alternatePhone || "",
      addressType: address.addressType,
      isDefault: address.isDefault || false
    });
    setShowAddressForm(true);
  };

  // Select address
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
      type === "success" ? "bg-green-500" : 
      type === "error" ? "bg-red-500" : "bg-blue-500"
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Enter coupon code");
      return;
    }

    if (couponCode.toUpperCase() === "FIRST20") {
      const discount = orderSummary.totalPrice * 0.2;
      setAppliedCoupon({ code: couponCode, discount });
      setOrderSummary(prev => ({
        ...prev,
        discount,
        finalPrice: prev.totalPrice - discount
      }));
      setCouponError("");
      showToast("Coupon applied successfully!", "success");
    } else if (couponCode.toUpperCase() === "SAVE100") {
      const discount = 100;
      setAppliedCoupon({ code: couponCode, discount });
      setOrderSummary(prev => ({
        ...prev,
        discount,
        finalPrice: prev.totalPrice - discount
      }));
      setCouponError("");
      showToast("Coupon applied successfully!", "success");
    } else {
      setCouponError("Invalid coupon");
      showToast("Invalid coupon code", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    const originalDiscount = orderSummary.totalPrice >= 500 ? orderSummary.totalPrice * 0.1 : 0;
    setOrderSummary(prev => ({
      ...prev,
      discount: originalDiscount,
      finalPrice: prev.totalPrice - originalDiscount
    }));
    showToast("Coupon removed", "info");
  };

  // Format items for backend
  const formatItemsForBackend = () => {
    return orderSummary.items.map(item => ({
      juice: item.juiceId || item.juice?._id,
      name: item.name || item.juice?.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal || (item.price * item.quantity)
    }));
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast("Please select a delivery address", "error");
      return;
    }

    if (!paymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    if (paymentMethod === "upi" && !upiId) {
      showToast("Please enter UPI ID", "error");
      return;
    }

    if ((paymentMethod === "credit-card" || paymentMethod === "debit-card")) {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiry || !cardDetails.cvv) {
        showToast("Please fill all card details", "error");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const orderData = {
        items: formatItemsForBackend(),
        address: selectedAddress, // Use the selected address directly
        paymentMethod,
        totalPrice: orderSummary.totalPrice,
        discount: orderSummary.discount,
        finalPrice: orderSummary.finalPrice,
        ...(appliedCoupon && { 
          appliedCoupon: {
            code: appliedCoupon.code,
            discount: appliedCoupon.discount
          }
        })
      };

      let response;
      if (directCheckout) {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/buy-now`,
          {
            ...orderData,
            juiceId: directJuice._id,
            quantity: directQuantity
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Clear cart if not direct checkout
      if (!directCheckout) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/cart/clear`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (clearErr) {
          console.error("Error clearing cart:", clearErr);
        }
      }

      showToast("Order placed successfully!", "success");
      
      setTimeout(() => {
        navigate("/orders", { 
          state: { 
            orderPlaced: true,
            orderId: response.data.order?._id || response.data._id,
            estimatedDelivery: new Date(Date.now() + 30*60000).toISOString()
          } 
        });
      }, 1500);

    } catch (err) {
      console.error("Order placement error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to place order");
      showToast(err.response?.data?.message || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || loadingAddresses) return <PageLoader text="Loading checkout..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order in a few steps</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                1. Delivery Address
              </h2>

              {/* Saved Addresses */}
              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress?._id === addr._id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress?._id === addr._id}
                            onChange={() => handleSelectAddress(addr)}
                            className="mt-1 text-orange-600 focus:ring-orange-500"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium capitalize">
                                {addr.addressType === "home" ? "🏠 Home" : 
                                 addr.addressType === "work" ? "💼 Work" : "📍 Other"}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">{addr.street}</p>
                            <p className="text-sm text-gray-600">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">📞 {addr.phone}</p>
                            {addr.alternatePhone && (
                              <p className="text-sm text-gray-600">📞 {addr.alternatePhone} (Alternate)</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr);
                            }}
                            className="text-sm text-orange-600 hover:text-orange-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Button */}
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddress(null);
                    setAddressForm({
                      street: "", city: "", state: "", pincode: "", 
                      country: "India", phone: "", alternatePhone: "", 
                      addressType: "home", isDefault: addresses.length === 0 // First address is default
                    });
                  }}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Address
                </button>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    {editingAddress ? "Edit Address" : "New Address"}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <div className="flex gap-4">
                        {[
                          { value: "home", label: "Home" },
                          { value: "work", label: "Work" },
                          { value: "other", label: "Other" }
                        ].map((type) => (
                          <label key={type.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="addressType"
                              value={type.value}
                              checked={addressForm.addressType === type.value}
                              onChange={(e) => setAddressForm({...addressForm, addressType: e.target.value})}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                          addressErrors.street ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                        }`}
                        placeholder="Street Address *"
                      />
                      {addressErrors.street && (
                        <p className="text-xs text-red-500 mt-1">{addressErrors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.city ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="City *"
                        />
                        {addressErrors.city && (
                          <p className="text-xs text-red-500 mt-1">{addressErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.state ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="State *"
                        />
                        {addressErrors.state && (
                          <p className="text-xs text-red-500 mt-1">{addressErrors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.pincode ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="Pincode *"
                          maxLength="6"
                        />
                        {addressErrors.pincode && (
                          <p className="text-xs text-red-500 mt-1">{addressErrors.pincode}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                          addressErrors.phone ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                        }`}
                        placeholder="Phone Number *"
                        maxLength="10"
                      />
                      {addressErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">{addressErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={addressForm.alternatePhone}
                        onChange={(e) => setAddressForm({...addressForm, alternatePhone: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                          addressErrors.alternatePhone ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                        }`}
                        placeholder="Alternate Phone (Optional)"
                        maxLength="10"
                      />
                      {addressErrors.alternatePhone && (
                        <p className="text-xs text-red-500 mt-1">{addressErrors.alternatePhone}</p>
                      )}
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Set as default address</span>
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? <ButtonLoader /> : (editingAddress ? "Update Address" : "Save Address")}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setAddressErrors({});
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Review Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Review Items
              </h2>
              
              <div className="space-y-4">
                {orderSummary.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <img
                      src={item.juice?.images?.[0] || "https://via.placeholder.com/80"}
                      alt={item.name || item.juice?.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {item.name || item.juice?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-orange-600 mt-1">
                        ₹{item.price} × {item.quantity} = ₹{item.subtotal || (item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                3. Payment Method
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: "💵" },
                  { value: "upi", label: "UPI", icon: "📱" },
                  { value: "credit-card", label: "Credit Card", icon: "💳" },
                  { value: "debit-card", label: "Debit Card", icon: "💳" }
                ].map((method) => (
                  <div
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <p className="text-xs font-medium">{method.label}</p>
                  </div>
                ))}
              </div>

              {/* UPI Input */}
              {paymentMethod === "upi" && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="Enter UPI ID (e.g., name@okhdfcbank)"
                  />
                </div>
              )}

              {/* Card Details */}
              {(paymentMethod === "credit-card" || paymentMethod === "debit-card") && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="Card Number"
                    maxLength="16"
                  />
                  <input
                    type="text"
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="Name on Card"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      placeholder="CVV"
                      maxLength="3"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none text-sm"
                    disabled={appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1">
                    Coupon applied: ₹{appliedCoupon.discount} off
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">FIRST20</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">SAVE100</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{orderSummary.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{orderSummary.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                  <span>Total</span>
                  <span className="text-orange-600">₹{orderSummary.finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-800 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estimated delivery in 30 minutes
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <ButtonLoader /> : "Place Order"}
              </button>

              {!selectedAddress && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Please select a delivery address
                </p>
              )}
            </div>
          </div>
        </div>
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

export default Checkout;