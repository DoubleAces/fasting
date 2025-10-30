# Data Model: Homepage Redesign

**Date**: October 29, 2025  
**Phase**: 1 - Design & Contracts  
**Status**: Complete

## Overview

This document defines the data structures for the homepage redesign. Since this is a presentational feature with no database entities, it focuses on static data shapes for testimonials, features, trust indicators, and configuration.

---

## 1. Testimonial Data Structure

### Purpose
Display social proof through user testimonials on the Social Proof section.

### Schema

```typescript
interface Testimonial {
  id: string;                    // Unique identifier (e.g., "testimonial-1")
  name: string;                  // User's name (e.g., "Sarah Johnson")
  avatar?: string;               // Optional: Path to avatar image (e.g., "/images/avatars/sarah.jpg")
  result: string;                // Specific achievement (e.g., "Lost 15 lbs in 8 weeks")
  quote: string;                 // User testimonial text (50-150 characters recommended)
  rating: 1 | 2 | 3 | 4 | 5;    // Star rating (1-5)
  date?: string;                 // Optional: When testimonial was given (e.g., "March 2025")
  verified?: boolean;            // Optional: Whether this is a real verified user (default: false for placeholders)
}
```

### Example Data

```javascript
// src/lib/data/testimonials.js
export const testimonials = [
  {
    id: "testimonial-1",
    name: "Sarah Johnson",
    avatar: "/images/avatars/sarah.jpg",
    result: "Lost 15 lbs in 8 weeks",
    quote: "This app made fasting so simple! I love the streak counter—it keeps me motivated every single day.",
    rating: 5,
    date: "March 2025",
    verified: false
  },
  {
    id: "testimonial-2",
    name: "Michael Chen",
    result: "30-day streak achieved",
    quote: "Finally, a fasting tracker that's not bloated with features I don't need. Clean, simple, perfect.",
    rating: 5,
    date: "February 2025",
    verified: false
  },
  {
    id: "testimonial-3",
    name: "Emma Rodriguez",
    avatar: "/images/avatars/emma.jpg",
    result: "Improved energy levels",
    quote: "The insights helped me understand my fasting patterns. My energy has never been better!",
    rating: 4,
    date: "January 2025",
    verified: false
  }
  // ... 3-5 more testimonials
];
```

### Validation Rules
- `id`: Must be unique across all testimonials
- `name`: 2-50 characters, no special characters except spaces, hyphens, apostrophes
- `avatar`: If provided, must be valid image path (jpg, png, webp)
- `result`: 10-80 characters, should be specific and measurable
- `quote`: 30-200 characters, first-person perspective
- `rating`: Integer 1-5 only
- `date`: If provided, format as "Month YYYY" (e.g., "March 2025")

### Display Rules
- Show 6 testimonials on desktop (3x2 grid)
- Show 2 testimonials on tablet (2x1 grid, scrollable)
- Show 1 testimonial on mobile (1x1 grid, swipeable carousel)
- If no avatar provided, use generated avatar with initials
- Sort by rating (5-star first), then by date (newest first)

---

## 2. Feature Data Structure

### Purpose
Display app features with specific benefits in the Features Showcase section.

### Schema

```typescript
interface Feature {
  id: string;                    // Unique identifier (e.g., "feature-quick-logging")
  title: string;                 // Feature name (e.g., "Log in 30 Seconds")
  description: string;           // Specific benefit explanation (50-150 characters)
  icon: string;                  // Icon identifier (emoji or icon library reference)
  screenshot?: string;           // Optional: Path to feature screenshot
  benefit: string;               // Measurable benefit (e.g., "Save 5 minutes per day")
  order: number;                 // Display order (1-6)
}
```

### Example Data

```javascript
// src/lib/data/features.js
export const features = [
  {
    id: "feature-quick-logging",
    title: "Log in 30 Seconds",
    description: "Quick entry form captures all your data in one tap. No endless scrolling or complicated menus.",
    icon: "⚡",
    screenshot: "/images/features/quick-logging.png",
    benefit: "Save 5 minutes per day",
    order: 1
  },
  {
    id: "feature-streak-tracking",
    title: "Build Unbreakable Streaks",
    description: "Visual streak counter with fire emoji keeps you motivated. See your consistency grow day by day.",
    icon: "🔥",
    screenshot: "/images/features/streak-counter.png",
    benefit: "3x higher consistency",
    order: 2
  },
  {
    id: "feature-insights",
    title: "Smart Insights Dashboard",
    description: "See your fasting patterns, weight trends, and correlations at a glance. Know what's working.",
    icon: "📊",
    screenshot: "/images/features/insights.png",
    benefit: "Faster goal achievement",
    order: 3
  },
  {
    id: "feature-pwa",
    title: "Works Offline",
    description: "Progressive Web App works without internet. Log your fasts anywhere, anytime.",
    icon: "📱",
    screenshot: "/images/features/pwa.png",
    benefit: "Never miss a log",
    order: 4
  },
  {
    id: "feature-simple",
    title: "Zero Learning Curve",
    description: "No tutorials needed. Intuitive interface you'll understand in 5 seconds.",
    icon: "✨",
    screenshot: "/images/features/simple-ui.png",
    benefit: "Start immediately",
    order: 5
  },
  {
    id: "feature-free",
    title: "Forever Free",
    description: "Core features always free. Optional premium for power users. No credit card required.",
    icon: "🎁",
    benefit: "Save $60/year vs competitors",
    order: 6
  }
];
```

