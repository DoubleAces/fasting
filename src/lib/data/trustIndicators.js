/**
 * Trust Indicators Data
 * 
 * Used by Hero section and other social proof elements to build credibility.
 * These indicators should be updated periodically to reflect actual metrics.
 */

export const trustIndicators = {
  rating: {
    type: 'rating',
    value: 4.8,
    label: 'stars',
    icon: '⭐',
    subtext: '(240 reviews)',
  },
  userCount: {
    type: 'user-count',
    value: '10,000+',
    label: 'active fasters',
    icon: '🔥',
  },
  successRate: {
    type: 'stat',
    value: '94%',
    label: 'success rate',
    icon: '✨',
    subtext: 'achieve their goals',
  },
  avgWeight: {
    type: 'stat',
    value: '12 lbs',
    label: 'average weight loss',
    icon: '📉',
    subtext: 'in first month',
  },
};

export default trustIndicators;
