# Implementation Plan: Website Structure & Authentication

**Branch**: `002-website-auth-structure` | **Date**: October 19, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-website-auth-structure/spec.md`

**Note**: This plan implements a complete website structure with authentication, transforming the existing fasting tracker into a full web application with public marketing pages, user authentication (email/password and Google OAuth), protected routes, FAQ page, and comprehensive SEO optimization.

## Summary

**Primary Requirement**: Transform the fasting tracker from a standalone application into a full-featured website with:
- Public marketing homepage and FAQ page
- User authentication system (email/password + Google OAuth)
- Session management with "remember me" functionality
- Protected routes for entries and settings
- Password reset flow
- Modern Apple-inspired design
- Full SEO optimization with meta tags, structured data, and search engine discoverability

**Technical Approach**: 
- Leverage Next.js 14+ App Router for server-side rendering and routing
- Implement NextAuth.js for authentication with multiple providers
- Use MongoDB for user accounts, sessions, and password reset tokens
- Apply middleware for route protection and authentication checks
- Implement SEO best practices with server-side rendering for public pages
- Create reusable atomic design components for consistent UI

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 14.2+ (App Router)  
**Primary Dependencies**: 
- Next.js 14.2+ (React framework with App Router)
- NextAuth.js v5 (Auth.js) - Authentication with multiple providers
- MongoDB 6.0+ with Mongoose 8.0+ - Database and ODM
- Bcrypt - Password hashing
- React Hook Form - Form handling and validation
- Tailwind CSS - Styling
- Jest + React Testing Library + Playwright - Testing suite

**Storage**: MongoDB (existing) with new collections:
- users (credentials, profile, OAuth data)
- sessions (active user sessions)
- passwordResetTokens (time-limited reset tokens)
- faqItems (FAQ questions and answers)
- Existing: entries, settings (updated with user references)

**Testing**: Jest (unit + integration), React Testing Library (components), Playwright (E2E)

**Target Platform**: Web application (responsive: mobile, tablet, desktop)

**Project Type**: Web application (Next.js App Router with server + client components)

**Performance Goals**:
- Homepage load: <2 seconds (LCP <2.5s)
- Authentication operations: <10 seconds for login, <60 seconds for registration
- FAQ page load: <2 seconds with search results <500ms
- Lighthouse scores: Performance >90, Accessibility 100, Best Practices >90, SEO >90

**Constraints**:
- WCAG 2.1 AA accessibility compliance
- Server-side rendering for public pages (SEO requirement)
- HTTPS only for all authentication operations
- Session cookies: HttpOnly, Secure, SameSite
- Password requirements: min 8 chars, uppercase, lowercase, number
- Rate limiting: max 5 login attempts per 15 minutes per IP

**Scale/Scope**:
- Initial: 100-1000 concurrent users
- 9 user stories (3 P1, 3 P2, 3 P3)
- 65 functional requirements
- 19 success criteria
- ~15-20 new pages/components
- 5 new database collections/entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Next.js Best Practices
- ✅ **PASS**: Using Next.js 14+ App Router architecture
- ✅ **PASS**: Server Components by default, Client Components only when necessary (forms, interactive UI)
- ✅ **PASS**: Following file-based routing conventions
- ✅ **PASS**: Leveraging built-in optimizations (Image, Font, Script)

### Mobile-First Responsive Design
- ✅ **PASS**: All components must be responsive (specified in FR-044)
- ✅ **PASS**: Touch-friendly UI elements (44x44px minimum touch targets)
- ✅ **PASS**: Mobile-responsive hamburger menu for <768px screens (FR-005)
- ✅ **PASS**: Progressive enhancement approach

### Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: TDD workflow will be enforced (tests → fail → implement)
- ✅ **PASS**: Unit tests for authentication logic, utilities, validation
- ✅ **PASS**: Integration tests for API routes (auth endpoints, session management)
- ✅ **PASS**: Component tests for all UI components
- ✅ **PASS**: E2E tests for critical auth flows (register, login, password reset)
- ✅ **PASS**: Target: 80%+ code coverage

### Component Architecture
- ✅ **PASS**: Atomic design principles (atoms, molecules, organisms)
- ✅ **PASS**: Reusable, composable components
- ✅ **PASS**: Self-contained and independently testable
- ✅ **PASS**: Props validation with JSDoc comments

### User Privacy & Data Security
- ✅ **PASS**: Password hashing with bcrypt (FR-017, minimum 10 rounds)
- ✅ **PASS**: Secure session tokens (FR-020, 256 bits entropy)
- ✅ **PASS**: HTTPS-only, HttpOnly, Secure cookies (FR-033, security considerations)
- ✅ **PASS**: CSRF protection for auth forms (FR-033)
- ✅ **PASS**: Rate limiting on login attempts (FR-034, max 5/15min)
- ✅ **PASS**: User data isolation (FR-041, each user sees only their data)
- ✅ **PASS**: No user enumeration (security considerations)

### Performance & Accessibility
- ✅ **PASS**: Lighthouse targets specified: SEO >90, Accessibility 100
- ✅ **PASS**: LCP <2.5s (homepage <2s target in SC-006)
- ✅ **PASS**: WCAG 2.1 AA compliance (FR-, SC-008)
- ✅ **PASS**: Semantic HTML5 (FR-055)
- ✅ **PASS**: Keyboard navigation support (accessibility requirement)
- ✅ **PASS**: Screen reader friendly

### Technology Stack Compliance
- ✅ **PASS**: Next.js (latest stable version)
- ✅ **PASS**: MongoDB with Mongoose ODM
- ✅ **PASS**: NextAuth.js for authentication
- ✅ **PASS**: Jest + React Testing Library + Playwright
- ✅ **PASS**: Tailwind CSS for styling
- ✅ **PASS**: React Hook Form for form handling

**Result**: ✅ **ALL GATES PASSED** - No constitution violations. Proceed to Phase 0.

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

**Structure Decision**: Web application (Next.js App Router) - Single project structure with src/ directory

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group (shared layout)
│   │   ├── layout.js             # Auth pages layout (centered, minimal)
│   │   ├── login/
│   │   │   └── page.js           # Login page
│   │   ├── register/
│   │   │   └── page.js           # Registration page
│   │   └── forgot-password/
│   │       └── page.js           # Password reset request page
│   ├── (protected)/              # Protected routes group (requires auth)
│   │   ├── layout.js             # Protected layout (with navigation)
│   │   ├── entries/
│   │   │   └── page.js           # Fasting entries (existing feature)
│   │   └── settings/
│   │       └── page.js           # User settings (existing feature)
│   ├── faq/
│   │   └── page.js               # Public FAQ page
│   ├── page.js                   # Homepage (public marketing page)
│   ├── layout.js                 # Root layout (global nav, footer)
│   ├── globals.css               # Global styles
│   └── api/                      # API routes
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.js      # NextAuth handler
│       │   ├── register/
│       │   │   └── route.js      # POST /api/auth/register
│       │   ├── forgot-password/
│       │   │   └── route.js      # POST /api/auth/forgot-password
│       │   └── reset-password/
│       │       └── route.js      # POST /api/auth/reset-password
│       ├── entries/
│       │   └── route.js          # Updated: GET/POST with user filtering
│       ├── settings/
│       │   └── route.js          # Updated: GET/PUT with user filtering
│       └── faq/
│           └── route.js          # GET /api/faq (with optional search)
├── components/                   # React components (atomic design)
│   ├── atoms/                    # Basic building blocks
│   │   ├── Button.js             # Existing + auth variants
│   │   ├── Input.js              # Existing + password variant
│   │   ├── LoadingSpinner.js     # Existing
│   │   ├── ErrorMessage.js       # Existing
│   │   ├── Link.js               # New: styled Next.js Link
│   │   └── Logo.js               # New: brand logo component
│   ├── molecules/                # Compound components
│   │   ├── FormField.js          # Existing
│   │   ├── NavLink.js            # New: navigation link with active state
│   │   ├── FAQItem.js            # New: expandable FAQ question/answer
│   │   └── SearchBar.js          # New: search input with icon
│   └── organisms/                # Complex components
│       ├── EntryForm.js          # Existing
│       ├── EntryList.js          # Existing
│       ├── SettingsForm.js       # Existing
│       ├── Navbar.js             # New: main navigation (public/protected variants)
│       ├── Footer.js             # New: site footer
│       ├── Hero.js               # New: homepage hero section
│       ├── FeaturesList.js       # New: homepage features grid
│       ├── LoginForm.js          # New: email/password + Google OAuth
│       ├── RegisterForm.js       # New: registration with validation
│       ├── ForgotPasswordForm.js # New: password reset request
│       ├── ResetPasswordForm.js  # New: password reset with token
│       └── FAQList.js            # New: FAQ list with search
├── lib/                          # Utilities and business logic
│   ├── auth.js                   # New: NextAuth configuration
│   ├── db.js                     # Existing: MongoDB connection
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js               # New: user model
│   │   ├── Session.js            # New: session model (if not using NextAuth adapter)
│   │   ├── PasswordResetToken.js # New: reset token model
│   │   ├── FAQItem.js            # New: FAQ model
│   │   ├── Entry.js              # Updated: add userId field
│   │   └── Settings.js           # Updated: add userId field
│   ├── utils/                    # Utility functions
│   │   ├── dateUtils.js          # Existing
│   │   ├── timeUtils.js          # Existing
│   │   ├── fastingCalculator.js  # Existing
│   │   ├── unitConversion.js     # Existing
│   │   ├── password.js           # New: bcrypt hashing/verification
│   │   ├── token.js              # New: secure token generation
│   │   └── email.js              # New: email sending utilities
│   └── validation/               # Validation schemas
│       ├── entrySchema.js        # Existing
│       ├── settingsSchema.js     # Existing
│       ├── authSchema.js         # New: auth validation (Joi)
│       └── faqSchema.js          # New: FAQ validation
├── middleware.js                 # New: Route protection middleware
└── styles/                       # Additional styles (if needed)

tests/
├── unit/                         # Unit tests
│   ├── lib/
│   │   ├── models/
│   │   │   ├── User.test.js
│   │   │   ├── PasswordResetToken.test.js
│   │   │   └── FAQItem.test.js
│   │   └── utils/
│   │       ├── password.test.js
│   │       ├── token.test.js
│   │       └── email.test.js
│   └── validation/
│       ├── authSchema.test.js
│       └── faqSchema.test.js
├── components/                   # Component tests
│   ├── atoms/
│   │   ├── Link.test.js
│   │   └── Logo.test.js
│   ├── molecules/
│   │   ├── NavLink.test.js
│   │   ├── FAQItem.test.js
│   │   └── SearchBar.test.js
│   └── organisms/
│       ├── Navbar.test.js
│       ├── Footer.test.js
│       ├── Hero.test.js
│       ├── FeaturesList.test.js
│       ├── LoginForm.test.js
│       ├── RegisterForm.test.js
│       ├── ForgotPasswordForm.test.js
│       ├── ResetPasswordForm.test.js
│       └── FAQList.test.js
├── integration/                  # Integration tests
│   ├── auth.test.js              # Auth API endpoints
│   ├── faq.test.js               # FAQ API endpoints
│   └── protected-routes.test.js  # Middleware protection
├── e2e/                          # End-to-end tests (Playwright)
│   ├── auth-flows.spec.js        # Register, login, logout, password reset
│   ├── homepage.spec.js          # Public homepage navigation
│   ├── faq.spec.js               # FAQ search and navigation
│   └── protected-access.spec.js  # Protected route redirects
└── pages/                        # Existing page tests (update for auth)
    ├── home.test.js              # Updated
    └── settings.test.js          # Updated

public/
├── robots.txt                    # New: SEO crawl rules
├── sitemap.xml                   # New: SEO sitemap
└── images/                       # Images (existing + new)
```

