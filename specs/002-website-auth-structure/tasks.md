# Tasks: Website Structure & Authentication

**Input**: Design documents from `/specs/002-website-auth-structure/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Included (TDD is mandatory per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Project Type**: Single project (Next.js App Router)
- **Paths**: `src/`, `tests/` at repository root
- **Components**: `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/`
- **Pages**: `src/app/` (Next.js App Router convention)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure authentication infrastructure

- [ ] T001 Install NextAuth.js v5 and bcrypt dependencies via npm
- [ ] T002 Generate NextAuth secret key and document in .env.local.example
- [ ] T003 [P] Configure Google OAuth credentials (client ID and secret) in Google Cloud Console
- [ ] T004 [P] Create environment variables documentation in quickstart.md for NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models & Validation

- [ ] T005 [P] Create User model with Mongoose schema in src/lib/models/User.js (email, password, authMethod, googleId, name, picture, rememberMe, registrationDate, lastLogin, isActive, timestamps)
- [ ] T006 [P] Create PasswordResetToken model in src/lib/models/PasswordResetToken.js (token, userId, expiresAt, used, usedAt, createdAt with TTL index)
- [ ] T007 [P] Create FAQItem model in src/lib/models/FAQItem.js (question, answer, category, order, keywords, isPublished, timestamps)
- [ ] T008 [P] Update Entry model in src/lib/models/Entry.js to add userId field and compound index
- [ ] T009 [P] Update Settings model in src/lib/models/Settings.js to add userId field with unique constraint
- [ ] T010 [P] Create auth validation schema in src/lib/validation/authSchema.js (register, login, forgot-password, reset-password)
- [ ] T011 [P] Create FAQ validation schema in src/lib/validation/faqSchema.js (search query validation)

### Unit Tests for Models & Validation

- [ ] T012 [P] Write User model tests in tests/unit/lib/models/User.test.js (schema validation, methods: comparePassword, updateLastLogin, hashPassword, findByEmail)
- [ ] T013 [P] Write PasswordResetToken model tests in tests/unit/lib/models/PasswordResetToken.test.js (generateToken, validateToken, markAsUsed, TTL expiration)
- [ ] T014 [P] Write FAQItem model tests in tests/unit/lib/models/FAQItem.test.js (schema validation, searchFAQs, getByCategory)
- [ ] T015 [P] Write auth validation schema tests in tests/unit/validation/authSchema.test.js (email format, password strength, confirmPassword match)
- [ ] T016 [P] Write FAQ validation schema tests in tests/unit/validation/faqSchema.test.js (search query validation)

### Utility Functions

- [ ] T017 [P] Create password utility in src/lib/utils/password.js (hashPassword with bcrypt 10 rounds, comparePassword)
- [ ] T018 [P] Create token utility in src/lib/utils/token.js (generateSecureToken using crypto.randomBytes(32))
- [ ] T019 [P] Create email utility in src/lib/utils/email.js (sendWelcomeEmail, sendPasswordResetEmail placeholders)
- [ ] T020 [P] Write password utility tests in tests/unit/lib/utils/password.test.js (hashing, comparison, bcrypt rounds)
- [ ] T021 [P] Write token utility tests in tests/unit/lib/utils/token.test.js (token length, uniqueness, randomness)
- [ ] T022 [P] Write email utility tests in tests/unit/lib/utils/email.test.js (email formatting, template rendering)

### NextAuth Configuration

- [ ] T023 Create NextAuth configuration in src/lib/auth.js (configure Credentials provider, Google provider, JWT strategy, callbacks)
- [ ] T024 Create NextAuth API route handler in src/app/api/auth/[...nextauth]/route.js
- [ ] T025 Create middleware for route protection in src/middleware.js (protect /entries, /settings, redirect logic)
- [ ] T026 Write integration tests for NextAuth configuration in tests/integration/auth-config.test.js (providers configured, callbacks working)
- [ ] T027 Write integration tests for middleware in tests/integration/protected-routes.test.js (redirects work, protected routes blocked)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Public Homepage Access (Priority: P1) 🎯 MVP

**Goal**: Create professional marketing homepage accessible to all visitors with navigation and CTAs

**Independent Test**: Navigate to root URL without authentication and verify marketing content, navigation menu (Home, Features, FAQ, Sign Up, Log In), and hero section are visible

### UI Components for Homepage

- [ ] T028 [P] [US1] Create Logo atom component in src/components/atoms/Logo.js
- [ ] T029 [P] [US1] Create Link atom component in src/components/atoms/Link.js (styled Next.js Link wrapper)
- [ ] T030 [P] [US1] Create NavLink molecule in src/components/molecules/NavLink.js (navigation link with active state)
- [ ] T031 [US1] Create Navbar organism in src/components/organisms/Navbar.js (public variant with Home, Features, FAQ, Sign Up, Log In)
- [ ] T032 [US1] Create Footer organism in src/components/organisms/Footer.js (copyright, links, social)
- [ ] T033 [US1] Create Hero organism in src/components/organisms/Hero.js (hero section with headline, subheadline, CTA buttons)
- [ ] T034 [US1] Create FeaturesList organism in src/components/organisms/FeaturesList.js (grid of feature cards)

### Component Tests for Homepage

- [ ] T035 [P] [US1] Write Logo component tests in tests/components/atoms/Logo.test.js (renders correctly, accessible)
- [ ] T036 [P] [US1] Write Link component tests in tests/components/atoms/Link.test.js (Next.js Link integration, styling)
- [ ] T037 [P] [US1] Write NavLink component tests in tests/components/molecules/NavLink.test.js (active state, hover, accessibility)
- [ ] T038 [US1] Write Navbar component tests in tests/components/organisms/Navbar.test.js (public menu items, mobile hamburger, responsive)
- [ ] T039 [US1] Write Footer component tests in tests/components/organisms/Footer.test.js (links render, copyright, accessibility)
- [ ] T040 [US1] Write Hero component tests in tests/components/organisms/Hero.test.js (headline, CTA buttons, responsive)
- [ ] T041 [US1] Write FeaturesList component tests in tests/components/organisms/FeaturesList.test.js (features render, grid layout)

### Homepage Page Implementation

- [ ] T042 [US1] Create homepage in src/app/page.js (use Hero, FeaturesList, server component with SSR)
- [ ] T043 [US1] Create root layout in src/app/layout.js (Navbar, Footer, global metadata)
- [ ] T044 [US1] Add homepage metadata in src/app/page.js (title, description, Open Graph, Twitter Cards)
- [ ] T045 [US1] Write homepage page tests in tests/pages/home.test.js (renders all sections, CTA links work, SEO metadata present)

### E2E Tests for Homepage

- [ ] T046 [US1] Write E2E homepage test in tests/e2e/homepage.spec.js (navigation works, CTAs redirect, responsive on mobile/desktop)

**Checkpoint**: User Story 1 complete - Homepage is fully functional and testable independently

---

## Phase 4: User Story 2 - Email/Password Registration (Priority: P1)

**Goal**: Enable users to create accounts with email/password, with validation and automatic login

**Independent Test**: Access /register, submit valid credentials, verify account creation and redirect to /entries

### API Endpoint for Registration

- [ ] T047 [P] [US2] Create registration API route in src/app/api/auth/register/route.js (validate input, hash password, create user, return success/error)
- [ ] T048 [US2] Write integration tests for registration API in tests/integration/auth.test.js (valid registration, duplicate email, weak password, validation errors)

### UI Components for Registration

- [ ] T049 [P] [US2] Create RegisterForm organism in src/components/organisms/RegisterForm.js (email, password, confirmPassword, name fields, React Hook Form, validation, submit)
- [ ] T050 [US2] Write RegisterForm component tests in tests/components/organisms/RegisterForm.test.js (renders fields, validation, submit success, error display, password strength)

### Registration Page Implementation

- [ ] T051 [US2] Create registration page in src/app/(auth)/register/page.js (use RegisterForm, handle success/error, redirect after success)
- [ ] T052 [US2] Create auth layout in src/app/(auth)/layout.js (centered layout, minimal design for auth pages)
- [ ] T053 [US2] Add registration page metadata in src/app/(auth)/register/page.js (title, description, noindex for SEO)
- [ ] T054 [US2] Write registration page tests in tests/pages/register.test.js (form renders, submission works, redirects on success, errors display)

### E2E Tests for Registration

- [ ] T055 [US2] Write E2E registration test in tests/e2e/auth-flows.spec.js (complete registration flow, duplicate email handling, password validation)

**Checkpoint**: User Story 2 complete - Registration is fully functional and testable independently

---

## Phase 5: User Story 3 - Email/Password Login (Priority: P1)

**Goal**: Enable users to log in with email/password, with session management and "remember me"

**Independent Test**: Create account, log out, log back in with same credentials, verify access to /entries

### UI Components for Login

- [ ] T056 [P] [US3] Create LoginForm organism in src/components/organisms/LoginForm.js (email, password, rememberMe checkbox, Google OAuth button, React Hook Form, submit)
- [ ] T057 [US3] Write LoginForm component tests in tests/components/organisms/LoginForm.test.js (renders fields, checkbox, OAuth button, submit, error display)

### Login Page Implementation

- [ ] T058 [US3] Create login page in src/app/(auth)/login/page.js (use LoginForm, handle NextAuth signIn, redirect after success, forgot password link)
- [ ] T059 [US3] Add login page metadata in src/app/(auth)/login/page.js (title, description, noindex)
- [ ] T060 [US3] Write login page tests in tests/pages/login.test.js (form renders, submission works, redirects on success, errors display, forgot password link)

### Session Management Tests

- [ ] T061 [US3] Write integration tests for session management in tests/integration/auth.test.js (login creates session, logout destroys session, remember me extends session, session expiration)

### E2E Tests for Login

- [ ] T062 [US3] Write E2E login test in tests/e2e/auth-flows.spec.js (login flow, incorrect credentials, remember me, logout)

**Checkpoint**: User Story 3 complete - Login is fully functional and testable independently

---

## Phase 6: User Story 4 - Google OAuth Login (Priority: P2)

**Goal**: Enable users to sign up/log in using Google OAuth for seamless authentication

**Independent Test**: Click "Sign in with Google", complete OAuth flow, verify account creation/login and redirect to /entries

### Google OAuth Configuration

- [ ] T063 [US4] Verify Google OAuth provider configuration in src/lib/auth.js (credentials, scopes, profile callback)
- [ ] T064 [US4] Add OAuth error handling in src/app/(auth)/login/page.js (handle OAuth failures, display error messages)

### OAuth Flow Tests

- [ ] T065 [US4] Write integration tests for Google OAuth in tests/integration/auth.test.js (OAuth account creation, OAuth login, profile data retrieval, OAuth errors)

### E2E Tests for Google OAuth

- [ ] T066 [US4] Write E2E OAuth test in tests/e2e/auth-flows.spec.js (Google OAuth flow simulation, account creation, login)

**Checkpoint**: User Story 4 complete - Google OAuth is fully functional and testable independently

---

## Phase 7: User Story 5 - Protected Dashboard Access (Priority: P1)

**Goal**: Enable logged-in users to access entries and settings with user-specific navigation

**Independent Test**: Log in and verify access to /entries and /settings with navigation menu showing "My Entries", "Settings", profile icon, "Log Out"

### Update Navigation for Authenticated Users

- [ ] T067 [US5] Update Navbar organism in src/components/organisms/Navbar.js (add protected variant with My Entries, Settings, profile icon, Log Out)
- [ ] T068 [US5] Write Navbar tests for protected variant in tests/components/organisms/Navbar.test.js (authenticated menu items, profile icon, logout button)

### Update Existing Entry and Settings Pages

- [ ] T069 [US5] Update entries page in src/app/(protected)/entries/page.js (filter entries by userId from session)
- [ ] T070 [US5] Update settings page in src/app/(protected)/settings/page.js (filter settings by userId from session)
- [ ] T071 [US5] Create protected layout in src/app/(protected)/layout.js (use authenticated Navbar, require authentication)
- [ ] T072 [US5] Write integration tests for protected routes in tests/integration/protected-routes.test.js (redirect unauthenticated users, allow authenticated access, data isolation)

### Update API Routes for User Data Isolation

- [ ] T073 [US5] Update entries API route in src/app/api/entries/route.js (filter GET/POST by userId from session)
- [ ] T074 [US5] Update settings API route in src/app/api/settings/route.js (filter GET/PUT by userId from session)
- [ ] T075 [US5] Write integration tests for API user isolation in tests/integration/entries.test.js and tests/integration/settings.test.js (verify user can only access own data)

### E2E Tests for Protected Access

- [ ] T076 [US5] Write E2E protected access test in tests/e2e/protected-access.spec.js (redirect to login when unauthenticated, access granted when authenticated, logout works)

**Checkpoint**: User Story 5 complete - Protected routes and user data isolation fully functional

---

## Phase 8: User Story 6 - Password Reset Flow (Priority: P2)

**Goal**: Enable users to reset forgotten passwords via email link

**Independent Test**: Request password reset, receive email with link, set new password, log in with new credentials

### API Endpoints for Password Reset

- [ ] T077 [P] [US6] Create forgot-password API route in src/app/api/auth/forgot-password/route.js (validate email, generate token, send email, return success)
- [ ] T078 [P] [US6] Create reset-password API route in src/app/api/auth/reset-password/route.js (validate token, update password, mark token as used, return success)
- [ ] T079 [US6] Write integration tests for password reset APIs in tests/integration/auth.test.js (forgot password, reset password, token expiration, token reuse prevention)

### UI Components for Password Reset

- [ ] T080 [P] [US6] Create ForgotPasswordForm organism in src/components/organisms/ForgotPasswordForm.js (email field, submit)
- [ ] T081 [P] [US6] Create ResetPasswordForm organism in src/components/organisms/ResetPasswordForm.js (newPassword field, submit, token validation)
- [ ] T082 [US6] Write ForgotPasswordForm tests in tests/components/organisms/ForgotPasswordForm.test.js (renders, submits, success/error display)
- [ ] T083 [US6] Write ResetPasswordForm tests in tests/components/organisms/ResetPasswordForm.test.js (renders, password validation, submit, token errors)

### Password Reset Pages

- [ ] T084 [US6] Create forgot-password page in src/app/(auth)/forgot-password/page.js (use ForgotPasswordForm, handle submission)
- [ ] T085 [US6] Create reset-password page in src/app/(auth)/reset-password/page.js (use ResetPasswordForm, extract token from URL, handle submission)
- [ ] T086 [US6] Write forgot-password page tests in tests/pages/forgot-password.test.js (form renders, submission works, success message)
- [ ] T087 [US6] Write reset-password page tests in tests/pages/reset-password.test.js (form renders, token validation, password update, invalid token handling)

### E2E Tests for Password Reset

- [ ] T088 [US6] Write E2E password reset test in tests/e2e/auth-flows.spec.js (complete reset flow, email link click, new password login)

**Checkpoint**: User Story 6 complete - Password reset fully functional and testable independently

---

## Phase 9: User Story 7 - Modern Apple-Inspired Design (Priority: P3)

**Goal**: Apply clean, modern design with minimalist layouts, elegant typography, smooth animations

**Independent Test**: Visual review and user feedback on design quality, professional appearance, ease of navigation

### Global Styling

- [ ] T089 [P] [US7] Update global CSS in src/app/globals.css (Apple-inspired color palette, typography, spacing, button styles)
- [ ] T090 [P] [US7] Configure Tailwind CSS theme in tailwind.config.js (custom colors, fonts, animations, transitions)
- [ ] T091 [US7] Add smooth transitions and animations to all interactive elements (buttons, links, forms, menu expansions)
- [ ] T092 [US7] Ensure responsive design across all breakpoints (mobile 320px, tablet 768px, desktop 1024px+)

### Design Consistency Review

- [ ] T093 [US7] Review and update all components for design consistency (typography, spacing, colors, button styles match)
- [ ] T094 [US7] Add loading states with smooth animations for all forms (login, register, password reset, entries, settings)
- [ ] T095 [US7] Add error states with elegant error messages and fade-in animations

### Visual Testing

- [ ] T096 [US7] Perform manual visual testing on all pages (homepage, FAQ, auth pages, entries, settings)
- [ ] T097 [US7] Test responsive design on mobile, tablet, desktop devices
- [ ] T098 [US7] Verify accessibility (color contrast, focus indicators, keyboard navigation)

**Checkpoint**: User Story 7 complete - Modern design applied consistently across all pages

---

## Phase 10: User Story 8 - FAQ Page (Priority: P3)

**Goal**: Create public FAQ page with categories, expandable Q&A, and search functionality

**Independent Test**: Navigate to /faq and verify questions organized by category, search filters results, expandable items work

### UI Components for FAQ

- [ ] T099 [P] [US8] Create SearchBar molecule in src/components/molecules/SearchBar.js (input with search icon, onChange callback)
- [ ] T100 [P] [US8] Create FAQItem molecule in src/components/molecules/FAQItem.js (expandable question/answer with smooth animation)
- [ ] T101 [US8] Create FAQList organism in src/components/organisms/FAQList.js (search bar, filtered list, category sections, no results message)
- [ ] T102 [US8] Write SearchBar tests in tests/components/molecules/SearchBar.test.js (renders, onChange fires, accessible)
- [ ] T103 [US8] Write FAQItem tests in tests/components/molecules/FAQItem.test.js (expands/collapses, animation, keyboard navigation)
- [ ] T104 [US8] Write FAQList tests in tests/components/organisms/FAQList.test.js (search filters, categories render, no results message)

### FAQ API Endpoint

- [ ] T105 [P] [US8] Create FAQ API route in src/app/api/faq/route.js (GET with optional search query, category filter, return published FAQs)
- [ ] T106 [US8] Write integration tests for FAQ API in tests/integration/faq.test.js (retrieve all FAQs, search filtering, category filtering)

### FAQ Page Implementation

- [ ] T107 [US8] Create FAQ page in src/app/faq/page.js (use FAQList, fetch FAQs server-side, SEO metadata)
- [ ] T108 [US8] Add FAQ page metadata in src/app/faq/page.js (title, description, Open Graph, keywords)
- [ ] T109 [US8] Seed initial FAQ data in database (create seed script or manual entries for Getting Started, Fasting, Account, Technical)
- [ ] T110 [US8] Write FAQ page tests in tests/pages/faq.test.js (renders questions, search works, categories display, CTA present)

### E2E Tests for FAQ

- [ ] T111 [US8] Write E2E FAQ test in tests/e2e/faq.spec.js (search functionality, expand/collapse, navigation, performance <2s load)

**Checkpoint**: User Story 8 complete - FAQ page fully functional with search and categories

---

## Phase 11: User Story 9 - SEO Optimization & URL Structure (Priority: P2)

**Goal**: Implement comprehensive SEO with meta tags, structured data, sitemap, robots.txt

**Independent Test**: Run Lighthouse SEO audit (score >90), examine page source for meta tags, verify URLs are unique and descriptive

### SEO Infrastructure

- [ ] T112 [P] [US9] Create robots.txt in public/robots.txt (allow public pages, disallow protected pages)
- [ ] T113 [P] [US9] Create sitemap.xml route in src/app/sitemap.xml/route.js (generate sitemap with /, /faq, /login, /register)
- [ ] T114 [P] [US9] Add canonical URLs to all pages (via metadata export)
- [ ] T115 [P] [US9] Add structured data (JSON-LD) to homepage in src/app/page.js (WebSite, Organization schema)

### Meta Tags for All Pages

- [ ] T116 [US9] Update homepage metadata in src/app/page.js (unique title, description, Open Graph, Twitter Cards)
- [ ] T117 [US9] Add FAQ metadata in src/app/faq/page.js (unique title, description, keywords)
- [ ] T118 [US9] Add login metadata in src/app/(auth)/login/page.js (title, description, noindex)
- [ ] T119 [US9] Add register metadata in src/app/(auth)/register/page.js (title, description, noindex)
- [ ] T120 [US9] Add entries metadata in src/app/(protected)/entries/page.js (title, description, noindex)
- [ ] T121 [US9] Add settings metadata in src/app/(protected)/settings/page.js (title, description, noindex)

### SEO Testing

- [ ] T122 [US9] Run Lighthouse SEO audit on all public pages (homepage, FAQ) and verify score >90
- [ ] T123 [US9] Test social media sharing previews (Open Graph validation) on Facebook, Twitter, LinkedIn
- [ ] T124 [US9] Verify server-side rendering for public pages (view page source, ensure content visible without JS)
- [ ] T125 [US9] Test URL redirects (unauthenticated → login, authenticated → entries, preserve destination URL)
- [ ] T126 [US9] Write integration tests for SEO in tests/integration/seo.test.js (meta tags present, canonical URLs, structured data, sitemap accessible)

**Checkpoint**: User Story 9 complete - SEO optimization fully implemented and tested

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, security hardening, performance optimization

### Security Hardening

- [ ] T127 [P] Implement rate limiting on login endpoint (max 5 attempts per 15 minutes per IP) in src/app/api/auth/[...nextauth]/route.js
- [ ] T128 [P] Verify CSRF protection enabled for all authentication forms
- [ ] T129 [P] Verify password hashing uses bcrypt with minimum 10 rounds
- [ ] T130 [P] Verify session cookies are HttpOnly, Secure, SameSite=Strict
- [ ] T131 Perform security review of all authentication endpoints (no user enumeration, secure token generation, proper error messages)

### Performance Optimization

- [ ] T132 [P] Optimize image loading (use next/image for all images)
- [ ] T133 [P] Add caching headers for static assets
- [ ] T134 Verify homepage loads <2 seconds (run Lighthouse performance audit)
- [ ] T135 Verify FAQ page loads <2 seconds and search <500ms (performance testing)
- [ ] T136 Add database indexes (userId on entries/settings, email on users, token on passwordResetTokens)

### Accessibility Review

- [ ] T137 [P] Verify WCAG 2.1 AA compliance on all pages (run axe DevTools audit)
- [ ] T138 [P] Test keyboard navigation on all interactive elements
- [ ] T139 [P] Verify screen reader compatibility (test with NVDA or JAWS)
- [ ] T140 Verify color contrast ratios meet 4.5:1 minimum (use contrast checker)

### Documentation & Deployment

- [ ] T141 [P] Update README.md with setup instructions, environment variables, deployment steps
- [ ] T142 [P] Update quickstart.md with actual implementation details and testing commands
- [ ] T143 [P] Create migration guide for existing users (how to link accounts to new auth system)
- [ ] T144 Validate quickstart.md instructions (follow guide end-to-end, verify all steps work)
- [ ] T145 Run full test suite and verify 80%+ code coverage (npm run test:coverage)

### Final E2E Testing

- [ ] T146 Run complete E2E test suite (all auth flows, protected access, FAQ, homepage)
- [ ] T147 Perform manual end-to-end testing of all user stories (registration → login → entries → settings → logout)
- [ ] T148 Test error scenarios (network failures, invalid inputs, expired sessions)
- [ ] T149 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T150 Test on multiple devices (mobile phone, tablet, desktop)

**Checkpoint**: All polish tasks complete - feature ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US2 (P1) → US3 (P1) → US5 (P1) → US6 (P2) → US4 (P2) → US9 (P2) → US7 (P3) → US8 (P3)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 - Homepage (P1)**: Can start after Foundational - No dependencies on other stories
- **US2 - Registration (P1)**: Can start after Foundational - No dependencies on other stories
- **US3 - Login (P1)**: Can start after Foundational - No dependencies on other stories
- **US4 - Google OAuth (P2)**: Can start after Foundational - No dependencies (integrates with US2/US3 but independently testable)
- **US5 - Protected Access (P1)**: Can start after Foundational - Integrates with US2/US3 but independently testable
- **US6 - Password Reset (P2)**: Can start after Foundational - No dependencies on other stories
- **US7 - Design (P3)**: Can start after Foundational - Applies to all stories (best done incrementally or after core functionality complete)
- **US8 - FAQ (P3)**: Can start after Foundational - No dependencies on other stories
- **US9 - SEO (P2)**: Can start after US1 (homepage) - Applies to all public pages

### Within Each User Story

Following TDD (constitution requirement):
1. Write tests FIRST - ensure they FAIL
2. Implement models (if needed)
3. Implement services/utilities (if needed)
4. Implement endpoints/pages
5. Verify tests PASS
6. Refactor if needed
7. Story complete before moving to next priority

### Parallel Opportunities

#### Setup Phase (All can run in parallel)
- T001, T002, T003, T004 (dependency installation, configuration)

#### Foundational Phase (Within groups)
- **Models**: T005, T006, T007, T008, T009 (all can run in parallel)
- **Validation**: T010, T011 (can run in parallel)
- **Model Tests**: T012, T013, T014, T015, T016 (all can run in parallel)
- **Utilities**: T017, T018, T019 (can run in parallel)
- **Utility Tests**: T020, T021, T022 (can run in parallel)

#### User Stories (If team has capacity)
- US1, US2, US3, US4, US6, US8 can all start in parallel after Foundational phase
- US5 should start after US2 and US3 (needs authentication working)
- US7 best done incrementally or after core stories
- US9 should start after US1 (needs homepage)

#### Within User Stories
- Component creation tasks marked [P] can run in parallel
- Component test tasks marked [P] can run in parallel
- API endpoint tasks marked [P] can run in parallel

### Recommended MVP Scope

**Minimum Viable Product** (quickest path to value):
1. **Phase 1: Setup** (T001-T004)
2. **Phase 2: Foundational** (T005-T027)
3. **Phase 3: User Story 1 - Homepage** (T028-T046)
4. **Phase 4: User Story 2 - Registration** (T047-T055)
5. **Phase 5: User Story 3 - Login** (T056-T062)
6. **Phase 7: User Story 5 - Protected Access** (T067-T076)
7. **Phase 12: Polish (minimal)** (T127-T131 security, T145 testing)

**Total MVP Tasks**: ~90 tasks  
**After MVP**: Add remaining stories in priority order (US6 → US9 → US4 → US8 → US7)

---

## Parallel Example: User Story 1 (Homepage)

```bash
# All component atoms/molecules can be built in parallel:
T028 [P] [US1] Create Logo atom
T029 [P] [US1] Create Link atom
T030 [P] [US1] Create NavLink molecule

