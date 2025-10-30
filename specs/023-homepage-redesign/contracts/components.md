# Component Contracts: Homepage Redesign

**Date**: October 29, 2025  
**Phase**: 1 - Design & Contracts  
**Status**: Complete

## Overview

This document defines the component interfaces (props, behaviors, and responsibilities) for all new and modified components in the homepage redesign. Each contract specifies inputs, outputs, and component behavior to enable independent development and testing.

---

## Atomic Components (Atoms)

### 1. GradientButton

**Purpose**: Primary call-to-action button with gradient background and hover effects.

**Props Interface:**

```typescript
interface GradientButtonProps {
  children: React.ReactNode;           // Button text or content
  onClick?: () => void;                // Click handler
  variant?: 'primary' | 'secondary';   // Visual style (default: 'primary')
  size?: 'sm' | 'md' | 'lg';          // Size variant (default: 'md')
  fullWidth?: boolean;                 // Take full width of container (default: false)
  disabled?: boolean;                  // Disabled state (default: false)
  type?: 'button' | 'submit' | 'reset'; // HTML button type (default: 'button')
  className?: string;                  // Additional Tailwind classes
  ariaLabel?: string;                  // Accessibility label if children is icon-only
}
```

**Behavior:**
- Primary variant: Purple-to-pink gradient background, white text
- Secondary variant: Transparent background with gradient border, gradient text
- Hover: Slight scale (1.05) and shadow elevation
- Focus: Visible purple ring (ring-2 ring-purple-500)
- Disabled: Reduced opacity (0.5), cursor not-allowed
- Click: Trigger onClick handler with haptic feedback (if available)

**Styling Classes:**
```javascript
const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-transparent border-2 border-gradient text-gradient hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};
```

**Tests:**
- Renders with correct text
- Calls onClick when clicked
- Applies correct variant styles
- Is keyboard accessible (tab + enter)
- Has no accessibility violations
- Respects disabled state

---

### 2. GlassmorphicCard

**Purpose**: Card with frosted glass (glassmorphism) effect for premium feel.

**Props Interface:**

```typescript
interface GlassmorphicCardProps {
  children: React.ReactNode;           // Card content
  className?: string;                  // Additional Tailwind classes
  padding?: 'none' | 'sm' | 'md' | 'lg'; // Internal padding (default: 'md')
  blur?: 'sm' | 'md' | 'lg';          // Backdrop blur intensity (default: 'md')
  elevation?: 'low' | 'medium' | 'high'; // Shadow depth (default: 'medium')
  onClick?: () => void;                // Optional click handler (makes card interactive)
  as?: 'div' | 'article' | 'section';  // HTML element type (default: 'div')
}
```

**Behavior:**
- Glassmorphism: Semi-transparent white background with backdrop blur
- Border: Subtle white border with 20% opacity
- Hover (if onClick provided): Subtle elevation increase
- Responsive: Padding scales down on mobile

**Styling Classes:**
```javascript
const blurLevels = {
  sm: 'backdrop-blur-sm',    // 4px blur
  md: 'backdrop-blur-md',    // 12px blur
  lg: 'backdrop-blur-lg'     // 16px blur
};

const elevations = {
  low: 'shadow-md',
  medium: 'shadow-lg',
  high: 'shadow-2xl'
};

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

// Base classes
const baseClasses = 'bg-white/10 backdrop-saturate-150 border border-white/20 rounded-2xl';
```

**Fallback (No backdrop-filter support):**
```css
@supports not (backdrop-filter: blur(12px)) {
  .glass-card {
    background-color: rgba(255, 255, 255, 0.95);
  }
}
```

**Tests:**
- Renders children correctly
- Applies glassmorphism styles
- Handles click if onClick provided
- Renders with correct HTML element (as prop)
- Gracefully degrades without backdrop-filter support

---

### 3. StarRating

**Purpose**: Display star rating (1-5 stars) with optional half-star support.

**Props Interface:**

