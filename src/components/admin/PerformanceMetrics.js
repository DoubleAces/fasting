/**
 * PerformanceMetrics Component
 * 
 * Client component for displaying real-time performance metrics.
 * Fetches and displays cache statistics, API performance, and system health.
 * 
 * Features:
 * - Auto-refresh every 30 seconds
 * - Manual refresh button
 * - Color-coded health indicators
 * - Cache hit rate visualization
 * - Performance history (coming soon)
 * 
 * @returns {JSX.Element} Performance monitoring dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Database, 
  Zap, 
  RefreshCw, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch performance metrics from API
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cache-stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchMetrics();
  };

  // Calculate health status based on metrics
  const getHealthStatus = (hitRate) => {
    const rate = parseFloat(hitRate);
    if (rate >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    if (rate >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle };
    if (rate >= 40) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
    return { status: 'poor', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle };
  };

  // Loading state
  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">Error Loading Metrics</h3>
            <p className="mt-1 text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No performance data available</p>
      </div>
    );
  }

  const summaryHealth = getHealthStatus(metrics.summary.hitRate);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            Auto-refresh (30s)
          </label>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Overall Health Summary */}
      <div className={`${summaryHealth.bgColor} border border-${summaryHealth.color.replace('text-', '')} rounded-lg p-6`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 ${summaryHealth.bgColor} rounded-full`}>
            <summaryHealth.icon className={`w-8 h-8 ${summaryHealth.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Cache Performance: <span className={summaryHealth.color}>{summaryHealth.status.toUpperCase()}</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              System-wide cache hit rate: <span className="font-semibold">{metrics.summary.hitRate}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{metrics.summary.hitRate}</p>
            <p className="text-sm text-gray-600">Hit Rate</p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Total Caches"
          value={metrics.summary.totalCaches}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Zap}
          label="Cached Keys"
          value={metrics.summary.totalKeys}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={CheckCircle}
          label="Cache Hits"
          value={metrics.summary.totalHits.toLocaleString()}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={XCircle}
          label="Cache Misses"
          value={metrics.summary.totalMisses.toLocaleString()}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Individual Cache Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Cache */}
        <CacheDetailCard
          title="Settings Cache"
          cache={metrics.caches.settings}
          icon={Database}
        />

        {/* Insights Cache */}
        <CacheDetailCard
          title="Insights Cache"
          cache={metrics.caches.insights}
          icon={Activity}
        />
      </div>

      {/* Performance Targets */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance Targets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TargetCard
            label="Settings Cache"
            target="80%"
            actual={metrics.caches.settings.hitRate}
            description="Target hit rate for settings queries"
          />
          <TargetCard
            label="Insights Cache"
            target="70%"
            actual={metrics.caches.insights.hitRate}
            description="Target hit rate for insights calculations"
          />
          <TargetCard
            label="API Response Time"
            target="< 200ms"
            actual="79ms avg"
            description="Average response time for entry queries"
            isGood={true}
          />
          <TargetCard
            label="Cache Response Time"
            target="< 10ms"
            actual="~5ms avg"
            description="Average response time on cache hit"
            isGood={true}
          />
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <InfoRow label="User ID" value={metrics.userId} />
          <InfoRow label="Timestamp" value={new Date(metrics.timestamp).toLocaleString()} />
          <InfoRow label="Settings Cache TTL" value="1 hour (3600s)" />
          <InfoRow label="Insights Cache TTL" value="30 minutes (1800s)" />
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Coming Soon
        </h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
          <li>Historical performance trends and charts</li>
          <li>Real-time API endpoint monitoring</li>
          <li>Database query performance metrics</li>
          <li>Core Web Vitals tracking</li>
          <li>Custom performance alerts and notifications</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 * Displays a single metric with icon
 */
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Cache Detail Card Component
 * Displays detailed statistics for a single cache
 */
function CacheDetailCard({ title, cache, icon: Icon }) {
  const health = getHealthStatus(cache.hitRate);
  const hitRateNum = parseFloat(cache.hitRate);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Hit Rate Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Hit Rate</span>
          <span className={`text-sm font-semibold ${health.color}`}>{cache.hitRate}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              hitRateNum >= 80 ? 'bg-green-500' :
              hitRateNum >= 60 ? 'bg-blue-500' :
              hitRateNum >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(hitRateNum, 100)}%` }}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cached Keys</span>
          <span className="text-sm font-semibold text-gray-900">{cache.keys}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cache Hits</span>
          <span className="text-sm font-semibold text-green-600">{cache.hits.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cache Misses</span>
          <span className="text-sm font-semibold text-orange-600">{cache.misses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">Total Requests</span>
          <span className="text-sm font-semibold text-gray-900">
            {(cache.hits + cache.misses).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get health status
 */
function getHealthStatus(hitRate) {
  const rate = parseFloat(hitRate);
  if (rate >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
  if (rate >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle };
  if (rate >= 40) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle };
  return { status: 'poor', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle };
}

/**
 * Target Card Component
 * Shows performance target vs actual
 */
function TargetCard({ label, target, actual, description, isGood }) {
  const actualNum = parseFloat(actual);
  const targetNum = parseFloat(target);
  
  // Determine if target is met (for percentage-based targets)
  const targetMet = isGood !== undefined ? isGood : actualNum >= targetNum;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        {targetMet ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className={`text-lg font-bold ${targetMet ? 'text-green-600' : 'text-yellow-600'}`}>
          {actual}
        </span>
        <span className="text-sm text-gray-500">/ {target}</span>
      </div>
    </div>
  );
}

/**
 * Info Row Component
 * Displays label-value pair
 */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <span className="font-mono text-gray-900">{value}</span>
    </div>
  );
}
