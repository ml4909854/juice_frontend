// src/admin/Profile.jsx
import React, { useState, useEffect } from "react";
import { PageLoader } from "../components/Loader";
import axios from "axios";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "prefer-not-to-say",
    addresses: [],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      language: "en",
      favoriteCategories: []
    },
    dietaryPreferences: {
      isVegan: false,
      isSugarFree: false,
      isGlutenFree: false,
      allergies: []
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: ""
    }
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

  const categories = [
    "detox", "vitamin", "energy", "protein", "weight-loss",
    "immunity", "hydration", "antioxidant", "fitness", "skin", "digestive"
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const profileData = response.data.profile;
      setProfile(profileData);
      
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : "",
        gender: profileData.gender || "prefer-not-to-say",
        addresses: profileData.addresses || [],
        preferences: profileData.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          language: "en",
          favoriteCategories: []
        },
        dietaryPreferences: profileData.dietaryPreferences || {
          isVegan: false,
          isSugarFree: false,
          isGlutenFree: false,
          allergies: []
        },
        socialLinks: profileData.socialLinks || {
          facebook: "",
          instagram: "",
          twitter: ""
        }
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceChange = (e) => {
    const { name, checked, value } = e.target;
    if (name === "favoriteCategories") {
      const newFavorites = [...formData.preferences.favoriteCategories];
      if (checked) {
        newFavorites.push(value);
      } else {
        const index = newFavorites.indexOf(value);
        if (index > -1) newFavorites.splice(index, 1);
      }
      setFormData({
        ...formData,
        preferences: { ...formData.preferences, favoriteCategories: newFavorites }
      });
    } else {
      setFormData({
        ...formData,
        preferences: { ...formData.preferences, [name]: checked }
      });
    }
  };

  const handleDietaryChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      dietaryPreferences: { ...formData.dietaryPreferences, [name]: checked }
    });
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [name]: value }
    });
  };

  const handleAllergyAdd = (allergy) => {
    if (allergy && !formData.dietaryPreferences.allergies.includes(allergy)) {
      setFormData({
        ...formData,
        dietaryPreferences: {
          ...formData.dietaryPreferences,
          allergies: [...formData.dietaryPreferences.allergies, allergy]
        }
      });
    }
  };

  const handleAllergyRemove = (allergy) => {
    setFormData({
      ...formData,
      dietaryPreferences: {
        ...formData.dietaryPreferences,
        allergies: formData.dietaryPreferences.allergies.filter(a => a !== allergy)
      }
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/profile/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setProfile(response.data.profile);
      setAvatarPreview("");
      setAvatarFile(null);
      alert("Avatar updated successfully!");
    } catch (err) {
      alert("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data.profile);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (editingAddress) {
        response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${editingAddress._id}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/profile/addresses`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setFormData({ ...formData, addresses: response.data.addresses });
      setShowAddressModal(false);
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
      alert(editingAddress ? "Address updated!" : "Address added!");
    } catch (err) {
      alert("Failed to save address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/profile/addresses/${addressToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormData({ ...formData, addresses: response.data.addresses });
      setShowDeleteModal(false);
      setAddressToDelete(null);
      alert("Address deleted!");
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  if (loading) return <PageLoader text="Loading profile..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-blue-100 text-lg">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.fullName || 'User'}&background=3b82f6&color=fff&size=128`}
                    alt={profile?.fullName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors shadow-lg">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              {avatarPreview && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  {uploadingAvatar ? "Uploading..." : "Save Avatar"}
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{profile?.fullName || profile?.user?.username}</h2>
              <p className="text-gray-600">{profile?.user?.email}</p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  👑 Administrator
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🟢 Active
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  📅 Member since {new Date(profile?.stats?.memberSince).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-6 py-2 gap-2">
            {[
              { id: "personal", label: "Personal Info", icon: "👤" },
              { id: "addresses", label: "Addresses", icon: "📍" },
              { id: "preferences", label: "Preferences", icon: "⚙️" },
              { id: "dietary", label: "Dietary", icon: "🥗" },
              { id: "social", label: "Social Links", icon: "🌐" },
              { id: "stats", label: "Statistics", icon: "📊" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {editing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
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
                      isDefault: formData.addresses.length === 0
                    });
                    setShowAddressModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Address
                </button>
              </div>

              {formData.addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No addresses saved yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.addresses.map((addr, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                            {addr.addressType === "home" ? "🏠 Home" : addr.addressType === "work" ? "💼 Work" : "📍 Other"}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setAddressToDelete(addr);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-600 mt-2">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.preferences.emailNotifications}
                      onChange={handlePreferenceChange}
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">SMS Notifications</span>
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.preferences.smsNotifications}
                      onChange={handlePreferenceChange}
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Push Notifications</span>
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={formData.preferences.pushNotifications}
                      onChange={handlePreferenceChange}
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Language</h3>
                <select
                  name="language"
                  value={formData.preferences.language}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, language: e.target.value }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Favorite Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        name="favoriteCategories"
                        value={cat}
                        checked={formData.preferences.favoriteCategories.includes(cat)}
                        onChange={handlePreferenceChange}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Dietary Preferences Tab */}
          {activeTab === "dietary" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Dietary Restrictions</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Vegan</span>
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={formData.dietaryPreferences.isVegan}
                      onChange={handleDietaryChange}
                      disabled={!editing}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Sugar Free</span>
                    <input
                      type="checkbox"
                      name="isSugarFree"
                      checked={formData.dietaryPreferences.isSugarFree}
                      onChange={handleDietaryChange}
                      disabled={!editing}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Gluten Free</span>
                    <input
                      type="checkbox"
                      name="isGlutenFree"
                      checked={formData.dietaryPreferences.isGlutenFree}
                      onChange={handleDietaryChange}
                      disabled={!editing}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Allergies</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.dietaryPreferences.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
                      {allergy}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => handleAllergyRemove(allergy)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add allergy (e.g., nuts, dairy)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                      id="allergyInput"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('allergyInput');
                        handleAllergyAdd(input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Social Links Tab */}
          {activeTab === "social" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleSocialChange}
                    disabled={!editing}
                    placeholder="https://facebook.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleSocialChange}
                    disabled={!editing}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialChange}
                    disabled={!editing}
                    placeholder="https://twitter.com/username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{profile?.stats?.totalOrders || 0}</div>
                  <p className="text-gray-600">Total Orders</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">₹{profile?.stats?.totalSpent?.toFixed(2) || 0}</div>
                  <p className="text-gray-600">Total Spent</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{profile?.stats?.loyaltyPoints || 0}</div>
                  <p className="text-gray-600">Loyalty Points</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-800">
                      {new Date(profile?.stats?.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-800">
                      {new Date(profile?.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="flex gap-4">
                  {["home", "work", "other"].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={addressForm.addressType === type}
                        onChange={handleAddressChange}
                        className="text-blue-600 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  placeholder="City *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  placeholder="State *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  placeholder="Pincode *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>

              <input
                type="text"
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                placeholder="Phone Number *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAddress ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
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

      {/* Delete Address Modal */}
      {showDeleteModal && addressToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Delete Address</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this address?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAddress}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;