```typescript
interface StarRatingProps {
  rating: number;                      // Rating value (0-5, supports decimals)
  maxRating?: number;                  // Maximum rating (default: 5)
  size?: 'sm' | 'md' | 'lg';          // Star size (default: 'md')
  showValue?: boolean;                 // Show numeric value next to stars (default: false)
  color?: string;                      // Star color (default: 'text-yellow-400')
  emptyColor?: string;                 // Empty star color (default: 'text-gray-300')
  className?: string;                  // Additional Tailwind classes
  ariaLabel?: string;                  // Accessibility label (default: "{rating} out of {maxRating} stars")
}
```

**Behavior:**
- Render filled stars for whole numbers
- Render half-filled star for decimals (e.g., 4.5 → 4 full + 1 half)
- Render empty stars for remainder
- Screen reader: Read as "4.8 out of 5 stars"

**Rendering Logic:**
```javascript
const fullStars = Math.floor(rating);
const hasHalfStar = rating % 1 >= 0.5;
const emptyStars = maxRating - Math.ceil(rating);
```

**Sizes:**
```javascript
const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};
```

**Tests:**
- Renders correct number of filled stars
- Renders half star for decimal ratings
- Renders correct number of empty stars
- Shows numeric value when showValue is true
- Has proper ARIA label for screen readers

---

## Molecular Components (Molecules)

### 4. TestimonialCard

**Purpose**: Display single user testimonial with avatar, quote, name, and rating.

**Props Interface:**

```typescript
interface TestimonialCardProps {
  testimonial: {
    name: string;
    avatar?: string;
    result: string;
    quote: string;
    rating: 1 | 2 | 3 | 4 | 5;
    date?: string;
  };
  variant?: 'default' | 'compact';     // Layout variant (default: 'default')
  showDate?: boolean;                  // Show testimonial date (default: true)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Avatar: Display image if provided, else show initials in colored circle
- Quote: Display in quotes with styling
- Rating: Show star rating below name
- Result: Display as badge (e.g., "Lost 15 lbs in 8 weeks")
- Hover: Slight elevation with smooth transition

**Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar]                           │
│  ★★★★★                              │
│  "Quote text goes here..."          │
│  — Name                             │
│  [Result Badge]                     │
│  March 2025                         │
└─────────────────────────────────────┘
```

**Avatar Fallback:**
```javascript
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  // Generate consistent color from name hash
  const colors = ['bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500'];
  return colors[name.length % colors.length];
};
```

**Tests:**
- Renders testimonial data correctly
- Shows avatar image if provided
- Shows initials if no avatar
- Displays star rating
- Applies hover effect
- Compact variant has reduced spacing

---

### 5. FeatureCard

**Purpose**: Display app feature with icon, title, description, and optional screenshot.

**Props Interface:**

