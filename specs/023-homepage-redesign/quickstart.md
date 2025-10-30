# Quickstart Guide: Homepage Redesign

**Date**: October 29, 2025  
**Feature**: 023-homepage-redesign  
**Status**: Ready for Implementation

## Overview

This guide provides everything needed to start implementing the homepage redesign. Follow these steps to set up your development environment, understand the architecture, and begin building components using Test-Driven Development.

---

## Prerequisites

Ensure you have the following installed and configured:

- **Node.js**: v18+ (check: `node --version`)
- **npm or pnpm**: Latest version (check: `npm --version`)
- **Git**: Configured with your credentials
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Jest Runner (optional but helpful)

---

## Setup Instructions

### 1. Verify Feature Branch

```powershell
# Ensure you're on the feature branch
git branch --show-current
# Should output: 023-homepage-redesign

# If not, checkout the branch
git checkout 023-homepage-redesign
```

### 2. Install Dependencies

The existing dependencies should already be installed. If starting fresh:

```powershell
# Install existing dependencies
npm install

# Install new dependency for animations
npm install framer-motion
```

**New Dependency:**
- `framer-motion`: ^10.x - Animation library for smooth transitions and scroll animations

### 3. Verify Development Environment

```powershell
# Start development server
npm run dev

# Open browser to http://localhost:3000
# You should see the current homepage
```

### 4. Run Tests

```powershell
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

---

## Project Structure

### Where to Create Files

```
src/
├── app/
│   └── page.js                              # ⚠️ MODIFY: Main homepage file
├── components/
│   ├── atoms/
│   │   ├── GradientButton.js               # ✨ CREATE NEW
│   │   ├── GlassmorphicCard.js             # ✨ CREATE NEW
│   │   └── StarRating.js                   # ✨ CREATE NEW
│   ├── molecules/
│   │   ├── TestimonialCard.js              # ✨ CREATE NEW
│   │   ├── FeatureCard.js                  # ✨ CREATE NEW
│   │   ├── ProcessStep.js                  # ✨ CREATE NEW
│   │   ├── TrustBadge.js                   # ✨ CREATE NEW
│   │   └── ProblemSolutionBlock.js         # ✨ CREATE NEW
│   └── organisms/
│       ├── Hero.js                          # ⚠️ MODIFY: Redesign hero
│       ├── SocialProofSection.js           # ✨ CREATE NEW
│       ├── ProblemSolutionSection.js       # ✨ CREATE NEW
│       ├── FeaturesList.js                 # ⚠️ MODIFY: Enhance features
│       ├── HowItWorksSection.js            # ✨ CREATE NEW
│       └── FinalCTASection.js              # ✨ CREATE NEW
└── lib/
    └── data/
        ├── testimonials.js                  # ✨ CREATE NEW
        ├── features.js                      # ⚠️ MODIFY: Add new data
        ├── trustIndicators.js               # ✨ CREATE NEW
        ├── processSteps.js                  # ✨ CREATE NEW
        ├── problemsSolutions.js             # ✨ CREATE NEW
        └── ctaConfig.js                     # ✨ CREATE NEW

tests/
├── components/
│   ├── atoms/
│   │   ├── GradientButton.test.js          # ✨ CREATE NEW
│   │   ├── GlassmorphicCard.test.js        # ✨ CREATE NEW
│   │   └── StarRating.test.js              # ✨ CREATE NEW
│   ├── molecules/
│   │   └── [...test files]                  # ✨ CREATE NEW
│   └── organisms/
│       └── [...test files]                  # ✨ CREATE NEW
└── e2e/
    └── homepage-conversion.spec.js          # ✨ CREATE NEW