**New Files**: ~35 new components, 4 new models, 4 new API routes, 15+ new test files  
**Updated Files**: Entry.js, Settings.js, entries API route, settings API route, existing page tests

## Complexity Tracking

*No constitution violations identified. All requirements align with project governance.*

---

## Planning Phase Summary

### ✅ Phase 0: Research (COMPLETE)

**Output**: `research.md`

**Key Decisions**:
- ✅ NextAuth.js v5 for authentication (constitution-compliant, full-featured)
- ✅ Bcrypt for password hashing (industry standard, 10+ rounds)
- ✅ Next.js Metadata API for SEO (built-in, no extra dependencies)
- ✅ Client-side FAQ search (fast, appropriate for small datasets)
- ✅ JWT or MongoDB session storage (both options evaluated)
- ✅ Rate limiting middleware (in-memory or Redis)

**Unknowns Resolved**: All technical questions answered. Zero NEEDS CLARIFICATION items.

### ✅ Phase 1: Design & Contracts (COMPLETE)

**Outputs**:
- ✅ `data-model.md` - Complete Mongoose schemas for User, PasswordResetToken, FAQItem, plus Entry/Settings updates
- ✅ `contracts/api-spec.json` - OpenAPI 3.0 specification for all endpoints
- ✅ `contracts/README.md` - API contract documentation
- ✅ `quickstart.md` - Developer onboarding guide with setup instructions, architecture overview, common tasks
- ✅ Agent context updated - CLAUDE.md updated with new technology stack