# Then organisms (depend on atoms/molecules):
T031 [US1] Create Navbar organism (needs Logo, Link, NavLink)
T032 [US1] Create Footer organism (needs Link)
T033 [US1] Create Hero organism (needs Link for CTA)
T034 [US1] Create FeaturesList organism

# All component tests can run in parallel:
T035 [P] [US1] Test Logo
T036 [P] [US1] Test Link
T037 [P] [US1] Test NavLink

# Then organism tests:
T038 [US1] Test Navbar
T039 [US1] Test Footer
T040 [US1] Test Hero
T041 [US1] Test FeaturesList

# Finally page implementation:
T042 [US1] Create homepage (uses all organisms)
T043 [US1] Create root layout
T044 [US1] Add metadata
T045 [US1] Test homepage

# E2E test last:
T046 [US1] E2E homepage test
```

---

## Implementation Notes

### TDD Workflow (Mandatory)

Per project constitution, Test-Driven Development is **NON-NEGOTIABLE**:

1. **Red**: Write test first, run it, watch it fail
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Repeat**: Move to next test/task

### Code Quality Requirements

- **Test Coverage**: Minimum 80% (constitution requirement)
- **Accessibility**: WCAG 2.1 AA compliance (constitution requirement)
- **Performance**: Lighthouse scores >90 (constitution requirement)
- **Security**: OWASP best practices, bcrypt password hashing, secure tokens
- **Component Architecture**: Atomic design (atoms → molecules → organisms)
- **Mobile-First**: Design for mobile, enhance for desktop

### Success Verification

Before marking feature complete, verify all 19 success criteria from spec.md:
- [ ] SC-001: Registration <60s
- [ ] SC-002: Login <10s
- [ ] SC-003: 90% first-login success rate
- [ ] SC-004: Google OAuth <15s
- [ ] SC-005: Password reset <3min
- [ ] SC-006: Homepage <2s load
- [ ] SC-007: Responsive 320px-2560px
- [ ] SC-008: WCAG 2.1 AA compliance
- [ ] SC-009: 95% auth operations successful
- [ ] SC-010: Zero data isolation breaches
- [ ] SC-011: 99.9% session security
- [ ] SC-012: 80% positive design feedback
- [ ] SC-013: Lighthouse SEO >90
- [ ] SC-014: Indexed in 7 days
- [ ] SC-015: URLs bookmarkable
- [ ] SC-016: Social previews correct
- [ ] SC-017: Browser navigation works
- [ ] SC-018: FAQ <2s load
- [ ] SC-019: FAQ search <500ms

---

**Total Tasks**: 150  
**Estimated MVP**: ~90 tasks (Phases 1-2, US1, US2, US3, US5, minimal Polish)  
**Generated**: 2025-01-XX  
**Ready for**: Implementation via TDD workflow
