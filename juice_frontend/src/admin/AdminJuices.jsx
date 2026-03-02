import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as adminService from "./adminService";
import { PageLoader } from "../components/Loader";

const AdminJuices = () => {
  const [juices, setJuices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJuices, setTotalJuices] = useState(0);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingJuice, setEditingJuice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [juiceToDelete, setJuiceToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJuice, setViewingJuice] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    ingredients: [{ name: "", quantity: "" }],
    benefits: [""],
    images: []
  });

  const categories = [
    "detox", "vitamin", "energy", "protein", "weight-loss",
    "immunity", "hydration", "antioxidant", "fitness", "skin", "digestive"
  ];

  const limit = 8;

  useEffect(() => {
    fetchJuices();
  }, [currentPage, searchTerm, selectedCategory]);

  // Fetch juices using the correct endpoint
  const fetchJuices = async () => {
    setLoading(true);
    try {
      // Use the search/filter endpoint to get juices
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/juices/search/filter?page=${currentPage}&limit=${limit}&search=${searchTerm}&category=${selectedCategory}`
      );
      const data = await response.json();
      setJuices(data.juices || []);
      setTotalPages(data.pages || 1);
      setTotalJuices(data.total || 0);
    } catch (err) {
      setError("Failed to load juices");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: "", quantity: "" }]
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: updatedIngredients });
    }
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData({ ...formData, benefits: updatedBenefits });
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ""] });
  };

  const removeBenefit = (index) => {
    if (formData.benefits.length > 1) {
      const updatedBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData({ ...formData, benefits: updatedBenefits });
    }
  };

  // Handle multiple image upload (up to 6)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate max 6 images
    if (files.length > 6) {
      alert("Maximum 6 images allowed");
      return;
    }

    // Validate file size (max 2MB)
    const invalidFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert("Each image must be less than 2MB");
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      alert("Only JPG, PNG, JPEG and WEBP images are allowed");
      return;
    }

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    // Store files for upload
    setFormData({ ...formData, images: files });
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newFiles = [...formData.images];
    newFiles.splice(index, 1);
    setFormData({ ...formData, images: newFiles });
  };

  // Create new juice
  const handleCreateJuice = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock || "0");
      
      // Filter and append ingredients (remove empty ones)
      const filteredIngredients = formData.ingredients.filter(
        ing => ing.name.trim() !== "" && ing.quantity.trim() !== ""
      );
      formDataToSend.append("ingredients", JSON.stringify(filteredIngredients));
      
      // Filter and append benefits (remove empty ones)
      const filteredBenefits = formData.benefits.filter(b => b.trim() !== "");
      formDataToSend.append("benefits", JSON.stringify(filteredBenefits));
      
      // Append images
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach(file => {
          formDataToSend.append("images", file);
        });
      } else {
        alert("Please select at least one image");
        setUploading(false);
        return;
      }

      // Make API call to the correct endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/juices/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create juice");
      }

      // Success
      alert("Juice created successfully!");
      fetchJuices();
      resetForm();
      setShowModal(false);
      
    } catch (err) {
      console.error("Error creating juice:", err);
      alert(err.message || "Failed to create juice");
    } finally {
      setUploading(false);
    }
  };

  // Update existing juice
  const handleUpdateJuice = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock || "0");
      
      // Filter and append ingredients
      const filteredIngredients = formData.ingredients.filter(
        ing => ing.name.trim() !== "" && ing.quantity.trim() !== ""
      );
      formDataToSend.append("ingredients", JSON.stringify(filteredIngredients));
      
      // Filter and append benefits
      const filteredBenefits = formData.benefits.filter(b => b.trim() !== "");
      formDataToSend.append("benefits", JSON.stringify(filteredBenefits));
      
      // Append new images if selected
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach(file => {
          formDataToSend.append("images", file);
        });
      }

      // Make API call to update juice
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/juices/${editingJuice._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update juice");
      }

      // Success
      alert("Juice updated successfully!");
      fetchJuices();
      resetForm();
      setShowModal(false);
      
    } catch (err) {
      console.error("Error updating juice:", err);
      alert(err.message || "Failed to update juice");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (juice) => {
    setEditingJuice(juice);
    setFormData({
      name: juice.name || "",
      category: juice.category || "",
      description: juice.description || "",
      price: juice.price || "",
      stock: juice.stock || "",
      ingredients: juice.ingredients?.length ? juice.ingredients : [{ name: "", quantity: "" }],
      benefits: juice.benefits?.length ? juice.benefits : [""],
      images: []
    });
    setImagePreviews(juice.images || []);
    setShowModal(true);
  };

  const handleView = (juice) => {
    setViewingJuice(juice);
    setShowViewModal(true);
  };

  const handleDeleteClick = (juice) => {
    setJuiceToDelete(juice);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!juiceToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/juices/${juiceToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete juice");
      }

      alert("Juice deleted successfully!");
      fetchJuices();
      setShowDeleteModal(false);
      setJuiceToDelete(null);
      
    } catch (err) {
      console.error("Error deleting juice:", err);
      alert(err.message || "Failed to delete juice");
    }
  };

  const resetForm = () => {
    setEditingJuice(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      ingredients: [{ name: "", quantity: "" }],
      benefits: [""],
      images: []
    });
    setImagePreviews([]);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-l-4 border-red-500" };
    if (stock < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500" };
    return { label: "In Stock", color: "bg-green-100 text-green-800 border-l-4 border-green-500" };
  };

  if (loading && juices.length === 0) return <PageLoader text="Loading juices..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Juices Management</h1>
            <p className="text-orange-100 text-lg">Manage your juice inventory</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Juice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search juices by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Juices Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      ) : juices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🧃</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Juices Found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first juice</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Add Your First Juice
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {juices.map((juice) => {
              const stockStatus = getStockStatus(juice.stock);
              return (
                <div
                  key={juice._id}
                  className="group bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                    <img
                      src={juice.images?.[0] || "https://via.placeholder.com/400x200?text=No+Image"}
                      alt={juice.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {juice.images?.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        +{juice.images.length} photos
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium capitalize shadow-lg">
                      {juice.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {juice.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium text-gray-600">
                          {juice.averageRating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-orange-600">₹{juice.price}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleView(juice)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-orange-600 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(juice)}
                        className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(juice)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingJuice ? "Edit Juice" : "Add New Juice"}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={editingJuice ? handleUpdateJuice : handleCreateJuice} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Juice Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="e.g., Fresh Orange Juice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                  placeholder="Describe your juice..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Ingredient
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Quantity"
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      />
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Benefits</label>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Benefit
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Benefit"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images - Updated for multiple image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Max 6 images, 2MB each) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, WEBP up to 2MB</p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {imagePreviews.length} image(s) selected
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingJuice ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{editingJuice ? "Update Juice" : "Create Juice"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingJuice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{viewingJuice.name}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {viewingJuice.images && viewingJuice.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {viewingJuice.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${viewingJuice.name} ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-500 transition-colors"
                      onClick={() => window.open(img, "_blank")}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                  <p className="text-lg font-semibold text-gray-800 capitalize">{viewingJuice.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Price</h4>
                  <p className="text-2xl font-bold text-orange-600">₹{viewingJuice.price}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Stock</h4>
                  <p className="text-lg font-semibold text-gray-800">{viewingJuice.stock} units</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">{viewingJuice.averageRating?.toFixed(1) || "0.0"}</span>
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-500">({viewingJuice.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{viewingJuice.description}</p>
              </div>

              {viewingJuice.ingredients && viewingJuice.ingredients.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Ingredients</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingJuice.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-sm text-gray-500">({ing.quantity})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingJuice.benefits && viewingJuice.benefits.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingJuice.benefits.map((benefit, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && juiceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Juice</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{juiceToDelete.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJuices;