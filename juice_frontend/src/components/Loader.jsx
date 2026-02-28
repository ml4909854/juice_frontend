// src/components/Loader.jsx
import React from 'react';

const Loader = ({ size = "md", color = "orange", fullScreen = false, text = "Loading..." }) => {
  
  // Size mappings
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  // Color mappings
  const colors = {
    orange: "border-orange-500 text-orange-500",
    blue: "border-blue-500 text-blue-500",
    green: "border-green-500 text-green-500",
    red: "border-red-500 text-red-500",
    purple: "border-purple-500 text-purple-500",
    white: "border-white text-white"
  };

  // Different loader types
  const LoaderTypes = {
    spinner: (
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-gray-200 ${colors[color]} border-t-transparent rounded-full animate-spin`}></div>
      </div>
    ),
    
    pulse: (
      <div className={`${sizes[size]} ${colors[color].replace('border', 'bg')} rounded-full animate-pulse opacity-75`}></div>
    ),
    
    dots: (
      <div className="flex space-x-2">
        <div className={`w-3 h-3 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-3 h-3 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`w-3 h-3 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    ),
    
    circle: (
      <svg className={`${sizes[size]} animate-spin ${colors[color]}`} viewBox="0 0 50 50">
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
        ></circle>
        <circle
          className="opacity-75"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset="31.4"
        ></circle>
      </svg>
    ),
    
    bounce: (
      <div className="flex space-x-2">
        <div className={`w-4 h-4 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`}></div>
        <div className={`w-4 h-4 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '100ms' }}></div>
        <div className={`w-4 h-4 ${colors[color].replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '200ms' }}></div>
      </div>
    ),
    
    wave: (
      <div className="flex space-x-1">
        <div className={`w-2 h-8 ${colors[color].replace('border', 'bg')} rounded-full animate-wave`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-8 ${colors[color].replace('border', 'bg')} rounded-full animate-wave`} style={{ animationDelay: '100ms' }}></div>
        <div className={`w-2 h-8 ${colors[color].replace('border', 'bg')} rounded-full animate-wave`} style={{ animationDelay: '200ms' }}></div>
        <div className={`w-2 h-8 ${colors[color].replace('border', 'bg')} rounded-full animate-wave`} style={{ animationDelay: '300ms' }}></div>
        <div className={`w-2 h-8 ${colors[color].replace('border', 'bg')} rounded-full animate-wave`} style={{ animationDelay: '400ms' }}></div>
      </div>
    )
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4 min-w-[200px]">
          {LoaderTypes.spinner}
          <p className="text-gray-600 font-medium animate-pulse">{text}</p>
        </div>
      </div>
    );
  }

  return LoaderTypes.spinner;
};

// Page Loader Component (for route changes)
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading amazing juices...</p>
      </div>
    </div>
  );
};

// Button Loader
export const ButtonLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

export default Loader;