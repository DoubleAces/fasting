# Research: Homepage Redesign

**Date**: October 29, 2025  
**Phase**: 0 - Technical Research & Decision Making  
**Status**: Complete

## Overview

Research phase for homepage redesign covering animation libraries, glassmorphism implementation, performance optimization strategies, and conversion best practices.

---

## 1. Animation Library Selection

### Decision: Framer Motion

**Rationale:**
- Industry-standard for React animations with declarative API
- Built-in support for 60fps animations via GPU acceleration
- Excellent Next.js integration (works with both Server and Client Components)
- Small bundle size (~30KB gzipped) acceptable for marketing page
- Provides gesture recognition, scroll animations, and layout animations out of the box
- Strong TypeScript support and extensive documentation

**Alternatives Considered:**

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **CSS Transitions/Animations** | Zero bundle size, native performance | Limited control, harder to orchestrate complex animations | Too basic for premium feel |
| **React Spring** | Physics-based animations, very smooth | Larger learning curve, imperative API less intuitive | Framer Motion more declarative |
| **GSAP** | Most powerful, professional-grade | Larger bundle (~50KB), licensing for commercial use | Overkill for this use case |
| **React Transition Group** | Lightweight, transition management | Low-level, requires more custom code | Not enough built-in features |

**Implementation Notes:**
- Use `motion` components for smooth transitions
- Leverage `useInView` hook for scroll-triggered animations
- Apply `layoutId` for shared element transitions between states
- Configure `reduce-motion` media query support for accessibility

---

## 2. Glassmorphism Implementation

### Decision: Tailwind CSS Custom Utilities + backdrop-filter

**Rationale:**
- Tailwind CSS 3.x has built-in `backdrop-blur` and `backdrop-saturate` utilities
- Native CSS `backdrop-filter` property has 95%+ browser support (with fallbacks)
- No additional libraries needed, keeps bundle size minimal
- Performant via GPU acceleration when supported
- Easy to create reusable component with consistent styling

**Implementation Pattern:**

```css
/* Glassmorphism card base classes */
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 shadow-xl;
}

/* Dark mode variant */
.dark .glass-card {
  @apply bg-gray-900/10 border-gray-700/20;
}
```

**Fallback Strategy:**
- Browsers without backdrop-filter support get solid semi-transparent background
- Progressive enhancement: `@supports (backdrop-filter: blur(10px))` for detection
- No JavaScript required for fallback detection

**Browser Support:**
- Chrome 76+, Firefox 103+, Safari 9+ (with -webkit prefix)
- Graceful degradation for older browsers (solid background)

---

## 3. Hero Image/Screenshot Strategy

### Decision: Optimized Static Screenshots + Next.js Image Component

**Rationale:**
- Static screenshots provide instant credibility without complex video infrastructure
- Next.js `<Image>` component provides automatic optimization and lazy loading
- WebP format with PNG fallback for broad compatibility
- Can be easily replaced with real app screenshots post-launch

**Screenshot Requirements:**
1. **Hero Screenshot**: Full dashboard view showing entries, streak counter, insights
2. **Feature Screenshots**: 6 focused screenshots showing specific features in action
3. **Format**: PNG exported at 2x resolution, compressed to WebP via Next.js Image
4. **Dimensions**: Hero 1200x800px, Features 600x400px (2x exported: 2400x1600, 1200x800)

**Placeholder Strategy (Pre-Launch):**
- Use Figma/design tool to create realistic mockups with fake but realistic data
- Include recognizable UI elements (navigation, buttons, data visualizations)
- Ensure consistency with actual app color scheme and typography

**Image Optimization:**
- Next.js Image component with `priority` for hero image (LCP optimization)
- Lazy loading for below-the-fold images
- Responsive srcset generation automatic via Next.js
- Target: <200KB total image weight for all hero/feature images

---

## 4. Testimonial Data Management

### Decision: Static JSON Data File with TypeScript Types

