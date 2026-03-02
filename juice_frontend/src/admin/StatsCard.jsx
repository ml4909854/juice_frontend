import React from "react";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = "orange", 
  trend = null,
  subtitle = null,
  loading = false,
  onClick = null,
  progress = null,
  footer = null,
  badge = null,
  chart = null
}) => {
  const colors = {
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-orange-200",
      shadow: "shadow-orange-500/20"
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-blue-200",
      shadow: "shadow-blue-500/20"
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-green-200",
      shadow: "shadow-green-500/20"
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-purple-200",
      shadow: "shadow-purple-500/20"
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-red-200",
      shadow: "shadow-red-500/20"
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      iconBg: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      iconText: "text-white",
      trendUp: "text-green-600 bg-green-100",
      trendDown: "text-red-600 bg-red-100",
      border: "border-yellow-200",
      shadow: "shadow-yellow-500/20"
    }
  };

  const theme = colors[color] || colors.orange;

  // Format large numbers
  const formatValue = (val) => {
    if (val === undefined || val === null) return "0";
    if (typeof val === "number") {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  // Get trend icon and color
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const isPositive = trend > 0;
    const trendValue = Math.abs(trend);
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {isPositive ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        <span>{trendValue}%</span>
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            {subtitle && <div className="h-3 w-20 bg-gray-200 rounded"></div>}
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
        {progress && <div className="mt-4 h-2 bg-gray-200 rounded-full"></div>}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border ${theme.border} p-6 hover:shadow-2xl transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } group relative overflow-hidden`}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-white to-transparent opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              {title}
              {badge && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                  {badge}
                </span>
              )}
            </p>
            
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-bold text-gray-800">
                {formatValue(value)}
              </h3>
              {trend !== null && getTrendIcon()}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon with gradient background */}
          <div className={`w-14 h-14 ${theme.iconBg} rounded-xl flex items-center justify-center shadow-lg ${theme.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className={`text-2xl ${theme.iconText}`}>{icon}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-700">{progress.value}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 group-hover:animate-pulse ${
                  color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                  color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                  color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                  'bg-gradient-to-r from-orange-500 to-orange-400'
                }`}
                style={{ width: `${progress.value}%` }}
              />
            </div>
          </div>
        )}

        {/* Mini Chart (Sparkline) */}
        {chart && (
          <div className="mt-4 h-12">
            <svg width="100%" height="100%" viewBox="0 0 100 40" className="stroke-current" style={{ color: theme.text }}>
              <polyline
                points={chart}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </svg>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              {footer}
            </div>
          </div>
        )}

        {/* Hover Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
      </div>
    </div>
  );
};

// Pre-configured variants
export const UserStatsCard = ({ value, trend, loading, onClick }) => (
  <StatsCard
    title="Total Users"
    value={value}
    icon="👥"
    color="blue"
    trend={trend}
    subtitle="Active users this month"
    onClick={onClick}
    loading={loading}
    badge="Live"
  />
);

export const OrderStatsCard = ({ value, trend, loading, onClick }) => (
  <StatsCard
    title="Total Orders"
    value={value}
    icon="📦"
    color="green"
    trend={trend}
    subtitle="Orders this month"
    onClick={onClick}
    loading={loading}
  />
);

export const RevenueStatsCard = ({ value, trend, loading, onClick }) => (
  <StatsCard
    title="Total Revenue"
    value={value}
    icon="💰"
    color="orange"
    trend={trend}
    subtitle="Revenue this month"
    onClick={onClick}
    loading={loading}
    progress={{ value: 75 }}
  />
);

export const JuiceStatsCard = ({ value, trend, loading, onClick }) => (
  <StatsCard
    title="Juice Varieties"
    value={value}
    icon="🧃"
    color="purple"
    trend={trend}
    subtitle="Available juices"
    onClick={onClick}
    loading={loading}
  />
);

export const ReviewStatsCard = ({ value, trend, loading, onClick }) => (
  <StatsCard
    title="Total Reviews"
    value={value}
    icon="⭐"
    color="yellow"
    trend={trend}
    subtitle="Customer feedback"
    onClick={onClick}
    loading={loading}
  />
);

export const PendingOrderStatsCard = ({ value, loading, onClick }) => (
  <StatsCard
    title="Pending Orders"
    value={value}
    icon="⏳"
    color="red"
    subtitle="Awaiting processing"
    onClick={onClick}
    loading={loading}
    badge="Urgent"
  />
);

export default StatsCard;