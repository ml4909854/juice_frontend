// src/pages/NotFound.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [loading, setLoading] = useState(false);

  // Auto redirect after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleRedirect();
    }
  }, [countdown]);

  const handleRedirect = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  // Fun facts or jokes to show on 404 page
  const funFacts = [
    "🍹 This page is like a juice that's out of stock",
    "🧃 404 means 'page not found' in human language",
    "🚀 Even rockets get lost sometimes",
    "🌿 This page has evaporated",
    "🍊 Orange you glad it's just a 404?",
    "💨 This page disappeared faster than cold juice on a hot day"
  ];

  const [randomFact] = useState(() => 
    funFacts[Math.floor(Math.random() * funFacts.length)]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Juice Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-6xl opacity-10 animate-float">🧃</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-10 animate-float animation-delay-1000">🍹</div>
        <div className="absolute top-40 right-40 text-6xl opacity-10 animate-float animation-delay-2000">🥤</div>
        <div className="absolute bottom-40 left-40 text-6xl opacity-10 animate-float animation-delay-3000">🍊</div>
      </div>

      {/* Main Content */}
      <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl w-full max-w-2xl p-8 md:p-12 border border-white/20 transform transition-all duration-500 hover:scale-105 animate-fade-in-up">
        
        {/* 404 Number with Animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 md:gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
              <span className="relative text-7xl md:text-9xl font-black bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                4
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-75 animate-pulse animation-delay-500"></div>
              <span className="relative text-7xl md:text-9xl font-black text-orange-500 animate-bounce">
                0
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-xl opacity-75 animate-pulse animation-delay-1000"></div>
              <span className="relative text-7xl md:text-9xl font-black bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                4
              </span>
            </div>
          </div>
          
          {/* Juice Glass Icon */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            The page you're looking for has been squeezed dry and evaporated into thin air!
          </p>
          
          {/* Fun Fact */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 max-w-md mx-auto">
            <p className="text-orange-700 text-sm flex items-center justify-center gap-2">
              <span className="text-xl">💡</span>
              {randomFact}
            </p>
          </div>
        </div>

        {/* Auto-redirect Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto-redirecting to homepage in</p>
                <p className="text-2xl font-bold text-orange-600">{countdown} seconds</p>
              </div>
            </div>
            <button
              onClick={handleRedirect}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Redirect Now"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          
          <Link
            to="/juices"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Browse Juices
          </Link>
          
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for juices..."
            className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                window.location.href = `/juices?search=${encodeURIComponent(e.target.value)}`;
              }
            }}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Lost? Don't worry, even the best explorers get lost sometimes. 
          Try one of the options above or use the search bar!
        </p>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-3000 {
          animation-delay: 3000ms;
        }
      `}</style>
    </div>
  );
};

export default NotFound;