**Rationale:**
- No CMS or database needed for initial launch (YAGNI principle)
- Easy to version control and update via code changes
- Fast loading (no API calls), better for SEO and initial page load
- Can migrate to dynamic CMS later without changing component structure

**Data Structure:**

```typescript
interface Testimonial {
  id: string;
  name: string;
  avatar?: string;  // Optional: defaults to generated avatar
  result: string;   // e.g., "Lost 15 lbs in 8 weeks"
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date?: string;    // Optional: "March 2025"
}
```

**Initial Content Strategy:**
1. Use 6-8 representative personas based on target user demographics
2. Results should be realistic and varied (weight loss, energy, consistency)
3. Quotes should address specific pain points identified in spec
4. Include diversity in names, results, and experiences

**Future Migration Path:**
- When real testimonials collected, add `verified: boolean` field
- Implement admin panel to manage testimonials dynamically
- Add photo upload for real user avatars
- For now: keep it simple with static data

---

## 5. Performance Optimization Strategy

### Decision: Multi-Layered Approach

**Rationale:**
- Lighthouse >90 performance score requires optimization at multiple levels
- <2s page load critical for conversion rates
- 60fps animations essential for premium feel

**Optimization Techniques:**

#### 5.1 Image Optimization
- Next.js Image component with automatic WebP conversion
- Lazy loading for below-the-fold images
- `priority` prop for hero image (LCP optimization)
- Responsive image sizes based on viewport

#### 5.2 Font Optimization
- Use `next/font` for automatic font optimization
- Subset fonts to include only needed characters
- Preload critical fonts
- System font fallbacks (Inter → SF Pro → system-ui)

#### 5.3 Code Splitting
- Dynamic imports for Client Components not in viewport
- Separate bundle for animation library (load only if animations enabled)
- Lazy load testimonial section (below fold)