### Validation Rules
- `id`: Must be unique, kebab-case format
- `title`: 3-50 characters, concise and action-oriented
- `description`: 50-200 characters, specific outcomes not vague promises
- `icon`: Single emoji or valid icon reference (Heroicons, Lucide)
- `screenshot`: If provided, must be 600x400px minimum, optimized WebP/PNG
- `benefit`: Measurable or observable outcome
- `order`: Integer 1-6 (determines display sequence)

### Display Rules
- Show all 6 features on desktop (3x2 grid)
- Show 2 features per row on tablet (2x3 grid)
- Show 1 feature per row on mobile (1x6 vertical stack)
- Sort by `order` field ascending
- Hover effect shows glassmorphism elevation
- Click feature card to expand with more details (future enhancement)

---

## 3. Trust Indicator Data Structure

### Purpose
Display trust badges and social proof metrics in Hero and Social Proof sections.

### Schema

```typescript
interface TrustIndicator {
  id: string;                    // Unique identifier
  type: 'rating' | 'user-count' | 'badge' | 'stat';  // Indicator type
  value: string | number;        // Main value to display
  label: string;                 // Descriptive label
  icon?: string;                 // Optional icon (emoji or reference)
  subtext?: string;              // Optional additional context
  verifiable?: boolean;          // Whether this metric is verifiable (default: false)
  source?: string;               // Optional source for verification
}
```

### Example Data

```javascript
// src/lib/data/trustIndicators.js
export const trustIndicators = [
  {
    id: "rating-overall",
    type: "rating",
    value: 4.8,
    label: "stars",
    icon: "⭐",
    subtext: "(240 reviews)",
    verifiable: false,
    source: "Placeholder data - to be replaced with real reviews"
  },
  {
    id: "user-count",
    type: "user-count",
    value: "10,000+",
    label: "active fasters",
    icon: "🔥",
    verifiable: false,
    source: "Estimated based on beta sign-ups"
  },
  {
    id: "stat-success-rate",
    type: "stat",
    value: "87%",
    label: "reach their fasting goals",
    subtext: "Average streak: 45 days",
    verifiable: false
  },
  {
    id: "badge-free",
    type: "badge",
    value: "100% Free",
    label: "Core Features",
    subtext: "No credit card required"
  }
];
```

### Validation Rules
- `id`: Unique identifier, kebab-case
- `type`: Must be one of the enum values
- `value`: String or number depending on type
- `label`: 5-50 characters, descriptive
- `icon`: Optional emoji or icon reference
- `subtext`: Optional, 10-100 characters
- `verifiable`: Boolean, defaults to false
- `source`: Required if verifiable is true

### Display Rules
- Hero section: Show rating + user count
- Social Proof section: Show all indicators
- Format numbers with commas (10,000 not 10000)
- Display ratings with star icons (4.8 → ⭐⭐⭐⭐⭐ with partial fill)
- Update `verifiable` to true once real data is available

---

## 4. How It Works Steps Data Structure

### Purpose
Display 3-step onboarding process in How It Works section.

### Schema

```typescript
interface ProcessStep {
  id: string;                    // Unique identifier
  step: number;                  // Step number (1, 2, 3)
  title: string;                 // Step title (e.g., "Set Your Goal")
  description: string;           // Step description (50-150 characters)
  icon: string;                  // Visual icon representing the step
  screenshot?: string;           // Optional screenshot showing this step
}
```

### Example Data

```javascript
// src/lib/data/processSteps.js
export const processSteps = [
  {
    id: "step-set-goal",
    step: 1,
    title: "Set Your Fasting Goal",
    description: "Choose your protocol: 16:8, 18:6, OMAD, or custom. Takes 10 seconds.",
    icon: "🎯",
    screenshot: "/images/steps/set-goal.png"
  },
  {
    id: "step-log-daily",
    step: 2,
    title: "Log Your Fasts Daily",
    description: "Quick 30-second entry. Track meals, weight, sleep, and how you feel.",
    icon: "✏️",
    screenshot: "/images/steps/log-entry.png"
  },
  {
    id: "step-watch-streak",
    step: 3,
    title: "Watch Your Streak Grow",
    description: "See your consistency visualized. Celebrate milestones. Reach your goals.",
    icon: "🔥",
    screenshot: "/images/steps/streak-view.png"
  }
];
```

