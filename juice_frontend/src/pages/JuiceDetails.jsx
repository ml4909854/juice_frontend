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
  const [relatedJuices, setRelatedJuices] = useState([]);
  const [canReview, setCanReview] = useState(false); // Whether user can write a review
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  // Image slider
  const [currentImage, setCurrentImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Quantity and actions
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Related juices filters
  const [relatedSort, setRelatedSort] = useState("new");
  const [relatedCategory, setRelatedCategory] = useState("all");

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

  // Fetch related juices when juice loads or filters change
  useEffect(() => {
    if (juice) {
      fetchRelatedJuices();
    }
  }, [juice, relatedSort, relatedCategory]);

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

  // Check if current user can review this juice (has ordered and delivered)
  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      // You need an endpoint like /reviews/can-review/:juiceId
      // For now, we'll assume false; replace with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/reviews/can-review/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setCanReview(response.data.canReview);
      setCanReview(false); // Placeholder
    } catch (err) {
      console.error("Error checking review eligibility:", err);
    }
  };

  const fetchRelatedJuices = async () => {
    if (!juice) return;
    setRelatedLoading(true);
    try {
      const params = new URLSearchParams({
        category: relatedCategory === "all" ? juice.category : relatedCategory,
        limit: 8,
        sort: relatedSort,
      });
      // Add exclude current juice if backend supports
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/juices/search/filter?${params}`,
      );
      // Filter out current juice
      const filtered = response.data.juices.filter((j) => j._id !== juice._id);
      setRelatedJuices(filtered.slice(0, 4)); // Show 4 related juices
    } catch (err) {
      console.error("Error fetching related juices:", err);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/juices/${id}` } });
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("✅ Added to cart successfully!", "green");
    } catch (err) {
      showToast("Failed to add to cart", "red");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setBuyNowLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/juices/${id}` } });
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
        { juiceId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/checkout", {
        state: { directCheckout: true, juice, quantity },
      });
    } catch (err) {
      showToast("Failed to process. Please try again.", "red");
    } finally {
      setBuyNowLoading(false);
    }
  };

  // Fixed wishlist handler (sends empty body, handles duplicate error)
  // ================= FIXED WISHLIST HANDLER =================
  const handleAddToWishlist = async (juiceId, e) => {
    // Prevent event bubbling and default behavior
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    console.log("Adding to wishlist - Juice ID:", juiceId); // Debug log

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/juices/${id}` } });
      return;
    }

    // Ensure we have a valid string ID
    const targetJuiceId = juiceId || id; // Use provided ID or fallback to page ID

    if (!targetJuiceId || typeof targetJuiceId !== "string") {
      console.error("Invalid juice ID:", targetJuiceId);
      showToast("Invalid juice ID", "red");
      return;
    }

    setWishlistLoading(true);

    try {
      // Make sure juiceId is a string in the URL
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/wishlists/add/${targetJuiceId}`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Wishlist response:", response.data);
      showToast("❤️ Added to wishlist!", "pink");
    } catch (err) {
      console.error("Wishlist error:", err.response?.data || err);

      // Handle specific error cases
      if (err.response?.status === 400) {
        showToast(
          err.response?.data?.message || "Already in wishlist!",
          "orange",
        );
      } else if (
        err.response?.data?.error?.includes("Cast to ObjectId failed")
      ) {
        showToast("Invalid juice ID format", "red");
      } else {
        showToast(
          err.response?.data?.message || "Failed to add to wishlist",
          "red",
        );
      }
    } finally {
      setWishlistLoading(false);
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
      // Create FormData for images
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
      fetchReviews(); // Refresh reviews
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
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
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
                onClick={handleBuyNow}
                disabled={buyNowLoading || juice.stock <= 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {buyNowLoading ? <ButtonLoader /> : "Buy Now"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || juice.stock <= 0}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {addingToCart ? <ButtonLoader /> : "Add to Cart"}
              </button>
              {/* In the action buttons section, update the wishlist button */}
              <button
                onClick={(e) => handleAddToWishlist(id, e)} // Pass id directly, not juice object
                disabled={wishlistLoading}
                className="p-4 border-2 border-orange-600 text-orange-600 rounded-xl hover:bg-orange-50 transition-all transform hover:scale-105"
                title="Add to Wishlist"
              >
                {wishlistLoading ? (
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

         {/* Related Juices Section with Sorting */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              Related Juices
            </h2>
            <div className="flex gap-4">
              <select
                value={relatedCategory}
                onChange={(e) => setRelatedCategory(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
              >
                <option value="all">All Categories</option>
                <option value={juice.category}>{juice.category}</option>
                {/* Add more categories if needed */}
              </select>
              <select
                value={relatedSort}
                onChange={(e) => setRelatedSort(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {relatedLoading ? (
            <div className="flex justify-center py-12">
              <Loader type="bounce" size="lg" color="orange" />
            </div>
          ) : relatedJuices.length === 0 ? (
            <p className="text-center text-gray-500">
              No related juices found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedJuices.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/juices/${item._id}`)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        item.images?.[0] || "https://via.placeholder.com/300"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        ₹{item.price}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(Math.floor(item.averageRating || 0))}
                        <span className="text-xs text-gray-500">
                          ({item.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      `}</style>
    </div>
  );
};

export default JuiceDetails;