**Key Deliverables**:
- 4 new Mongoose models defined (User, PasswordResetToken, FAQItem, Session)
- 2 updated models (Entry + userId, Settings + userId)
- 6 API endpoints specified (register, login, logout, forgot-password, reset-password, FAQ)
- 2 API endpoints updated (entries, settings with user filtering)
- Complete authentication flow documented
- Database migration strategy defined
- Security measures specified

### ✅ Constitution Check: PASSED

All 7 core principles validated:
- ✅ Next.js Best Practices (App Router, Server Components)
- ✅ Mobile-First Responsive Design
- ✅ Test-Driven Development (TDD mandatory)
- ✅ Component Architecture (atomic design)
- ✅ User Privacy & Data Security (bcrypt, HTTPS, rate limiting)
- ✅ Performance & Accessibility (Lighthouse targets, WCAG 2.1 AA)
- ✅ Technology Stack Compliance (all choices constitution-aligned)

**No violations. No complexity tracking needed.**

### 📊 Planning Metrics

- **Specification**: 286 lines, 9 user stories, 65 functional requirements, 19 success criteria
- **Scope**: ~35 new files, 4 new models, 6 new API endpoints, 15+ new test files
- **Technology Decisions**: 100% resolved (0 NEEDS CLARIFICATION)
- **Constitution Compliance**: 100% (7/7 principles passing)
- **Planning Duration**: Single session
- **Ready for**: `/speckit.tasks` command to generate implementation task breakdown

