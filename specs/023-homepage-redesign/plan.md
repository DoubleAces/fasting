# Implementation Plan: Homepage Redesign

**Branch**: `023-homepage-redesign` | **Date**: October 29, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-homepage-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Complete redesign of the homepage (src/app/page.js) to transform it from a generic landing page into a conversion-focused, modern marketing page. The redesign includes six main sections: (1) Hero with specific value proposition and trust indicators, (2) Social Proof with testimonials and success metrics, (3) Problem/Solution addressing user pain points, (4) Features Showcase with concrete benefits, (5) How It Works 3-step process, and (6) Final CTA with risk reversal. Design follows Apple-inspired aesthetic with purple-to-pink gradients, glassmorphism effects, generous white space, and 60fps smooth animations. All sections are mobile-first responsive and integrate with existing NextAuth.js authentication for intelligent CTA routing.

## Technical Context

**Language/Version**: JavaScript (ES6+) / React 18 / Next.js 14+ (App Router)
**Primary Dependencies**: React 18, Next.js 14, Tailwind CSS 3.x, NextAuth.js
**Storage**: N/A (presentational feature, no new data storage)
**Testing**: Jest + React Testing Library (component tests), Playwright (E2E tests)
**Target Platform**: Web (Desktop + Mobile browsers), Progressive Web App (PWA)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Lighthouse Performance >90, <2s page load, 60fps animations, LCP <2.5s
**Constraints**: Mobile-first responsive (375px+), zero horizontal scroll, WCAG 2.1 AA accessibility
**Scale/Scope**: 6 homepage sections, ~8-12 new components, integration with existing auth system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **Next.js Best Practices** | ✅ PASS | Using App Router, Server Components for static sections, Client Components for interactive elements (CTAs, animations) |
| **Mobile-First Design** | ✅ PASS | All designs mobile-first (375px+), touch-friendly CTAs, responsive grid layouts |
| **Test-Driven Development** | ✅ PASS | Component tests for all new components, E2E tests for user journeys (6 user stories) |
| **Component Architecture** | ✅ PASS | Atomic design: atoms (Button, Icon), molecules (TestimonialCard, FeatureCard), organisms (Hero, SocialProof sections) |
| **User Privacy & Security** | ✅ PASS | No user data collection on homepage, existing NextAuth.js integration maintained |
| **Performance & Accessibility** | ✅ PASS | Target: Lighthouse >90, WCAG 2.1 AA, keyboard navigation, screen reader support |

### Technology Stack Alignment

| Component | Constitution Requirement | Implementation |
|-----------|-------------------------|----------------|
| Framework | Next.js (latest stable) | ✅ Next.js 14 App Router |
| Language | JavaScript (ES6+) | ✅ JavaScript ES6+ with React 18 |
| Styling | Tailwind CSS | ✅ Tailwind CSS 3.x with custom gradients |
| Testing | Jest + RTL + Playwright | ✅ Component tests (Jest/RTL) + E2E (Playwright) |
| Authentication | NextAuth.js | ✅ Existing NextAuth.js integration for CTA routing |

### Development Workflow Gates

| Gate | Status | Implementation Plan |
|------|--------|-------------------|
| TDD Mandatory | ✅ READY | Write tests for each component before implementation |
| Code Quality | ✅ READY | ESLint + Prettier pre-configured, will enforce on all new code |
| Test Coverage | ✅ READY | Target 80%+ coverage for new components and logic |
| Accessibility | ✅ READY | WCAG 2.1 AA compliance verified via Lighthouse and manual testing |

### Pre-Phase 0 Gate: ✅ PASSED

All constitutional requirements are satisfied. Feature is frontend-only, respects existing architecture, follows TDD principles, and aligns with performance/accessibility standards.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   └── page.js                              # MODIFIED: Homepage redesign (main file)
├── components/
│   ├── atoms/
│   │   ├── GradientButton.js               # NEW: Primary CTA button with gradient
│   │   ├── GlassmorphicCard.js             # NEW: Card with glassmorphism effect
│   │   └── StarRating.js                   # NEW: Star rating display component
│   ├── molecules/
│   │   ├── TestimonialCard.js              # NEW: Individual testimonial card
│   │   ├── FeatureCard.js                  # NEW: Feature showcase card
│   │   ├── ProcessStep.js                  # NEW: "How It Works" step component
│   │   ├── TrustBadge.js                   # NEW: Trust indicator badge
│   │   └── ProblemSolutionBlock.js         # NEW: Problem/solution content block
│   └── organisms/
│       ├── Hero.js                          # MODIFIED: New hero section
│       ├── SocialProofSection.js           # NEW: Testimonials and trust badges
│       ├── ProblemSolutionSection.js       # NEW: Pain points and solutions
│       ├── FeaturesList.js                 # MODIFIED: Enhanced features showcase
│       ├── HowItWorksSection.js            # NEW: 3-step process section
│       └── FinalCTASection.js              # NEW: Bottom conversion section
└── lib/
    └── data/
        ├── testimonials.js                  # NEW: Testimonial data (placeholder)
        ├── features.js                      # MODIFIED: Enhanced feature data
        └── trustIndicators.js               # NEW: Trust badge data

tests/
├── components/
│   ├── atoms/
│   │   ├── GradientButton.test.js          # NEW: Button component tests
│   │   ├── GlassmorphicCard.test.js        # NEW: Card component tests
│   │   └── StarRating.test.js              # NEW: Rating component tests
│   ├── molecules/
│   │   ├── TestimonialCard.test.js         # NEW: Testimonial tests
│   │   ├── FeatureCard.test.js             # NEW: Feature card tests
│   │   ├── ProcessStep.test.js             # NEW: Process step tests
│   │   └── ProblemSolutionBlock.test.js    # NEW: Problem/solution tests
│   └── organisms/
│       ├── Hero.test.js                     # MODIFIED: Updated hero tests
│       ├── SocialProofSection.test.js      # NEW: Social proof tests
│       ├── ProblemSolutionSection.test.js  # NEW: Problem/solution tests
│       ├── FeaturesList.test.js            # MODIFIED: Updated features tests
│       ├── HowItWorksSection.test.js       # NEW: How It Works tests
│       └── FinalCTASection.test.js         # NEW: Final CTA tests
└── e2e/
    └── homepage-conversion.spec.js          # NEW: E2E tests for 6 user stories

public/
├── images/
│   ├── hero-screenshot.png                  # NEW: App interface screenshot
│   ├── feature-screenshots/                 # NEW: Feature demonstration images
│   └── testimonial-avatars/                 # NEW: User avatar placeholders
```

**Structure Decision**: This is a Next.js 14 App Router web application. Following the existing atomic design pattern with atoms/molecules/organisms component hierarchy. New components are organized by complexity level. Modified files maintain backward compatibility. Data files separate content from components for easier maintenance. Tests mirror source structure per TDD requirements.

## Complexity Tracking

*No violations detected. All implementation approaches align with constitution principles.*

**Simplicity Measures Applied:**
- Reusing existing Tailwind CSS configuration (no new CSS framework)
- Leveraging existing NextAuth.js integration (no new auth logic)
- Using existing component structure (atoms/molecules/organisms)
- Static data files instead of CMS or admin panel
- Client Components only where interactivity required (buttons, animations)
- Server Components by default for static content sections

