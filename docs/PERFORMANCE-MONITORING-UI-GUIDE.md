# Performance Monitoring UI - User Guide

## Overview
The Performance Monitoring page is now available in the Admin Dashboard at `/dashboard/performance`. It provides real-time insights into application performance, cache efficiency, and system health.

## Access
1. Navigate to `/dashboard` (must be logged in as admin)
2. Click "**Performance**" in the sidebar menu
3. View real-time performance metrics

## Features

### 1. Overall Health Summary
- **Health Status**: Color-coded indicator (Excellent/Good/Fair/Poor)
- **System-wide Cache Hit Rate**: Overall performance at a glance
- Large display showing current hit rate percentage

### 2. Auto-Refresh Controls
- **Manual Refresh Button**: Click to immediately update metrics
- **Auto-refresh Toggle**: Automatically updates every 30 seconds (enabled by default)
- **Last Updated Timestamp**: Shows when metrics were last fetched

### 3. Summary Statistics (4 Cards)
- **Total Caches**: Number of active cache instances (2)
- **Cached Keys**: Total number of items currently cached
- **Cache Hits**: Total successful cache retrievals (green)
- **Cache Misses**: Total database queries made (orange)

### 4. Individual Cache Details (2 Cards)

#### Settings Cache
- Visual progress bar showing hit rate
- Cached Keys count
- Cache Hits (green)
- Cache Misses (orange)
- Total Requests

#### Insights Cache
- Same detailed metrics as Settings Cache
- Separate tracking for entry insights calculations

### 5. Performance Targets
Compares actual performance against targets:

| Metric | Target | Typical Actual |
|--------|--------|---------------|
| Settings Cache Hit Rate | 80% | 80-95% |
| Insights Cache Hit Rate | 70% | 70-85% |
| API Response Time | < 200ms | ~79ms avg |
| Cache Response Time | < 10ms | ~5ms avg |

✅ Green checkmark = Target met  
⚠️ Yellow alert = Below target

### 6. System Information
- Current User ID
- Current Timestamp
- Settings Cache TTL: 1 hour (3600s)
- Insights Cache TTL: 30 minutes (1800s)

### 7. Coming Soon Features
Preview of planned enhancements:
- Historical performance trends and charts
- Real-time API endpoint monitoring
- Database query performance metrics
- Core Web Vitals tracking
- Custom performance alerts

## Color-Coded Health Indicators

### Cache Hit Rate Health
- **Green (Excellent)**: ≥ 80% hit rate - Optimal performance
- **Blue (Good)**: 60-79% hit rate - Good performance
- **Yellow (Fair)**: 40-59% hit rate - Below optimal
- **Red (Poor)**: < 40% hit rate - Needs attention

## How to Interpret Metrics

### High Hit Rate (Good)
- Most requests served from cache
- Fast response times (<10ms)
- Low database load
- **Action**: No action needed, system performing well

### Low Hit Rate (Needs Attention)
- Many database queries
- Slower response times
- Higher database load
- **Actions to Consider**:
  - Check if cache TTL is too short
  - Verify cache invalidation isn't too aggressive
  - Monitor for memory issues
  - Review cache key generation logic

### Cache Keys Growing
- Normal as users create entries
- Monitor total memory usage
- Cached items expire based on TTL

### High Cache Misses
- Expected on first request after cache expiry
- Normal after deployments (cache reset)
- Can indicate new users or data patterns

## Technical Details

### API Endpoint
- **URL**: `/api/cache-stats`
- **Method**: GET
- **Authentication**: Required (session)
- **Response Format**: JSON with cache statistics

### Cache Configuration
```javascript
// Environment Variables
CACHE_TTL_SETTINGS=3600   // 1 hour
CACHE_TTL_INSIGHTS=1800   // 30 minutes
```

### Caches Monitored
1. **Settings Cache**: User settings and preferences
2. **Insights Cache**: Entry insights calculations

## Troubleshooting

### "Error Loading Metrics"
- Check that you're logged in as admin
- Verify `/api/cache-stats` endpoint is accessible
- Check browser console for errors
- Click "Try Again" to retry

### No Data Displayed
- Ensure caches have been initialized
- Wait for users to access the application
- Caches populate on first request

### Metrics Not Auto-Refreshing
- Check "Auto-refresh (30s)" checkbox is enabled
- Verify browser tab is active
- Check browser console for errors

## Best Practices

### Monitoring Schedule
- **Daily**: Quick check of overall health
- **Weekly**: Review trends and hit rates
- **After Deployment**: Monitor for cache reset impact
- **During Issues**: Real-time debugging

### What to Monitor
1. **Overall Hit Rate**: Should stay above 70%
2. **Individual Cache Performance**: Both caches healthy
3. **Cached Keys**: Growing steadily, not excessive
4. **Performance Targets**: All targets being met

### When to Investigate
- Hit rate drops below 60%
- Sudden increase in cache misses
- Performance targets not met
- Unexpected number of cached keys

## Integration with Performance Optimization

This UI displays metrics from Feature 016: Performance Optimization, which includes:
- MongoDB indexes for fast queries
- Optimized aggregation pipelines
- Intelligent cache invalidation
- ISR (Incremental Static Regeneration)
- Performance logging utilities

For detailed technical documentation, see:
- `docs/PERFORMANCE-OPTIMIZATION-COMPLETE.md`
- Phase 8 Performance Monitoring tasks (T042-T050)

## Future Enhancements

Planned features (not yet implemented):
- **Historical Charts**: Line graphs showing performance over time
- **API Endpoint Monitoring**: Track response times per endpoint
- **Database Query Metrics**: Slow query detection
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Alerts**: Email/Slack notifications for issues
- **Export Reports**: Download performance reports
- **Comparison Tools**: Compare time periods

---

*Last Updated: Phase 10 - Performance Monitoring UI*  
*Location*: `/dashboard/performance`  
*Access Level*: Admin Only