---

## Next Steps

### Immediate: Generate Implementation Tasks

Run `/speckit.tasks` to break down the implementation into TDD-based tasks:

```bash
# This will generate:
specs/002-website-auth-structure/tasks.md
```

### Implementation Workflow (After Tasks Generated)

1. **Red**: Write failing tests for each task
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code quality while keeping tests green
4. **Repeat**: Move to next task

### Recommended Task Order (Suggested)

1. **Phase 1**: Database models and validation
   - User model with bcrypt hashing
   - PasswordResetToken model
   - FAQItem model
   - Entry/Settings updates

2. **Phase 2**: Authentication infrastructure
   - NextAuth configuration
   - Credentials provider (email/password)
   - Google OAuth provider
   - Middleware for route protection

3. **Phase 3**: API endpoints
   - Registration endpoint
   - Password reset endpoints
   - FAQ endpoint

4. **Phase 4**: UI components (atoms → molecules → organisms)
   - Atoms: Link, Logo
   - Molecules: NavLink, FAQItem, SearchBar
   - Organisms: Navbar, LoginForm, RegisterForm, FAQList, Hero

5. **Phase 5**: Pages
   - Homepage
   - Login/Register pages
   - FAQ page
   - Password reset pages

6. **Phase 6**: SEO implementation
   - Meta tags
   - Sitemap generation
   - Structured data
   - robots.txt

7. **Phase 7**: Integration testing
   - Auth flows
   - Protected routes
   - FAQ search
   - E2E tests

### Success Criteria Verification

Before marking feature complete, verify all 19 success criteria from spec.md:
- [ ] SC-001: Homepage loads <2s
- [ ] SC-002: Login <10s
- [ ] SC-003: Registration <60s
- [ ] SC-004: FAQ loads <2s
- [ ] SC-005: FAQ search <500ms
- [ ] SC-006: LCP <2.5s
- [ ] SC-007: Public navigation functional
- [ ] SC-008: WCAG 2.1 AA compliant
- [ ] SC-009: Registration validation working
- [ ] SC-010: Login authentication working
- [ ] SC-011: Session persistence working
- [ ] SC-012: Password reset working
- [ ] SC-013: Protected routes enforced
- [ ] SC-014: User data isolation verified
- [ ] SC-015: Rate limiting enforced
- [ ] SC-016: Mobile responsive
- [ ] SC-017: FAQ search functional
- [ ] SC-018: FAQ page performance
- [ ] SC-019: SEO Lighthouse >90

---

**Planning Complete** ✅  
**Status**: Ready for task generation (`/speckit.tasks`)  
**Branch**: `002-website-auth-structure`  
**Date**: 2025-01-XX

