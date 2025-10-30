/**
 * CTA (Call-to-Action) Configuration
 * 
 * Centralized configuration for all CTAs across the homepage.
 * This ensures consistency in messaging and routing.
 */

export const ctaConfig = {
  primary: {
    authenticated: {
      text: 'Go to Dashboard',
      href: '/entries',
      ariaLabel: 'Go to your fasting dashboard',
    },
    unauthenticated: {
      text: 'Start Free',
      href: '/register',
      ariaLabel: 'Start tracking your fasting for free',
    },
  },
  secondary: {
    text: 'See How It Works',
    action: 'scroll',
    target: '#how-it-works',
    ariaLabel: 'Scroll to see how the app works',
  },
  final: {
    text: 'Start Your Journey Today',
    href: '/register',
    ariaLabel: 'Get started with intermittent fasting tracking',
  },
};

export default ctaConfig;
