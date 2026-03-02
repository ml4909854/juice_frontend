import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  try {
    const response = await API.get("/admin/dashboard");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== USERS ====================
export const getUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await API.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await API.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ORDERS ====================
export const getOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.search && { search: filters.search })
    });
    const response = await API.get(`/admin/orders?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await API.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePaymentStatus = async (orderId, status) => {
  try {
    const response = await API.patch(`/admin/orders/${orderId}/payment`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== JUICES ====================
export const getJuices = async (page = 1, limit = 10, search = "", category = "") => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category })
    });
    const response = await API.get(`/admin/juices?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createJuice = async (juiceData) => {
  try {
    const response = await API.post("/admin/juices", juiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateJuice = async (juiceId, juiceData) => {
  try {
    const response = await API.patch(`/admin/juices/${juiceId}`, juiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteJuice = async (juiceId) => {
  try {
    const response = await API.delete(`/admin/juices/${juiceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== REVIEWS ====================
export const getReviews = async (page = 1, limit = 10) => {
  try {
    const response = await API.get(`/admin/reviews?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await API.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};