### Validation Rules
- `id`: Unique, kebab-case
- `step`: Integer 1-3 (exactly 3 steps)
- `title`: 5-40 characters, action-oriented
- `description`: 30-150 characters, specific and measurable
- `icon`: Single emoji
- `screenshot`: Optional, 400x300px minimum

### Display Rules
- Desktop: Horizontal layout with connecting lines between steps
- Mobile/Tablet: Vertical layout with step numbers prominent
- Animate steps on scroll (fade in sequentially with 200ms delay between)
- Step numbers in large circular badges
- Icons displayed above titles

---

## 5. Problem-Solution Content Structure

### Purpose
Display pain points and solutions in Problem/Solution section.

### Schema

```typescript
interface ProblemSolution {
  id: string;
  problem: string;               // User pain point (question format)
  solution: string;              // How the app solves it
  icon: string;                  // Visual representation
  order: number;                 // Display order
}
```

### Example Data

```javascript
// src/lib/data/problemsSolutions.js
export const problemsSolutions = [
  {
    id: "problem-complex-apps",
    problem: "Tired of complicated health apps with features you'll never use?",
    solution: "We built the simplest fasting tracker possible. Just logging, streaks, and insights.",
    icon: "🎯",
    order: 1
  },
  {
    id: "problem-broken-streaks",
    problem: "Frustrated by broken streaks and losing motivation?",
    solution: "Visual streak counter and milestone celebrations keep you consistent day after day.",
    icon: "🔥",
    order: 2
  },
  {
    id: "problem-no-insights",
    problem: "Not sure if your fasting protocol is actually working?",
    solution: "Smart insights show you exactly what's working and what to adjust for better results.",
    icon: "📊",
    order: 3
  }
];
```

### Validation Rules
- `id`: Unique, kebab-case
- `problem`: 10-100 characters, question format ending with ?
- `solution`: 20-150 characters, specific and actionable
- `icon`: Single emoji
- `order`: Integer, determines display sequence

### Display Rules
- Desktop: 3-column grid
- Mobile: Vertical stack
- Problem text in larger font, solution text in regular font
- Animate on scroll: problem fades in, then solution slides up

---

## 6. CTA Configuration

### Purpose
Configure call-to-action buttons behavior and text.

### Schema

```typescript
interface CTAConfig {
  primary: {
    text: string;                     // Button text for unauthenticated users
    textAuthenticated: string;        // Button text for authenticated users
    href: string;                     // Target URL for unauthenticated
    hrefAuthenticated: string;        // Target URL for authenticated
  };
  secondary: {
    text: string;
    action: 'scroll' | 'link';        // Scroll to section or navigate to URL
    target: string;                   // Section ID or URL
  };
  final: {
    heading: string;                  // Final CTA section heading
    subheading: string;               // Supporting text
    buttonText: string;
    riskReversal: string;             // Risk reversal message
  };
}
```

### Example Data

```javascript
// src/lib/data/ctaConfig.js
export const ctaConfig = {
  primary: {
    text: "Start Free",
    textAuthenticated: "Go to Dashboard",
    href: "/register",
    hrefAuthenticated: "/entries"
  },
  secondary: {
    text: "See How It Works",
    action: "scroll",
    target: "#how-it-works"
  },
  final: {
    heading: "Ready to start your fasting journey?",
    subheading: "Join 10,000+ people already tracking their fasts and reaching their health goals.",
    buttonText: "Start Free Today",
    riskReversal: "Free forever. No credit card required."
  }
};
```

---

## Data File Organization

All data files reside in `src/lib/data/`:

```
src/lib/data/
├── testimonials.js          # Export: testimonials array
├── features.js              # Export: features array
├── trustIndicators.js       # Export: trustIndicators array
├── processSteps.js          # Export: processSteps array
├── problemsSolutions.js     # Export: problemsSolutions array
└── ctaConfig.js             # Export: ctaConfig object
```

### Import Pattern

```javascript
// In component files
import { testimonials } from '@/lib/data/testimonials';
import { features } from '@/lib/data/features';
import { trustIndicators } from '@/lib/data/trustIndicators';
// etc.
```

---

## Future Enhancements (Out of Scope for Initial Launch)

- **Dynamic testimonials**: Fetch from database or CMS API
- **A/B testing variants**: Multiple versions of copy for testing
- **Personalization**: Show different content based on user behavior
- **Real-time metrics**: Update trust indicators from analytics API
- **User-submitted testimonials**: Form for users to submit their own stories

---

## Related Documents

- [research.md](./research.md) - Research decisions for data management
- [contracts/](./contracts/) - Component prop interfaces
- [spec.md](./spec.md) - Feature specification with requirements