```typescript
interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: string;
    screenshot?: string;
    benefit: string;
  };
  showScreenshot?: boolean;            // Show screenshot if available (default: true)
  interactive?: boolean;               // Enable hover effects (default: true)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Icon: Large emoji or icon displayed prominently
- Title: Bold, action-oriented
- Description: 2-3 lines of specific benefits
- Benefit: Highlighted in accent color
- Screenshot: Optional image showing feature in action
- Hover (if interactive): Glassmorphic elevation, slight scale

**Layout:**
```
┌─────────────────────────────────────┐
│  [Screenshot if available]          │
│  📊                                  │
│  Smart Insights Dashboard           │
│  See your fasting patterns...       │
│  ✓ Faster goal achievement          │
└─────────────────────────────────────┘
```

**Tests:**
- Renders feature data
- Shows screenshot if provided and showScreenshot is true
- Displays icon (emoji)
- Applies hover effect if interactive
- Benefit is visually distinct

---

### 6. ProcessStep

**Purpose**: Display single step in "How It Works" 3-step process.

**Props Interface:**

```typescript
interface ProcessStepProps {
  step: {
    step: number;                      // Step number (1, 2, 3)
    title: string;
    description: string;
    icon: string;
    screenshot?: string;
  };
  layout?: 'horizontal' | 'vertical';  // Layout direction (default: 'vertical')
  showConnector?: boolean;             // Show connecting line to next step (default: true)
  isLast?: boolean;                    // Is this the last step (default: false)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Step Number: Large circular badge with gradient
- Icon: Emoji displayed above title
- Title: Bold headline
- Description: Supporting text
- Connector: Dashed line to next step (if not last)
- Animation: Fade in on scroll with stagger effect

**Layout (Vertical):**
```
     1
    🎯
Set Your Goal
Choose your protocol...

     |  (connector)
     |

     2
    ✏️
Log Daily
...
```

**Layout (Horizontal):**
```
  1          2          3
 🎯  ——→    ✏️  ——→    🔥
Set Goal   Log Daily  Watch Streak
```

**Tests:**
- Renders step number correctly
- Displays icon and content
- Shows connector unless isLast is true
- Horizontal layout arranges elements correctly
- Vertical layout stacks elements

---

### 7. TrustBadge

**Purpose**: Display trust indicator (rating, user count, or badge).

**Props Interface:**

```typescript
interface TrustBadgeProps {
  indicator: {
    type: 'rating' | 'user-count' | 'badge' | 'stat';
    value: string | number;
    label: string;
    icon?: string;
    subtext?: string;
  };
  variant?: 'inline' | 'card';         // Display style (default: 'inline')
  size?: 'sm' | 'md' | 'lg';          // Size variant (default: 'md')
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Icon: Display emoji or icon if provided
- Value: Large, prominent display
- Label: Smaller text below value
- Subtext: Optional additional context in muted color
- Inline variant: Horizontal layout, compact
- Card variant: Vertical layout with padding and border

**Layouts:**

Inline:
```
⭐ 4.8 stars (240 reviews)
```

Card:
```
┌─────────────────┐
│       ⭐        │
│       4.8       │
│      stars      │
│  (240 reviews)  │
└─────────────────┘
```

**Tests:**
- Renders indicator data
- Inline variant uses horizontal layout
- Card variant uses vertical layout with padding
- Displays icon if provided
- Subtext is muted and smaller

---

### 8. ProblemSolutionBlock

**Purpose**: Display single problem/solution pair.

**Props Interface:**

```typescript
interface ProblemSolutionBlockProps {
  problemSolution: {
    problem: string;
    solution: string;
    icon: string;
  };
  layout?: 'vertical' | 'horizontal';  // Layout direction (default: 'vertical')
  animateOnScroll?: boolean;           // Animate when scrolled into view (default: true)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Icon: Large emoji at top
- Problem: Larger font, question format, bold
- Solution: Regular font, answer format
- Animation: Problem fades in, solution slides up 200ms later

**Layout (Vertical):**
```
      🎯

Tired of complicated
health apps?

We built the simplest
fasting tracker possible.
```

**Animation Sequence:**
1. Component enters viewport (IntersectionObserver)
2. Icon fades in (0ms delay)
3. Problem text fades in (100ms delay)
4. Solution text slides up (300ms delay)

**Tests:**
- Renders problem and solution
- Displays icon
- Triggers animation on scroll if animateOnScroll is true
- Vertical layout stacks content
- Horizontal layout arranges side-by-side

---

## Organism Components (Organisms)

### 9. Hero (Modified)

**Purpose**: Hero section with headline, trust indicators, CTAs, and hero image.

**Props Interface:**

```typescript
interface HeroProps {
  isAuthenticated: boolean;            // User authentication status
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Server-side: Receive authentication status from parent
- Display headline and subheading
- Show trust indicators (rating + user count)
- Show primary CTA ("Start Free" or "Go to Dashboard" based on auth)
- Show secondary CTA ("See How It Works")
- Display hero image (app screenshot)
- Responsive: Stack vertically on mobile, two-column on desktop

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────┐
│  The Simplest Way...    [Hero Screenshot]       │
│  Join 10,000+...                                │
│  ⭐ 4.8 stars  🔥 10,000+ fasters               │
│  [Start Free] [See How It Works]                │
└─────────────────────────────────────────────────┘
```

**Layout (Mobile):**
```
┌─────────────────────────┐
│  The Simplest Way...    │
│  Join 10,000+...        │
│  ⭐ 4.8  🔥 10,000+    │
│  [Hero Screenshot]      │
│  [Start Free]           │
│  [See How It Works]     │
└─────────────────────────┘
```

**Composition:**
- Uses: GradientButton (2x), TrustBadge (2x), Next.js Image
- Server Component: Can use auth() directly
- Client Interactivity: CTAs are client components

**Tests:**
- Renders headline and subheading
- Displays trust indicators
- Shows correct CTA text based on authentication
- Clicking "Start Free" redirects to correct page
- Clicking "See How It Works" scrolls to #how-it-works
- Hero image loads with priority (LCP optimization)
- Responsive layout works on mobile and desktop

---

### 10. SocialProofSection

**Purpose**: Section displaying testimonials and trust badges.

**Props Interface:**

```typescript
interface SocialProofSectionProps {
  testimonials: Testimonial[];         // Array of testimonials to display
  trustIndicators: TrustIndicator[];   // Array of trust indicators
  maxTestimonials?: number;            // Max testimonials to show (default: 6)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Section heading: "Trusted by thousands of fasters"
- Display trust indicators in a row
- Display testimonials in grid (responsive)
- Animate testimonials on scroll (stagger effect)

**Layout:**
```
┌──────────────────────────────────────────────────┐
│           Trusted by thousands of fasters        │
│  ⭐ 4.8 stars  🔥 10,000+  87% reach goals      │
│                                                  │
│  [Testimonial 1]  [Testimonial 2]  [Testimonial 3] │
│  [Testimonial 4]  [Testimonial 5]  [Testimonial 6] │
└──────────────────────────────────────────────────┘
```

**Composition:**
- Uses: TestimonialCard (multiple), TrustBadge (multiple)
- Server Component: Static data, no client interaction needed

**Tests:**
- Renders section heading
- Displays trust indicators
- Renders correct number of testimonials
- Grid layout responsive (3→2→1 columns)
- Testimonials animate on scroll

---

### 11. ProblemSolutionSection

**Purpose**: Section displaying user pain points and solutions.

**Props Interface:**

```typescript
interface ProblemSolutionSectionProps {
  problemsSolutions: ProblemSolution[]; // Array of problem/solution pairs
  className?: string;                   // Additional Tailwind classes
}
```

**Behavior:**
- Section heading: "Why Fasting Tracker?"
- Display problem/solution pairs in grid
- Animate on scroll

**Layout:**
```
┌──────────────────────────────────────────────────┐
│              Why Fasting Tracker?                │
│                                                  │
│  [Problem/Solution 1]  [Problem/Solution 2]  [Problem/Solution 3] │
└──────────────────────────────────────────────────┘
```

**Composition:**
- Uses: ProblemSolutionBlock (multiple)
- Server Component

**Tests:**
- Renders section heading
- Displays all problem/solution pairs
- Grid layout responsive
- Animation triggers on scroll

---

### 12. FeaturesList (Modified)

**Purpose**: Features showcase section with enhanced specific benefits.

**Props Interface:**

```typescript
interface FeaturesListProps {
  features: Feature[];                 // Array of features to display
  showScreenshots?: boolean;           // Show feature screenshots (default: true)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Section heading: "Everything you need, nothing you don't"
- Display features in grid with hover effects
- Show screenshots if provided and showScreenshots is true

**Layout:**
```
┌──────────────────────────────────────────────────┐
│      Everything you need, nothing you don't      │
│                                                  │
│  [Feature 1]  [Feature 2]  [Feature 3]          │
│  [Feature 4]  [Feature 5]  [Feature 6]          │
└──────────────────────────────────────────────────┘
```

**Composition:**
- Uses: FeatureCard (multiple), GlassmorphicCard
- Server Component

**Tests:**
- Renders section heading
- Displays all features
- Shows screenshots when available
- Grid layout responsive (3→2→1)
- Hover effects work

---

### 13. HowItWorksSection

**Purpose**: 3-step process showing how to get started.

**Props Interface:**

```typescript
interface HowItWorksSectionProps {
  steps: ProcessStep[];                // Array of 3 steps
  layout?: 'horizontal' | 'vertical';  // Layout direction (default: responsive)
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Section heading: "How It Works"
- Display 3 steps with connecting lines
- Animate steps on scroll (sequential)
- Layout: Horizontal on desktop, vertical on mobile

**Layout (Desktop - Horizontal):**
```
┌──────────────────────────────────────────────────┐
│                  How It Works                    │
│                                                  │
│     1    ——→     2    ——→     3                 │
│    🎯          ✏️          🔥                    │
│  Set Goal    Log Daily   Watch Streak           │
└──────────────────────────────────────────────────┘
```

**Composition:**
- Uses: ProcessStep (3x)
- Server Component

**Tests:**
- Renders section heading
- Displays exactly 3 steps
- Steps have connecting lines except last
- Horizontal layout on desktop
- Vertical layout on mobile
- Steps animate sequentially on scroll

---

### 14. FinalCTASection

**Purpose**: Bottom conversion section with final call-to-action.

**Props Interface:**

```typescript
interface FinalCTASectionProps {
  isAuthenticated: boolean;            // User authentication status
  config: {
    heading: string;
    subheading: string;
    buttonText: string;
    riskReversal: string;
  };
  className?: string;                  // Additional Tailwind classes
}
```

**Behavior:**
- Display heading and subheading
- Show large prominent CTA button
- Display risk reversal message below
- Gradient background (purple to pink)
- Center-aligned content

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Gradient Background]                            │
│                                                  │
│       Ready to start your fasting journey?       │
│  Join 10,000+ people already tracking...         │
│                                                  │
│            [Start Free Today]                    │
│                                                  │
│      Free forever. No credit card required.      │
└──────────────────────────────────────────────────┘
```

**Composition:**
- Uses: GradientButton
- Server Component (parent), Client Component (button)

**Tests:**
- Renders heading and subheading
- Displays CTA button
- Shows risk reversal message
- Button redirects based on authentication
- Gradient background applied
- Content is center-aligned

---

## Component Hierarchy

```
HomePage (Server Component)
├── Hero (Organism)
│   ├── GradientButton (x2)
│   └── TrustBadge (x2)
├── SocialProofSection (Organism)
│   ├── TrustBadge (x3)
│   └── TestimonialCard (x6)
│       ├── StarRating
│       └── GlassmorphicCard
├── ProblemSolutionSection (Organism)
│   └── ProblemSolutionBlock (x3)
├── FeaturesList (Organism)
│   └── FeatureCard (x6)
│       └── GlassmorphicCard
├── HowItWorksSection (Organism)
│   └── ProcessStep (x3)
└── FinalCTASection (Organism)
    └── GradientButton
```

---

## Client vs Server Components

### Server Components (Default)
- HomePage
- SocialProofSection
- ProblemSolutionSection
- FeaturesList
- HowItWorksSection
- FinalCTASection (wrapper)
- All data-only molecules (TestimonialCard, FeatureCard, etc.)

### Client Components (Interactive)
- GradientButton (onClick, hover effects)
- Hero (CTA click handlers)
- Components with animations (use 'use client' for Framer Motion)

**Rule**: Only add 'use client' when component has:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs (window, document, etc.)
- Animation libraries (Framer Motion)

---

## Testing Requirements

Each component must have:
1. **Unit tests**: Props, rendering, interactions (80%+ coverage)
2. **Accessibility tests**: jest-axe for violations
3. **Visual regression** (optional): Storybook + Chromatic
4. **E2E tests**: User stories from spec (Playwright)

**Test file naming**:
- Component: `GradientButton.js`
- Test: `GradientButton.test.js`
- Location: Mirror source structure in `tests/`

---

## Related Documents

- [data-model.md](./data-model.md) - Data structures for props
- [research.md](./research.md) - Technology decisions
- [spec.md](./spec.md) - Functional requirements