#### 5.4 Animation Performance
- Use `transform` and `opacity` properties (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left` (cause reflow)
- Use `will-change` sparingly and remove after animation
- Implement `IntersectionObserver` to start animations only when visible

#### 5.5 CSS Optimization
- Tailwind CSS purge unused styles in production
- Critical CSS inlined for above-the-fold content
- Defer non-critical stylesheets

**Performance Budget:**
- JavaScript: <150KB (gzipped)
- CSS: <50KB (gzipped)
- Images: <200KB total (hero + features)
- Fonts: <100KB
- Total: <500KB first load

**Monitoring:**
- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking: LCP <2.5s, FID <100ms, CLS <0.1
- Bundle size analysis via `@next/bundle-analyzer`

---

## 6. Responsive Design Breakpoints

### Decision: Tailwind CSS Default Breakpoints with Custom Mobile-First Approach

**Rationale:**
- Tailwind's defaults align with industry standards and device market share
- Mobile-first ensures fast mobile performance (80% of traffic)
- Constitution requires 375px+ support (modern smartphone minimum)

**Breakpoint Strategy:**

```javascript
// Tailwind default breakpoints (keep as-is)
{
  'sm': '640px',   // Large phones (landscape) and small tablets
  'md': '768px',   // Tablets
  'lg': '1024px',  // Laptops
  'xl': '1280px',  // Desktops
  '2xl': '1536px'  // Large desktops
}
```

**Mobile-First Design Decisions:**

| Section | Mobile (375-639px) | Tablet (640-1023px) | Desktop (1024px+) |
|---------|-------------------|-------------------|------------------|
| **Hero** | Single column, stacked CTA buttons | Single column, horizontal CTA buttons | Two column (content + screenshot) |
| **Social Proof** | 1 testimonial card per row | 2 cards per row | 3 cards per row |
| **Features** | 1 feature per row | 2 features per row | 3 features per row |
| **How It Works** | Vertical steps | Vertical steps with larger icons | Horizontal with connecting lines |
| **Typography** | text-3xl heading (30px) | text-4xl heading (36px) | text-5xl heading (48px) |
| **Spacing** | py-12 sections (48px) | py-16 sections (64px) | py-20 sections (80px) |

**Touch Target Minimum:**
- All buttons: 44x44px minimum (WCAG 2.1 AA)
- Tap area padding for links: 16px
- Increased hover states on desktop, focus states on all devices

---

## 7. Accessibility Implementation

### Decision: WCAG 2.1 AA Compliance via Semantic HTML + ARIA + Keyboard Navigation

**Rationale:**
- Constitution mandates WCAG 2.1 AA minimum
- Semantic HTML provides best screen reader experience
- Keyboard navigation essential for power users
- Color contrast ratios must meet 4.5:1 minimum

**Implementation Checklist:**

#### 7.1 Semantic HTML
- Use `<main>`, `<section>`, `<article>`, `<header>`, `<footer>` appropriately
- Heading hierarchy: `<h1>` → `<h2>` → `<h3>` (no skipping levels)
- Buttons use `<button>`, links use `<a>` (not div with onClick)

#### 7.2 ARIA Labels
- `aria-label` for icon-only buttons
- `aria-describedby` for additional context
- `landmark` roles for major page sections
- `aria-live` for dynamic content updates (if any)

#### 7.3 Keyboard Navigation
- All interactive elements focusable via Tab key
- Visible focus indicators (ring-2 ring-purple-500)
- Logical tab order (top to bottom, left to right)
- Escape key closes modals (if implemented later)

#### 7.4 Color Contrast
- Text on gradient backgrounds: ensure 4.5:1 contrast at all gradient stops
- Use semi-transparent overlays on gradient backgrounds if needed
- White text on purple gradient: verified contrast >4.5:1
- Link colors: purple-600 on white background (contrast 7:1)

#### 7.5 Motion Accessibility
- Respect `prefers-reduced-motion` media query
- Disable animations for users with motion sensitivity
- Provide instant transitions as fallback

**Testing Strategy:**
- Automated: axe-core via jest-axe in component tests
- Manual: Screen reader testing (NVDA on Windows, VoiceOver on Mac/iOS)
- Keyboard-only navigation testing
- Lighthouse accessibility audit (target: 100 score)

---

## 8. SEO Optimization

### Decision: Enhanced Metadata + Structured Data + Performance Optimization

**Rationale:**
- Marketing page must rank well for "fasting tracker", "intermittent fasting app"
- Rich snippets increase click-through rates
- Performance is a ranking factor (Core Web Vitals)

**Implementation:**

#### 8.1 Metadata Enhancement
```javascript
export const metadata = {
  title: "The Simplest Way to Track Intermittent Fasting | Fasting Tracker",
  description: "Join 10,000+ people tracking fasts, building streaks, and reaching health goals. Free fasting tracker with simple logging, insights, and motivation. Start now.",
  keywords: "intermittent fasting tracker, fasting app, 16:8 fasting, OMAD tracker, fasting timer, fasting journal, weight loss app",
  // ... Open Graph, Twitter Cards (already present)
}
```

#### 8.2 Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Fasting Tracker",
  "applicationCategory": "HealthApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "240"
  }
}
```

#### 8.3 Performance for SEO
- Target Lighthouse Performance >90 (ranking factor)
- Mobile-first indexing optimization
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

**Out of Scope (Per Spec):**
- Blog content and SEO content marketing (separate initiative)
- Backlink building and off-page SEO
- Multi-language SEO and hreflang tags

---

## 9. Call-to-Action (CTA) Routing Logic

### Decision: Server-Side Session Check + Client-Side Redirect

**Rationale:**
- NextAuth.js session available server-side via `auth()` helper
- Avoid flash of wrong button state by checking on server
- Client-side redirect after click maintains smooth UX

**Implementation Pattern:**

```javascript
// Server Component (parent)
import { auth } from '@/auth';

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session;
  
  return <Hero isAuthenticated={isAuthenticated} />;
}

// Client Component (CTA button)
'use client';
export function CTAButton({ isAuthenticated }) {
  const router = useRouter();
  
  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/entries'); // Existing user → dashboard
    } else {
      router.push('/register'); // New user → sign up
    }
  };
  
  return (
    <button onClick={handleClick}>
      {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
    </button>
  );
}
```

**Edge Cases Handled:**
- Session expired during page view: redirect to /login with return URL
- User creates account in different tab: page refresh shows authenticated state
- "See How It Works" button: always scrolls to #how-it-works (no auth check)

---

## 10. Testing Strategy

### Decision: 3-Tier Testing Approach (Unit → Integration → E2E)

**Rationale:**
- Constitution mandates TDD with 80%+ coverage
- Each user story in spec must have corresponding E2E test
- Component isolation ensures reusability and maintainability

**Testing Layers:**

#### 10.1 Unit Tests (Jest + React Testing Library)
- **Atoms**: Test rendering, props, interactions (buttons, cards, icons)
- **Molecules**: Test composition, data display, click handlers
- **Organisms**: Test section assembly, data prop handling, responsive behavior
- **Target Coverage**: 90%+ for new components

**Example Test Structure:**
```javascript
describe('GradientButton', () => {
  it('renders with correct text', () => { /* ... */ });
  it('calls onClick handler when clicked', () => { /* ... */ });
  it('applies primary variant styles', () => { /* ... */ });
  it('is keyboard accessible (tab + enter)', () => { /* ... */ });
  it('has no accessibility violations', () => { /* axe-core check */ });
});
```

#### 10.2 Integration Tests (Jest + RTL + MSW)
- Test organism components with real child components
- Mock NextAuth session for CTA routing tests
- Test animation triggers (IntersectionObserver mocked)

#### 10.3 E2E Tests (Playwright)
- **6 User Stories from Spec** → 6 E2E test scenarios
- Test full visitor journey: land → scroll → click CTA → register
- Test responsive behavior on mobile and desktop viewports
- Test accessibility with keyboard navigation
- Test performance with Lighthouse via Playwright

**Example E2E Test:**
```javascript
test('User Story 1: Visitor understands value proposition', async ({ page }) => {
  await page.goto('/');
  
  // Check headline visible
  await expect(page.getByRole('heading', { 
    name: 'The Simplest Way to Track Intermittent Fasting' 
  })).toBeVisible();
  
  // Check trust indicators
  await expect(page.getByText('4.8/5 stars')).toBeVisible();
  await expect(page.getByText('10,000+ active fasters')).toBeVisible();
  
  // Check CTAs
  await expect(page.getByRole('button', { name: 'Start Free' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'See How It Works' })).toBeVisible();
});
```

**Test Execution Order:**
1. Write failing tests (Red)
2. Show tests to user for approval
3. Implement component (Green)
4. Refactor (Refactor)
5. Commit only when all tests pass

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|------------|
| **Animations** | Framer Motion | Declarative API, 60fps performance, small bundle |
| **Glassmorphism** | Tailwind + backdrop-filter | Native CSS, no extra dependencies, performant |
| **Images** | Next.js Image + Static Screenshots | Automatic optimization, lazy loading, fast LCP |
| **Testimonials** | Static JSON data | Simple, fast, version controlled, no CMS needed |
| **Performance** | Multi-layered optimization | <2s load time, Lighthouse >90, 60fps animations |
| **Responsive** | Tailwind breakpoints (mobile-first) | Industry standard, proven at scale |
| **Accessibility** | Semantic HTML + ARIA + Keyboard | WCAG 2.1 AA compliance, screen reader friendly |
| **SEO** | Enhanced metadata + structured data | Better rankings, rich snippets |
| **CTA Routing** | Server session check + client redirect | No flash, smooth UX, maintains auth state |
| **Testing** | 3-tier (Unit → Integration → E2E) | 80%+ coverage, TDD compliance, all user stories tested |

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**
- Create data-model.md (testimonial, feature, trust indicator data structures)
- Define component contracts (props, interfaces)
- Generate quickstart.md (development setup instructions)
- Update agent context with new dependencies (Framer Motion)
