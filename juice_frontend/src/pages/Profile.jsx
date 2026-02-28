// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const Profile = () => {
  const navigate = useNavigate();
  
  // States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "prefer-not-to-say"
  });

  const [addressForm, setAddressForm] = useState({
    addressType: "home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    isDefault: false
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: "en",
    favoriteCategories: []
  });

  // Fetch profile on load
  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/profile" } });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data.profile);
      
      // Set form data from profile
      setFormData({
        fullName: response.data.profile.fullName || "",
        phone: response.data.profile.phone || "",
        dateOfBirth: response.data.profile.dateOfBirth ? response.data.profile.dateOfBirth.split('T')[0] : "",
        gender: response.data.profile.gender || "prefer-not-to-say"
      });

      // Set preferences
      if (response.data.profile.preferences) {
        setPreferences(response.data.profile.preferences);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    const { name, checked, value, type } = e.target;
    if (type === "checkbox") {
      setPreferences({ ...preferences, [name]: checked });
    } else {
      setPreferences({ ...preferences, [name]: value });
    }
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => {
      const favs = [...prev.favoriteCategories];
      if (favs.includes(category)) {
        return { ...prev, favoriteCategories: favs.filter(c => c !== category) };
      } else {
        return { ...prev, favoriteCategories: [...favs, category] };
      }
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!imageFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", imageFile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/profile/avatar`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      setProfile(response.data.profile);
      setImagePreview("");
      setImageFile(null);
      showToast("Avatar updated successfully", "success");

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload avatar", "error");
    } finally {
      setUploading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data.profile);
      setEditing(false);
      showToast("Profile updated successfully", "success");

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async () => {
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/profile/preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(prev => ({ ...prev, preferences: response.data.preferences }));
      showToast("Preferences updated successfully", "success");

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update preferences", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Add address
  const handleAddAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.phone) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      let response;

      if (editingAddress) {
        // Update existing address
        response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${editingAddress._id}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Address updated successfully", "success");
      } else {
        // Add new address
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Address added successfully", "success");
      }

      setProfile(prev => ({ ...prev, addresses: response.data.addresses }));
      setAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        addressType: "home",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        phone: "",
        isDefault: false
      });

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save address", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(prev => ({ ...prev, addresses: response.data.addresses }));
      showToast("Address deleted successfully", "success");

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete address", "error");
    }
  };

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setAddressModal(true);
  };

  // Categories for preferences
  const categories = [
    { value: "detox", label: "Detox", icon: "🌿" },
    { value: "vitamin", label: "Vitamin", icon: "🍊" },
    { value: "energy", label: "Energy", icon: "⚡" },
    { value: "protein", label: "Protein", icon: "💪" },
    { value: "weight-loss", label: "Weight Loss", icon: "⚖️" },
    { value: "immunity", label: "Immunity", icon: "🛡️" },
    { value: "hydration", label: "Hydration", icon: "💧" },
    { value: "antioxidant", label: "Antioxidant", icon: "✨" },
    { value: "fitness", label: "Fitness", icon: "🏋️" },
    { value: "skin", label: "Skin", icon: "🌟" },
    { value: "digestive", label: "Digestive", icon: "🌱" }
  ];

  if (pageLoading) return <PageLoader text="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast Notification */}
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader type="bounce" size="lg" color="orange" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Profile Header with Avatar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-orange-200">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={profile?.avatar || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_profile.png"} 
                        alt={profile?.fullName || "Profile"} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-lg">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{profile?.fullName || profile?.user?.username}</h2>
                  <p className="text-gray-600">{profile?.user?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Member since {new Date(profile?.stats?.memberSince).toLocaleDateString()}</p>
                </div>

                {/* Upload Button */}
                {imagePreview && (
                  <button
                    onClick={handleUploadAvatar}
                    disabled={uploading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <ButtonLoader /> : "Upload Avatar"}
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              {[
                { id: "profile", label: "Profile Information", icon: "👤" },
                { id: "addresses", label: "Addresses", icon: "📍" },
                { id: "preferences", label: "Preferences", icon: "⚙️" },
                { id: "stats", label: "Statistics", icon: "📊" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-600 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile?.fullName || "Not provided"}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-800 py-2">{profile?.user?.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        {editing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">{profile?.phone || "Not provided"}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        {editing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                          />
                        ) : (
                          <p className="text-gray-800 py-2">
                            {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        {editing ? (
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                        ) : (
                          <p className="text-gray-800 py-2 capitalize">{profile?.gender?.replace(/-/g, ' ') || "Not provided"}</p>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleUpdateProfile}
                          disabled={updating}
                          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {updating ? <ButtonLoader /> : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          addressType: "home",
                          street: "",
                          city: "",
                          state: "",
                          pincode: "",
                          country: "India",
                          phone: "",
                          isDefault: false
                        });
                        setAddressModal(true);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      + Add New Address
                    </button>
                  </div>

                  {profile?.addresses?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No addresses saved yet. Click "Add New Address" to add one.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {profile?.addresses?.map((address, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium capitalize">
                                {address.addressType === "home" ? "🏠 Home" : address.addressType === "work" ? "💼 Work" : "📍 Other"}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-800 text-sm">{address.street}</p>
                          <p className="text-gray-600 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                          <p className="text-gray-600 text-sm mt-2">📞 {address.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4 mb-8">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Email Notifications</span>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">SMS Notifications</span>
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        checked={preferences.smsNotifications}
                        onChange={handlePreferenceChange}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Push Notifications</span>
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={preferences.pushNotifications}
                        onChange={handlePreferenceChange}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-gray-700 mb-2">Language</label>
                      <select
                        name="language"
                        value={preferences.language}
                        onChange={handlePreferenceChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="kn">Kannada</option>
                        <option value="ml">Malayalam</option>
                        <option value="bn">Bengali</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Favorite Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryToggle(cat.value)}
                        className={`p-3 rounded-lg border transition-all ${
                          preferences.favoriteCategories?.includes(cat.value)
                            ? "bg-orange-100 border-orange-500 text-orange-800"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50"
                        }`}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdatePreferences}
                      disabled={updating}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? <ButtonLoader /> : "Save Preferences"}
                    </button>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "stats" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Account Statistics</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{profile?.stats?.totalOrders || 0}</div>
                      <p className="text-gray-600">Total Orders</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">₹{profile?.stats?.totalSpent?.toFixed(2) || 0}</div>
                      <p className="text-gray-600">Total Spent</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{profile?.stats?.loyaltyPoints || 0}</div>
                      <p className="text-gray-600">Loyalty Points</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.floor((new Date() - new Date(profile?.stats?.memberSince)) / (1000 * 60 * 60 * 24 * 30))}
                      </div>
                      <p className="text-gray-600">Months as Member</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎉 You've earned {profile?.stats?.loyaltyPoints || 0} loyalty points! 
                      Redeem them on your next order for exciting discounts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Address Modal */}
      {addressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <div className="flex gap-4">
                  {["home", "work", "other"].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={addressForm.addressType === type}
                        onChange={handleAddressChange}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressChange}
                placeholder="Street Address *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  placeholder="City *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                />
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  placeholder="State *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  placeholder="Pincode *"
                  maxLength="6"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                />
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                />
              </div>

              <input
                type="tel"
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                placeholder="Phone Number *"
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddAddress}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {updating ? <ButtonLoader /> : (editingAddress ? "Update" : "Save")}
                </button>
                <button
                  onClick={() => {
                    setAddressModal(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;