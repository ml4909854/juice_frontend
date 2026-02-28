// src/pages/JuiceDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loader, { PageLoader, ButtonLoader } from "../components/Loader";

const JuiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main states
  const [juice, setJuice] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allJuices, setAllJuices] = useState([]); // Changed from relatedJuices
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [allJuicesLoading, setAllJuicesLoading] = useState(false); // Changed
  const [error, setError] = useState("");

  // Image slider
  const [currentImage, setCurrentImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Quantity and actions
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [hoveredJuice, setHoveredJuice] = useState(null);
  const [addingToCartMap, setAddingToCartMap] = useState({});
  const [buyNowLoadingMap, setBuyNowLoadingMap] = useState({});
  const [wishlistLoadingMap, setWishlistLoadingMap] = useState({});

  // All juices pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState("new");
  const [category, setCategory] = useState("");
  const limit = 8;

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch juice details and reviews
  useEffect(() => {
    fetchJuiceDetails();
    fetchReviews();
    checkCanReview();
  }, [id]);

  // Fetch all juices when component mounts or filters change
  useEffect(() => {
    fetchAllJuices();
  }, [currentPage, sort, category]);

  const fetchJuiceDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/juices/${id}`,
      );
      setJuice(response.data.juice);
      setError("");
    } catch (err) {
      setError("Failed to load juice details. Please try again.");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${id}`,
      );
      setReviews(response.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Fetch all juices with pagination
  const fetchAllJuices = async () => {
    setAllJuicesLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        sort,
        ...(category && { category }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/juices/search/filter?${params}`,
      );

      setAllJuices(response.data.juices || []);
      setTotalPages(response.data.pages || 1);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      console.error("Error fetching juices:", err);
    } finally {
      setAllJuicesLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setCanReview(false);
    } catch (err) {
      console.error("Error checking review eligibility:", err);
    }
  };

  const handleAddToCart = async (juiceId, quantity = 1) => {
    setAddingToCartMap((prev) => ({ ...prev, [juiceId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/juices/${id}` } });
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("✅ Added to cart successfully!", "green");
    } catch (err) {
      showToast("Failed to add to cart", "red");
    } finally {
      setAddingToCartMap((prev) => ({ ...prev, [juiceId]: false }));
    }
  };

  // Update this function in your JuiceDetails.jsx

  const handleBuyNow = async (juiceId, quantity = 1, juiceData = null) => {
    setBuyNowLoadingMap((prev) => ({ ...prev, [juiceId]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/juices/${id}` } });
        return;
      }

      // If we have the full juice data from the card, use it
      if (juiceData) {
        navigate("/checkout", {
          state: {
            directCheckout: true,
            juice: juiceData, // Pass the full juice data
            quantity: quantity,
          },
        });
        return;
      }

      // Otherwise fetch the juice data first (for the main product)
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/juices/${juiceId}`,
      );

      navigate("/checkout", {
        state: {
          directCheckout: true,
          juice: response.data.juice,
          quantity: quantity,
        },
      });
    } catch (err) {
      showToast("Failed to process. Please try again.", "red");
    } finally {
      setBuyNowLoadingMap((prev) => ({ ...prev, [juiceId]: false }));
    }
  };

  const handleAddToWishlist = async (juiceId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/juices/${id}` } });
      return;
    }

    setWishlistLoadingMap((prev) => ({ ...prev, [juiceId]: true }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists/add/${juiceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      showToast("❤️ Added to wishlist!", "pink");
    } catch (err) {
      if (err.response?.status === 400) {
        showToast(
          err.response?.data?.message || "Already in wishlist!",
          "orange",
        );
      } else {
        showToast(
          err.response?.data?.message || "Failed to add to wishlist",
          "red",
        );
      }
    } finally {
      setWishlistLoadingMap((prev) => ({ ...prev, [juiceId]: false }));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);
      reviewImages.forEach((file) => formData.append("images", file));

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      showToast("Review submitted successfully!", "green");
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment("");
      setReviewImages([]);
      fetchReviews();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to submit review",
        "red",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const showToast = (message, color) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 bg-${color}-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const renderStars = (rating, interactive = false, setRating = null) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && setRating && setRating(i + 1)}
        className={`focus:outline-none ${interactive ? "cursor-pointer" : "cursor-default"}`}
        disabled={!interactive}
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          } ${interactive ? "hover:scale-110" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ));
  };

  // Calculate discount
  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Category options for filter
  const categories = [
    { value: "", label: "All Categories" },
    { value: "detox", label: "Detox" },
    { value: "vitamin", label: "Vitamin" },
    { value: "energy", label: "Energy" },
    { value: "protein", label: "Protein" },
    { value: "weight-loss", label: "Weight Loss" },
    { value: "immunity", label: "Immunity" },
    { value: "hydration", label: "Hydration" },
    { value: "antioxidant", label: "Antioxidant" },
    { value: "fitness", label: "Fitness" },
    { value: "skin", label: "Skin" },
    { value: "digestive", label: "Digestive" },
  ];

  // Sort options
  const sortOptions = [
    { value: "new", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  if (pageLoading) return <PageLoader text="Loading juice details..." />;
  if (error || !juice)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || "Juice not found"}
          </h2>
          <Link
            to="/juices"
            className="mt-4 inline-block bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            Browse Juices
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-orange-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/juices" className="hover:text-orange-600">
            Juices
          </Link>
          <span>/</span>
          <span className="text-orange-600 font-medium">{juice.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group aspect-square">
              {loading ? (
                <Loader type="spinner" size="lg" color="orange" />
              ) : (
                <>
                  <img
                    src={juice.images?.[currentImage] || juice.images?.[0]}
                    alt={juice.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {juice.images?.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImage(
                            (prev) =>
                              (prev - 1 + juice.images.length) %
                              juice.images.length,
                          )
                        }
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImage(
                            (prev) => (prev + 1) % juice.images.length,
                          )
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
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
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {juice.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {juice.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-none w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === idx
                        ? "border-orange-600 scale-105 shadow-lg"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold capitalize">
                {juice.category}
              </span>
              {juice.stock > 0 ? (
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                  In Stock ({juice.stock})
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black text-gray-800">{juice.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex">
                {renderStars(Math.floor(juice.averageRating || 0))}
              </div>
              <span className="text-gray-500">
                ({juice.reviewCount || 0} Reviews)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-orange-600">
                ₹{juice.price}
              </span>
              {juice.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{juice.originalPrice}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{juice.description}</p>

            {juice.benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {juice.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                    >
                      ✅ {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {juice.ingredients?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                <div className="grid grid-cols-2 gap-2">
                  {juice.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-sm text-gray-500">
                        ({ing.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and actions */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                >
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-16 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleBuyNow(juice._id, quantity)}
                disabled={buyNowLoadingMap[juice._id] || juice.stock <= 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {buyNowLoadingMap[juice._id] ? <ButtonLoader /> : "Buy Now"}
              </button>
              <button
                onClick={() => handleAddToCart(juice._id, quantity)}
                disabled={addingToCartMap[juice._id] || juice.stock <= 0}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {addingToCartMap[juice._id] ? <ButtonLoader /> : "Add to Cart"}
              </button>
              <button
                onClick={(e) => handleAddToWishlist(juice._id, e)}
                disabled={wishlistLoadingMap[juice._id]}
                className="p-4 border-2 border-orange-600 text-orange-600 rounded-xl hover:bg-orange-50 transition-all transform hover:scale-105"
                title="Add to Wishlist"
              >
                {wishlistLoadingMap[juice._id] ? (
                  <Loader type="spinner" size="sm" color="orange" />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100">
              <h3 className="text-xl font-bold mb-4">Share Your Experience</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {renderStars(reviewRating, true, setReviewRating)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                    placeholder="Tell us about your experience..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (optional, max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReviewImages([...e.target.files])}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all disabled:opacity-50"
                  >
                    {submittingReview ? <ButtonLoader /> : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviewLoading ? (
            <div className="flex justify-center py-12">
              <Loader type="bounce" size="lg" color="orange" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        review.user?.avatar || "https://via.placeholder.com/50"
                      }
                      alt={review.user?.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">
                          {review.user?.username || "Anonymous"}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Review"
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Juices Section with Filters and Pagination */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              All Juices
            </h2>
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {allJuicesLoading ? (
            <div className="flex justify-center py-12">
              <Loader type="bounce" size="lg" color="orange" />
            </div>
          ) : allJuices.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No juices found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allJuices.map((item) => {
                  const discount = calculateDiscount(
                    item.price,
                    item.originalPrice,
                  );
                  const isHovered = hoveredJuice === item._id;

                  return (
                    <div
                      key={item._id}
                      onMouseEnter={() => setHoveredJuice(item._id)}
                      onMouseLeave={() => setHoveredJuice(null)}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
                      onClick={() => navigate(`/juices/${item._id}`)}
                    >
                      {/* Image Container */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            item.images?.[0] ||
                            "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60"
                          }
                          alt={item.name}
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

                        {/* Category Badge */}
                        <div className="absolute top-3 right-12 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium shadow-lg z-10 capitalize">
                          {item.category}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleAddToWishlist(item._id, e)}
                          disabled={wishlistLoadingMap[item._id]}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-orange-600 rounded-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-20"
                          title="Add to Wishlist"
                        >
                          {wishlistLoadingMap[item._id] ? (
                            <Loader type="spinner" size="sm" color="orange" />
                          ) : (
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
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Stock Status */}
                        {item.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-30">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform -rotate-3 shadow-2xl">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Hover Action Buttons */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(item._id, 1);
                            }}
                            disabled={
                              buyNowLoadingMap[item._id] || item.stock <= 0
                            }
                            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center gap-1"
                          >
                            {buyNowLoadingMap[item._id] ? (
                              <ButtonLoader />
                            ) : (
                              <>
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
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                                Buy Now
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item._id, 1);
                            }}
                            disabled={
                              addingToCartMap[item._id] || item.stock <= 0
                            }
                            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center gap-1"
                          >
                            {addingToCartMap[item._id] ? (
                              <ButtonLoader />
                            ) : (
                              <>
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
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                          {item.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(item.averageRating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            ({item.reviewCount || 0})
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {item.description ||
                            "Freshly squeezed juice packed with nutrients and vitamins."}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1 || allJuicesLoading}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={allJuicesLoading}
                            className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-110"
                                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span
                            key={i}
                            className="w-8 text-center text-gray-400 font-bold"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || allJuicesLoading}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-orange-500"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={juice.images?.[currentImage]}
            alt={juice.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {juice.images?.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(
                    (prev) =>
                      (prev - 1 + juice.images.length) % juice.images.length,
                  );
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage((prev) => (prev + 1) % juice.images.length);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
      `}</style>
    </div>
  );
};

export default JuiceDetails;