```

---

## Development Workflow (TDD)

**CRITICAL**: Follow Test-Driven Development (constitution requirement):

### Step-by-Step Process

#### 1. Choose a Component to Build

Start with atomic components (bottom-up approach):
1. **Phase 1**: Atoms (GradientButton, GlassmorphicCard, StarRating)
2. **Phase 2**: Molecules (TestimonialCard, FeatureCard, etc.)
3. **Phase 3**: Organisms (Hero, SocialProofSection, etc.)
4. **Phase 4**: Integration (Update page.js, add all sections)

#### 2. Write the Test First (RED)

Example: Creating `GradientButton`

```javascript
// tests/components/atoms/GradientButton.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import GradientButton from '@/components/atoms/GradientButton';

describe('GradientButton', () => {
  it('renders with correct text', () => {
    render(<GradientButton>Click Me</GradientButton>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<GradientButton onClick={handleClick}>Click Me</GradientButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles by default', () => {
    render(<GradientButton>Click Me</GradientButton>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-gradient-to-r');
    expect(button).toHaveClass('from-purple-600');
    expect(button).toHaveClass('to-pink-500');
  });

  it('is keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<GradientButton onClick={handleClick}>Click Me</GradientButton>);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Run the test** (it should FAIL):
```powershell
npm test -- GradientButton.test.js
# Expected: All tests fail (component doesn't exist yet)
```

#### 3. Show Tests to User for Approval

Before implementing, share tests with user:
- "Here are the tests for GradientButton. These verify it renders correctly, handles clicks, applies styles, and is keyboard accessible. Should I proceed with implementation?"

#### 4. Implement the Component (GREEN)

Only after tests are approved, create the component:

```javascript
// src/components/atoms/GradientButton.js
'use client';

export default function GradientButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        rounded-xl font-semibold transition-all duration-200
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
```

**Run tests again**:
```powershell
npm test -- GradientButton.test.js
# Expected: All tests PASS ✅
```

#### 5. Refactor (REFACTOR)

- Clean up code
- Extract repeated logic
- Improve readability
- Tests still pass

#### 6. Commit

```powershell
git add tests/components/atoms/GradientButton.test.js
git add src/components/atoms/GradientButton.js
git commit -m "feat: add GradientButton component with tests"
```

---

## Implementation Order

### Week 1: Atoms & Data

**Day 1-2: Setup & Atoms**
1. Install Framer Motion: `npm install framer-motion`
2. Create data files (testimonials.js, features.js, etc.)
3. Build atoms with tests:
   - GradientButton
   - GlassmorphicCard
   - StarRating

**Day 3: Verify Atoms**
- Run all atom tests
- Visual verification in Storybook (optional) or test page
- Get user approval before proceeding

### Week 2: Molecules

**Day 4-5: Build Molecules**
1. TestimonialCard
2. FeatureCard
3. ProcessStep
4. TrustBadge
5. ProblemSolutionBlock

**Each molecule**:
- Write tests first
- Show tests to user
- Implement component
- Verify tests pass

### Week 3: Organisms

**Day 6-8: Build Organisms**
1. Redesign Hero (modify existing)
2. SocialProofSection (new)
3. ProblemSolutionSection (new)
4. Enhance FeaturesList (modify existing)
5. HowItWorksSection (new)
6. FinalCTASection (new)

### Week 4: Integration & Polish

**Day 9-10: Page Integration**
- Update src/app/page.js
- Import and compose all sections
- Verify responsive layout
- Test authentication-based CTA routing

**Day 11-12: E2E Tests**
- Write E2E tests for 6 user stories
- Test on mobile and desktop viewports
- Accessibility testing (keyboard, screen reader)
- Performance testing (Lighthouse)

**Day 13-14: Polish & Review**
- Performance optimization
- Animation fine-tuning
- Final accessibility pass
- Code review
- User acceptance testing

---

## Key Files Reference

### Authentication Integration

```javascript
// src/app/page.js (Server Component)
import { auth } from '@/auth';
import Hero from '@/components/organisms/Hero';

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session;
  
  return (
    <main>
      <Hero isAuthenticated={isAuthenticated} />
      {/* ... other sections */}
    </main>
  );
}
```

### Framer Motion Animation Example

```javascript
// Example: Fade in on scroll
'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AnimatedSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Glassmorphism Tailwind Classes

```javascript
// Base glassmorphic card classes
const glassClasses = `
  bg-white/10 
  backdrop-blur-md 
  backdrop-saturate-150 
  border border-white/20 
  rounded-2xl 
  shadow-lg
`;

// With fallback for older browsers
const glassWithFallback = `
  ${glassClasses}
  supports-[not(backdrop-filter)]:bg-white/95
`;
```

---

## Testing Commands

### Unit Tests

```powershell
# Run all tests
npm test

# Run tests for specific component
npm test -- GradientButton

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Update snapshots (if using)
npm test -- -u
```

### E2E Tests

```powershell
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (debugging)
npx playwright test --ui

# Run specific E2E test
npx playwright test homepage-conversion

# Generate E2E report
npx playwright show-report
```

### Accessibility Testing

```powershell
# Automated accessibility scan (via jest-axe in tests)
npm test -- --testNamePattern="accessibility"

# Manual testing checklist:
# 1. Keyboard navigation (Tab, Enter, Escape)
# 2. Screen reader (NVDA on Windows, VoiceOver on Mac)
# 3. High contrast mode
# 4. Reduced motion preference
```

---

## Performance Optimization Checklist

Before marking feature complete, verify:

- [ ] **Images optimized**: All images use Next.js `<Image>` component
- [ ] **Hero image priority**: Hero screenshot has `priority` prop (LCP optimization)
- [ ] **Lazy loading**: Below-the-fold images lazy load
- [ ] **Font optimization**: Using `next/font` for Inter/SF Pro
- [ ] **Code splitting**: Client components isolated, no unnecessary 'use client'
- [ ] **Animation performance**: Using `transform` and `opacity` only (GPU accelerated)
- [ ] **Lighthouse score**: Performance >90, Accessibility 100
- [ ] **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] **Bundle size**: Check with `npm run build` and analyze bundle

---

## Common Issues & Solutions

### Issue: Tests fail with "Cannot find module '@/components/...'"

**Solution**: Verify `jsconfig.json` or `tsconfig.json` has path aliases configured:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Tailwind classes not applying

**Solution**: 
1. Verify `tailwind.config.js` includes component paths
2. Restart dev server after Tailwind config changes
3. Check for typos in class names

### Issue: Framer Motion animations not working

**Solution**:
1. Ensure component has `'use client'` directive
2. Verify Framer Motion is installed: `npm list framer-motion`
3. Check browser console for errors

### Issue: Authentication status not updating

**Solution**:
1. Ensure parent component is Server Component (can call `auth()`)
2. Verify NextAuth.js is configured correctly
3. Check session is being passed as prop to client components

---

## Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)

### Project-Specific Docs
- [spec.md](./spec.md) - Feature specification
- [data-model.md](./data-model.md) - Data structures
- [contracts/components.md](./contracts/components.md) - Component interfaces
- [research.md](./research.md) - Technology decisions

### Constitution
- [constitution.md](../.specify/memory/constitution.md) - Project principles and standards

---

## Getting Help

If you encounter issues:

1. **Check the spec**: Review [spec.md](./spec.md) for requirements
2. **Review contracts**: Check [contracts/components.md](./contracts/components.md) for component interfaces
3. **Read research**: See [research.md](./research.md) for technology decisions
4. **Ask for clarification**: If requirements are unclear, ask before implementing

---

## Next Steps

1. ✅ Verify setup (npm install, run dev server)
2. ✅ Read through contracts and data model
3. ✅ Start with atoms (GradientButton first)
4. ✅ Follow TDD workflow (write tests → get approval → implement)
5. ✅ Commit frequently with descriptive messages
6. ✅ Test on mobile and desktop regularly
7. ✅ Keep user informed of progress

**Ready to start building!** 🚀

Begin with: `tests/components/atoms/GradientButton.test.js`
