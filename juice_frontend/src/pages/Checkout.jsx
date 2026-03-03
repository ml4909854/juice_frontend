// src/pages/Checkout.jsx - UPDATED WITH CORRECT FIELD NAMES
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from cart (if coming from cart)
  const cartItems = location.state?.items || [];
  const cartTotal = location.state?.totalPrice || 0;
  const cartDiscount = location.state?.discount || 0;
  const cartFinal = location.state?.finalPrice || 0;
  const fromCart = location.state?.fromCart || false;

  // Direct checkout (buy now)
  const directCheckout = location.state?.directCheckout;
  const directJuice = location.state?.juice;
  const directQuantity = location.state?.quantity || 1;

  // Loading states
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
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
    isDefault: false,
  });

  // Payment states - IMPORTANT: Use values that match backend enum
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod", "upi", "credit-card", "debit-card"
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  // Razorpay states
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Order summary
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    totalPrice: 0,
    discount: 0,
    finalPrice: 0,
  });

  // Image error states
  const [imageErrors, setImageErrors] = useState({});

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Form errors
  const [addressErrors, setAddressErrors] = useState({});

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
      if (!loaded) {
        console.error("Razorpay failed to load");
        showToast("Payment system failed to load", "error");
      }
    });
  }, []);

  // Initialize order summary
  useEffect(() => {
    console.log("Checkout received state:", location.state);

    if (fromCart) {
      setOrderSummary({
        items: cartItems.map((item) => ({
          juiceId: item.juiceId, // Keep for internal use
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          subtotal: item.subtotal || item.price * item.quantity,
        })),
        totalPrice: cartTotal,
        discount: cartDiscount,
        finalPrice: cartFinal,
      });
      setPageLoading(false);
    } else if (directCheckout && directJuice) {
      const itemTotal = directJuice.price * directQuantity;
      const discount = itemTotal >= 500 ? itemTotal * 0.1 : 0;

      setOrderSummary({
        items: [
          {
            juiceId: directJuice._id,
            name: directJuice.name,
            quantity: directQuantity,
            price: directJuice.price,
            image: directJuice.images?.[0],
            subtotal: itemTotal,
          },
        ],
        totalPrice: itemTotal,
        discount,
        finalPrice: itemTotal - discount,
      });
      setPageLoading(false);
    } else {
      console.log("No checkout data, redirecting to cart");
      navigate("/cart");
    }
  }, []);

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const profileAddresses = response.data.profile?.addresses || [];
      setAddresses(profileAddresses);

      const defaultAddr = profileAddresses.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Validate address form
  const validateAddressForm = () => {
    const errors = {};
    if (!addressForm.street.trim()) errors.street = "Street address required";
    if (!addressForm.city.trim()) errors.city = "City required";
    if (!addressForm.state.trim()) errors.state = "State required";
    if (!addressForm.pincode.trim()) errors.pincode = "Pincode required";
    if (!/^\d{6}$/.test(addressForm.pincode))
      errors.pincode = "Invalid pincode (6 digits)";
    if (!addressForm.phone.trim()) errors.phone = "Phone number required";
    if (!/^\d{10}$/.test(addressForm.phone))
      errors.phone = "Invalid phone (10 digits)";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save address
  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let response;
      if (editingAddress) {
        response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${editingAddress._id}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setAddresses(response.data.addresses);

      const updatedAddr = response.data.addresses.find(
        (addr) =>
          addr.isDefault ||
          (!editingAddress && response.data.addresses.length === 1),
      );

      if (updatedAddr) {
        setSelectedAddress(updatedAddr);
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        phone: "",
        alternatePhone: "",
        addressType: "home",
        isDefault: false,
      });
      setAddressErrors({});

      showToast(
        editingAddress
          ? "Address updated successfully"
          : "Address added successfully",
        "success",
      );
    } catch (err) {
      console.error("Error saving address:", err);
      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAddresses(response.data.addresses);

      if (selectedAddress?._id === addressId) {
        const defaultAddr = response.data.addresses.find(
          (addr) => addr.isDefault,
        );
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
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  // Select address
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : "bg-blue-500"
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Handle image error
  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
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
      setOrderSummary((prev) => ({
        ...prev,
        discount,
        finalPrice: prev.totalPrice - discount,
      }));
      setCouponError("");
      showToast("Coupon applied successfully!", "success");
    } else if (couponCode.toUpperCase() === "SAVE100") {
      const discount = 100;
      setAppliedCoupon({ code: couponCode, discount });
      setOrderSummary((prev) => ({
        ...prev,
        discount,
        finalPrice: prev.totalPrice - discount,
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
    const originalDiscount =
      orderSummary.totalPrice >= 500 ? orderSummary.totalPrice * 0.1 : 0;
    setOrderSummary((prev) => ({
      ...prev,
      discount: originalDiscount,
      finalPrice: prev.totalPrice - originalDiscount,
    }));
    showToast("Coupon removed", "info");
  };

  // ===== IMPORTANT FIX: Format items for backend with correct field names =====
  const formatItemsForBackend = () => {
    if (!orderSummary.items || orderSummary.items.length === 0) {
      console.error("No items to format");
      return [];
    }

    // Backend expects "juice" field (not "juiceId")
    return orderSummary.items.map((item) => ({
      juice: item.juiceId, // ✅ Changed from juiceId to juice
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal || item.price * item.quantity,
    }));
  };

  // Create Razorpay order
  const createRazorpayOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payments/create-order`,
        { amount: orderSummary.finalPrice },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  // Verify payment
  const verifyPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payments/verify-payment`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  };

  // In Checkout.jsx - Update placeOrderInDatabase function

  const placeOrderInDatabase = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");

      // Determine the actual payment method based on selection
      let actualPaymentMethod = paymentMethod;
      if (paymentMethod === "razorpay") {
        if (upiId) {
          actualPaymentMethod = "upi";
        } else if (cardDetails.cardNumber) {
          actualPaymentMethod =
            cardDetails.cardNumber.length === 16 ? "credit-card" : "debit-card";
        } else {
          actualPaymentMethod = "upi";
        }
      }

      // Prepare order data - IMPORTANT: Include paymentStatus for online payments
      const orderData = {
        items: formatItemsForBackend(),
        address: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          phone: selectedAddress.phone,
          alternatePhone: selectedAddress.alternatePhone || "",
          addressType: selectedAddress.addressType || "home",
          country: selectedAddress.country || "India",
        },
        paymentMethod: actualPaymentMethod,
        totalPrice: orderSummary.totalPrice,
        discount: orderSummary.discount,
        finalPrice: orderSummary.finalPrice,
      };

      // Add paymentId and paymentStatus for online payments
      if (actualPaymentMethod !== "cod") {
        orderData.paymentId = paymentId;
        orderData.paymentStatus = "paid"; // ✅ Explicitly set payment status to paid
      }

      console.log(
        "Placing order with data:",
        JSON.stringify(orderData, null, 2),
      );

      let response;
      if (directCheckout) {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/buy-now`,
          {
            ...orderData,
            juiceId: directJuice._id,
            quantity: directQuantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/place`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      console.log("Order placed successfully:", response.data);

      // Clear cart if not direct checkout
      if (!directCheckout) {
        try {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (clearErr) {
          console.error("Error clearing cart:", clearErr);
        }
      }

      return response.data;
    } catch (err) {
      console.error("Order placement error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });

      const errorMessage =
        err.response?.data?.message || err.message || "Failed to place order";
      showToast(errorMessage, "error");

      throw err;
    }
  };
  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      showToast("Payment system not loaded. Please refresh.", "error");
      return;
    }

    setPaymentProcessing(true);

    try {
      // Create order on Razorpay
      const orderData = await createRazorpayOrder();

      // Get user details for prefill
      const token = localStorage.getItem("token");
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const user = userResponse.data.profile;
      const userEmail = user.email || "";
      const userPhone = selectedAddress?.phone || user.phone || "";

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Juice Shop",
        description: `Order for ${orderSummary.items.length} item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || "",
          email: userEmail,
          contact: userPhone,
        },
        notes: {
          address: selectedAddress
            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
            : "No address",
        },
        theme: {
          color: "#F97316",
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResult.success) {
              // Payment successful - create order in database
              const orderResult = await placeOrderInDatabase(
                response.razorpay_payment_id,
              );

              showToast("Payment successful! Order placed.", "success");
              setPaymentProcessing(false);

              // Navigate to orders page
              setTimeout(() => {
                navigate("/orders", {
                  state: {
                    orderPlaced: true,
                    orderId: orderResult.order?._id || orderResult._id,
                    items: orderSummary.items,
                    paymentId: response.razorpay_payment_id,
                  },
                });
              }, 1500);
            } else {
              showToast("Payment verification failed", "error");
              setPaymentProcessing(false);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            showToast("Payment verification failed", "error");
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            showToast("Payment cancelled", "info");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      showToast("Failed to initialize payment", "error");
      setPaymentProcessing(false);
    }
  };

  // Handle COD order
  const handleCODOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const orderData = {
        items: formatItemsForBackend(),
        address: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          phone: selectedAddress.phone,
          alternatePhone: selectedAddress.alternatePhone || "",
          addressType: selectedAddress.addressType || "home",
          country: selectedAddress.country || "India",
        },
        paymentMethod: "cod",
        paymentStatus: "pending", // ✅ Explicitly set for COD
        totalPrice: orderSummary.totalPrice,
        discount: orderSummary.discount,
        finalPrice: orderSummary.finalPrice,
      };

      console.log("Placing COD order:", orderData);

      let response;
      if (directCheckout) {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/buy-now`,
          {
            ...orderData,
            juiceId: directJuice._id,
            quantity: directQuantity,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/orders/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      if (!directCheckout) {
        try {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (clearErr) {
          console.error("Error clearing cart:", clearErr);
        }
      }

      showToast("Order placed successfully!", "success");
      setLoading(false);

      setTimeout(() => {
        navigate("/orders", {
          state: {
            orderPlaced: true,
            orderId: response.data.order?._id || response.data._id,
            items: orderSummary.items,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Order placement error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to place order");
      showToast(
        err.response?.data?.message || "Failed to place order",
        "error",
      );
      setLoading(false);
    }
  };
  // Main place order handler
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast("Please select a delivery address", "error");
      return;
    }

    if (!paymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    // Validate items have juiceId
    const missingJuiceId = orderSummary.items.some((item) => !item.juiceId);
    if (missingJuiceId) {
      console.error("Items missing juiceId:", orderSummary.items);
      showToast("Invalid item data - missing juice ID", "error");
      return;
    }

    if (paymentMethod === "cod") {
      await handleCODOrder();
    } else {
      // For all online payments (razorpay, upi, credit-card, debit-card)
      await handleRazorpayPayment();
    }
  };

  if (pageLoading || loadingAddresses)
    return <PageLoader text="Loading checkout..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600 mt-1">
            Complete your order in a few steps
          </p>
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
                                {addr.addressType === "home"
                                  ? "🏠 Home"
                                  : addr.addressType === "work"
                                    ? "💼 Work"
                                    : "📍 Other"}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">
                              {addr.street}
                            </p>
                            <p className="text-sm text-gray-600">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              📞 {addr.phone}
                            </p>
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
                      street: "",
                      city: "",
                      state: "",
                      pincode: "",
                      country: "India",
                      phone: "",
                      alternatePhone: "",
                      addressType: "home",
                      isDefault: addresses.length === 0,
                    });
                  }}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
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
                          { value: "other", label: "Other" },
                        ].map((type) => (
                          <label
                            key={type.value}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name="addressType"
                              value={type.value}
                              checked={addressForm.addressType === type.value}
                              onChange={(e) =>
                                setAddressForm({
                                  ...addressForm,
                                  addressType: e.target.value,
                                })
                              }
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            street: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                          addressErrors.street
                            ? "border-red-500"
                            : "border-gray-300 focus:border-orange-500"
                        }`}
                        placeholder="Street Address *"
                      />
                      {addressErrors.street && (
                        <p className="text-xs text-red-500 mt-1">
                          {addressErrors.street}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.city
                              ? "border-red-500"
                              : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="City *"
                        />
                        {addressErrors.city && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              state: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.state
                              ? "border-red-500"
                              : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="State *"
                        />
                        {addressErrors.state && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressErrors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              pincode: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                            addressErrors.pincode
                              ? "border-red-500"
                              : "border-gray-300 focus:border-orange-500"
                          }`}
                          placeholder="Pincode *"
                          maxLength="6"
                        />
                        {addressErrors.pincode && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressErrors.pincode}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              country: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            phone: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none ${
                          addressErrors.phone
                            ? "border-red-500"
                            : "border-gray-300 focus:border-orange-500"
                        }`}
                        placeholder="Phone Number *"
                        maxLength="10"
                      />
                      {addressErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">
                          {addressErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={addressForm.alternatePhone}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            alternatePhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                        placeholder="Alternate Phone (Optional)"
                        maxLength="10"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            isDefault: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">
                        Set as default address
                      </span>
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveAddress}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <ButtonLoader />
                        ) : editingAddress ? (
                          "Update Address"
                        ) : (
                          "Save Address"
                        )}
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
                  <div
                    key={idx}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      {item.image && !imageErrors[idx] ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={() => handleImageError(idx)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-100">
                          <span className="text-2xl">🧃</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-orange-600 mt-1">
                        ₹{item.price} × {item.quantity} = ₹
                        {item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Section - UPDATED with all payment methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                3. Payment Method
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: "💵" },
                  { value: "upi", label: "UPI", icon: "📱" },
                  { value: "credit-card", label: "Credit Card", icon: "💳" },
                  { value: "debit-card", label: "Debit Card", icon: "💳" },
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
                  <p className="text-xs text-gray-500 mt-1">
                    You will be redirected to Razorpay for payment
                  </p>
                </div>
              )}

              {/* Card Details */}
              {(paymentMethod === "credit-card" ||
                paymentMethod === "debit-card") && (
                <div className="mt-4 space-y-3">
                 
                  <div className="grid grid-cols-2 gap-3">
                    
                  </div>
                  <p className="text-xs text-gray-500">
                    You will be redirected to Razorpay for payment
                  </p>
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
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
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
              </div>

              {/* Price Details */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{orderSummary.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{orderSummary.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ₹{orderSummary.finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-800 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
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
                  Estimated delivery in 30 minutes
                </p>
              </div>

              {/* Security Badge for online payments */}
              {paymentMethod !== "cod" && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Secure 256-bit SSL encrypted payment via Razorpay</span>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || paymentProcessing || !selectedAddress}
                className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading || paymentProcessing ? (
                  <ButtonLoader />
                ) : paymentMethod === "cod" ? (
                  "Place Order (Cash on Delivery)"
                ) : (
                  `Pay ₹${orderSummary.finalPrice.toFixed(2)}`
                )}
              </button>

              {!selectedAddress && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Please select a delivery address
                </p>
              )}

              {paymentProcessing && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Processing payment... Please don't close this window
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
