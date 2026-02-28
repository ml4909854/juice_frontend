// src/utils/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Check if user is authenticated
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // If not authenticated, redirect to login
  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;