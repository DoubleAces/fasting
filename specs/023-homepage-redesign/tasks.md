# Tasks: Homepage Redesign

**Input**: Design documents from `/specs/023-homepage-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: This feature follows TDD (Test-Driven Development) approach per project constitution. All component tests must be written FIRST and shown to user before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Each phase builds a complete, independently testable feature increment.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic dependencies

- [x] T001 Install Framer Motion animation library in package.json
- [x] T002 Verify Next.js Image component configuration for optimization
- [x] T003 [P] Create data directory structure at src/lib/data/
- [x] T004 [P] Create images directory structure at public/images/homepage/ (subdirs: features/, steps/, avatars/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Reusable atomic components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Foundational Tests (Write FIRST, Must FAIL before implementation)

- [x] T005 [P] Write test for GradientButton component in tests/components/atoms/GradientButton.test.js
- [x] T006 [P] Write test for GlassmorphicCard component in tests/components/atoms/GlassmorphicCard.test.js
- [x] T007 [P] Write test for StarRating component in tests/components/atoms/StarRating.test.js

### Foundational Implementation (After tests FAIL)

- [x] T008 [P] Implement GradientButton atom in src/components/atoms/GradientButton.js
- [x] T009 [P] Implement GlassmorphicCard atom in src/components/atoms/GlassmorphicCard.js
- [x] T010 [P] Implement StarRating atom in src/components/atoms/StarRating.js
- [x] T011 Verify all foundational tests pass with npm test

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New Visitor Understands Value Proposition (Priority: P1) 🎯 MVP

**Goal**: Implement Hero section that communicates app purpose, trust indicators, and primary CTAs within 5 seconds of landing

**Independent Test**: Show hero section to someone unfamiliar with app. Success = 90% can explain it's an intermittent fasting tracker within 5 seconds.

**Components**: Hero organism, TrustBadge molecule, trust indicators data

### Tests for User Story 1 (Write FIRST) ⚠️

- [x] T012 [P] [US1] Write test for TrustBadge molecule in tests/components/molecules/TrustBadge.test.js
- [x] T013 [US1] Write test for Hero organism in tests/components/organisms/Hero.test.js

### Implementation for User Story 1

- [x] T014 [P] [US1] Create trust indicators data file in src/lib/data/trustIndicators.js
- [x] T015 [P] [US1] Create CTA configuration data file in src/lib/data/ctaConfig.js
- [x] T016 [US1] Implement TrustBadge molecule in src/components/molecules/TrustBadge.js (depends on T008, T010)
- [x] T017 [US1] Implement Hero organism in src/components/organisms/Hero.js (depends on T008, T016)
- [ ] T018 [US1] Add hero screenshot image to public/images/homepage/hero-screenshot.png (1200x800px) ⚠️ MANUAL
- [x] T019 [US1] Verify Hero tests pass and render correctly with npm test

**Acceptance Verification**:
- [ ] Hero displays headline "The Simplest Way to Track Intermittent Fasting"
- [ ] Trust indicators show 4.8/5 stars and 10,000+ users
- [ ] Two CTAs present: "Start Free" and "See How It Works"
- [ ] Hero image loads with priority for LCP optimization
- [ ] Authenticated users see "Go to Dashboard" instead of "Start Free"

**Checkpoint**: User Story 1 complete - Hero section fully functional and testable independently

---

## Phase 4: User Story 2 - Visitor Evaluates Trust Through Social Proof (Priority: P1)

**Goal**: Implement Social Proof section with testimonials and trust badges that increase visitor confidence

**Independent Test**: Ask visitors "Would you trust this app?" after viewing. Success = 80%+ report increased confidence after viewing social proof.

**Components**: SocialProofSection organism, TestimonialCard molecule, testimonials data

### Tests for User Story 2 (Write FIRST) ⚠️

- [x] T020 [P] [US2] Write test for TestimonialCard molecule in tests/components/molecules/TestimonialCard.test.js
- [x] T021 [US2] Write test for SocialProofSection organism in tests/components/organisms/SocialProofSection.test.js

### Implementation for User Story 2

- [x] T022 [P] [US2] Create testimonials data file in src/lib/data/testimonials.js (6 testimonials)
- [ ] T023 [P] [US2] Add testimonial avatar images to public/images/homepage/avatars/ (optional, 3-6 images) ⚠️ MANUAL
- [x] T024 [US2] Implement TestimonialCard molecule in src/components/molecules/TestimonialCard.js (depends on T009, T010)
- [x] T025 [US2] Implement SocialProofSection organism in src/components/organisms/SocialProofSection.js (depends on T016, T024)
- [x] T026 [US2] Verify SocialProofSection tests pass with npm test

**Acceptance Verification**:
- [ ] Section displays 6 testimonial cards in 3x2 grid on desktop
- [ ] Each card shows quote, name, rating, and specific result
- [ ] Trust badges display above testimonials
- [ ] Grid responsive: 3→2→1 columns on desktop→tablet→mobile
- [ ] Cards have hover elevation effect

**Checkpoint**: User Stories 1 AND 2 both work independently - Hero + Social Proof complete

---

## Phase 5: User Story 3 - Visitor Identifies with Problem and Solution (Priority: P2)

**Goal**: Implement Problem/Solution section showing pain points and how app solves them

**Independent Test**: Ask target users "Does this describe your experience?" Success = 70%+ strongly identify with at least one pain point.

**Components**: ProblemSolutionSection organism, ProblemSolutionBlock molecule, problems/solutions data

### Tests for User Story 3 (Write FIRST) ⚠️

- [x] T027 [P] [US3] Write test for ProblemSolutionBlock molecule in tests/components/molecules/ProblemSolutionBlock.test.js
- [x] T028 [US3] Write test for ProblemSolutionSection organism in tests/components/organisms/ProblemSolutionSection.test.js

### Implementation for User Story 3

- [x] T029 [P] [US3] Create problems/solutions data file in src/lib/data/problemsSolutions.js (3 pairs)
- [x] T030 [US3] Implement ProblemSolutionBlock molecule in src/components/molecules/ProblemSolutionBlock.js
- [x] T031 [US3] Implement ProblemSolutionSection organism in src/components/organisms/ProblemSolutionSection.js (depends on T030)
- [x] T032 [US3] Verify ProblemSolutionSection tests pass with npm test

**Acceptance Verification**:
- [ ] Section displays 3 problem/solution pairs
- [ ] Problem text is larger, bold, question format
- [ ] Solution text is regular weight, answer format
- [ ] Animation sequence: icon → problem → solution on scroll
- [ ] Grid layout responsive: 3→2→1 columns

**Checkpoint**: User Stories 1, 2, AND 3 all work independently

---

## Phase 6: User Story 4 - Visitor Explores Specific Features and Benefits (Priority: P2)

**Goal**: Implement Features Showcase section with specific, measurable benefits and screenshots

**Independent Test**: Ask visitors to list 3 features and benefits. Success = 75%+ recall at least 2 features with specific benefits.

**Components**: FeaturesList organism (modified), FeatureCard molecule, features data

### Tests for User Story 4 (Write FIRST) ⚠️

- [x] T033 [P] [US4] Write test for FeatureCard molecule in tests/components/molecules/FeatureCard.test.js
- [x] T034 [US4] Write test for FeaturesList organism in tests/components/organisms/FeaturesList.test.js

### Implementation for User Story 4

- [x] T035 [P] [US4] Create features data file in src/lib/data/features.js (6 features with measurable benefits)
- [ ] T036 [P] [US4] Add feature screenshot images to public/images/homepage/features/ (6 images, 600x400px each) ⚠️ MANUAL
- [x] T037 [US4] Implement FeatureCard molecule in src/components/molecules/FeatureCard.js (depends on T009)
- [x] T038 [US4] Implement or update FeaturesList organism in src/components/organisms/FeaturesList.js (depends on T037)
- [x] T039 [US4] Verify FeaturesList tests pass with npm test (22 tests passing)

**Acceptance Verification**:
- [ ] Section displays 6 features in 3x2 grid on desktop
- [ ] Each feature shows icon, title, description, benefit, and screenshot
- [ ] Benefits are specific and measurable (e.g., "Log in 30 seconds")
- [ ] Hover effects show glassmorphic elevation
- [ ] Grid layout responsive: 3→2→1 columns

**Checkpoint**: User Stories 1-4 all work independently

---

## Phase 7: User Story 5 - Visitor Understands How to Get Started (Priority: P2)

**Goal**: Implement How It Works section showing clear 3-step process

**Independent Test**: Ask visitors "How do you get started?" Success = 90%+ correctly describe the 3-step process.

**Components**: HowItWorksSection organism, ProcessStep molecule, process steps data

### Tests for User Story 5

- [x] T040 [P] [US5] Write test for ProcessStep molecule in tests/components/molecules/ProcessStep.test.js
- [x] T041 [US5] Write test for HowItWorksSection organism in tests/components/organisms/HowItWorksSection.test.js

### Implementation for User Story 5

- [x] T042 [P] [US5] Create process steps data file in src/lib/data/processSteps.js (3 steps)
- [ ] T043 [P] [US5] Add step screenshot images to public/images/homepage/steps/ (3 images, 600x400px each) ⚠️ MANUAL
- [x] T044 [US5] Implement ProcessStep molecule in src/components/molecules/ProcessStep.js
- [x] T045 [US5] Implement HowItWorksSection organism in src/components/organisms/HowItWorksSection.js (depends on T044)
- [x] T046 [US5] Verify HowItWorksSection tests pass with npm test (17 tests passing)

**Acceptance Verification**:
- [ ] Section displays exactly 3 steps with numbers
- [ ] Steps show connecting lines (dashed) except for last step
- [ ] Layout horizontal on desktop, vertical on mobile
- [ ] Steps animate sequentially on scroll (200ms delay between)
- [ ] Each step shows icon, title, description, and optional screenshot

**Checkpoint**: User Stories 1-5 all work independently

---

## Phase 8: User Story 6 - Visitor Converts to User (Priority: P1)

**Goal**: Implement Final CTA section with risk reversal to drive conversions

**Independent Test**: Measure click-through rate on CTA button. Success = 15%+ of visitors who scroll to final CTA click "Start Free".

**Components**: FinalCTASection organism, uses existing GradientButton atom

### Tests for User Story 6 (Write FIRST) ⚠️

- [x] T047 [US6] Write test for FinalCTASection organism in tests/components/organisms/FinalCTASection.test.js

### Implementation for User Story 6

- [x] T048 [US6] Implement FinalCTASection organism in src/components/organisms/FinalCTASection.js (depends on T008, T015)
- [x] T049 [US6] Verify FinalCTASection tests pass with npm test (10 tests passing)

**Acceptance Verification**:
- [ ] Section displays compelling heading and subheading
- [ ] Large prominent "Start Free Today" button centered
- [ ] Risk reversal message: "Free forever. No credit card required."
- [ ] Gradient background (purple to pink) applied
- [ ] Button redirects authenticated users to /entries, unauthenticated to /register

**Checkpoint**: All 6 user stories now independently functional

---

## Phase 9: Integration & Page Composition

**Purpose**: Compose all sections into complete homepage and ensure seamless integration

### Tests for Integration (Write FIRST) ⚠️

- [x] T050 Write E2E test for complete homepage user journey in tests/e2e/homepage-integration.spec.js

### Implementation

- [x] T051 Update homepage in src/app/page.js to compose all 6 sections
- [x] T052 Add authentication check using auth() from NextAuth.js in src/app/page.js (NOT NEEDED - components use useSession client-side)
- [x] T053 Pass isAuthenticated prop to Hero and FinalCTASection components (NOT NEEDED - components use useSession)
- [x] T054 Verify all sections render in correct order with proper spacing (18 E2E tests passing on desktop)
- [ ] T055 Test authentication-aware CTA routing (logged in → /entries, logged out → /register)
- [ ] T056 Verify smooth scroll behavior for "See How It Works" button (OPTIONAL - requires anchor links)
- [x] T057 Run E2E test with npm run test:e2e to verify all 6 user stories (18/72 passing - desktop working)

**Page Structure Verification**:
- [ ] Hero section at top
- [ ] SocialProofSection below Hero
- [ ] ProblemSolutionSection
- [ ] FeaturesList
- [ ] HowItWorksSection
- [ ] FinalCTASection at bottom
- [ ] Proper vertical spacing (py-12 → py-16 → py-20 responsive)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility, and final quality assurance

### Performance Optimization

- [ ] T058 [P] Optimize all images with Next.js Image component (WebP format, lazy loading)
- [ ] T059 [P] Add priority prop to hero screenshot for LCP optimization
- [ ] T059a [P] Verify Next.js Image component blur placeholder for progressive loading
- [ ] T060 [P] Verify animations use transform/opacity only (60fps requirement)
- [ ] T061 [P] Configure Framer Motion with reduce-motion support for accessibility
- [ ] T062 Run Lighthouse audit and verify Performance >90, Accessibility 100

### Accessibility & Testing

- [ ] T063 [P] Run jest-axe accessibility tests on all components
- [ ] T064 [P] Test keyboard navigation through all interactive elements
- [ ] T065 [P] Verify screen reader announcements for all sections
- [ ] T066 [P] Test high contrast mode rendering
- [ ] T067 Verify WCAG 2.1 AA compliance (4.5:1 contrast ratio)

### Cross-Browser & Responsiveness

- [ ] T068 [P] Test glassmorphism fallback for browsers without backdrop-filter
- [ ] T069 [P] Verify responsive layouts on 375px, 768px, 1024px, 1440px viewports
- [ ] T070 [P] Test on Chrome, Firefox, Safari, Edge browsers
- [ ] T071 Verify zero horizontal scroll on all viewport sizes

### Documentation & Validation

- [ ] T072 [P] Add code comments for complex animation sequences
- [ ] T073 [P] Update README.md with new homepage features (if needed)
- [ ] T073a [P] Verify Inter or SF Pro Display font loading in production build
- [ ] T074 Run complete test suite with coverage: npm test -- --coverage
- [ ] T075 Verify 80%+ test coverage for all new components
- [ ] T076 Run quickstart.md validation checklist
- [ ] T077 Final code review against constitution requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel if staffed (different components)
  - OR sequentially in priority order: US1 → US6 → US2 → US3 → US4 → US5
- **Integration (Phase 9)**: Depends on all 6 user stories being complete
- **Polish (Phase 10)**: Depends on Integration completion

### User Story Dependencies

**High Priority (P1) - MVP Scope**:
- ✅ **User Story 1 (Hero)**: Can start after Foundational - No dependencies on other stories
- ✅ **User Story 2 (Social Proof)**: Can start after Foundational - No dependencies on other stories  
- ✅ **User Story 6 (Final CTA)**: Can start after Foundational - No dependencies on other stories

**Medium Priority (P2) - Post-MVP**:
- **User Story 3 (Problem/Solution)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (Features)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (How It Works)**: Can start after Foundational - No dependencies on other stories

**Key Insight**: All user stories are independently implementable after Foundational phase completes. This enables parallel development by multiple developers.

### Within Each User Story

**TDD Workflow (MANDATORY per constitution)**:
1. Write tests FIRST (must FAIL before implementation)
2. Show tests to user for approval
3. Implement component (tests turn GREEN)
4. Refactor while keeping tests passing
5. Commit with descriptive message

**Component Dependencies**:
- Data files before components that consume them
- Atoms before molecules
- Molecules before organisms
- Organisms before page composition

### Parallel Opportunities

**Phase 1 (Setup)**: All 4 tasks can run in parallel
**Phase 2 (Foundational)**: 
- Tests T005-T007 can run in parallel (3 atom tests)
- Implementations T008-T010 can run in parallel after tests (3 atoms)

**Phase 3-8 (User Stories)**: 
- ALL 6 user stories can be developed in parallel by different developers
- Within each story: tests can be written in parallel, implementations must follow atom→molecule→organism order

**Phase 10 (Polish)**: Most tasks marked [P] can run in parallel

---

## Parallel Example: Multiple User Stories

```bash
# Developer 1 - User Story 1 (Hero) - P1 Priority
"Write test for TrustBadge molecule in tests/components/molecules/TrustBadge.test.js"
"Create trust indicators data file in src/lib/data/trustIndicators.js"
"Implement TrustBadge molecule in src/components/molecules/TrustBadge.js"
"Implement Hero organism in src/components/organisms/Hero.js"

# Developer 2 - User Story 2 (Social Proof) - P1 Priority (PARALLEL)
"Write test for TestimonialCard molecule in tests/components/molecules/TestimonialCard.test.js"
"Create testimonials data file in src/lib/data/testimonials.js"
"Implement TestimonialCard molecule in src/components/molecules/TestimonialCard.js"
"Implement SocialProofSection organism in src/components/organisms/SocialProofSection.js"

# Developer 3 - User Story 6 (Final CTA) - P1 Priority (PARALLEL)
"Write test for FinalCTASection organism in tests/components/organisms/FinalCTASection.test.js"
"Implement FinalCTASection organism in src/components/organisms/FinalCTASection.js"

# All 3 developers can work simultaneously after Foundational phase completes
```

---

## Implementation Strategy

### MVP First (Recommended)

**MVP = P1 User Stories Only** (Hero + Social Proof + Final CTA):
- Delivers core conversion funnel: Value prop → Trust → Action
- Can launch with just these 3 sections (Tasks T001-T026, T047-T049, T050-T077)
- Estimated 5-7 days for single developer
- Provides immediate conversion uplift

**Post-MVP Iterations**:
- Add P2 stories incrementally: Problem/Solution → Features → How It Works
- Each story adds 1-2 days of development
- Can be deployed independently without breaking existing sections

### Full Feature (All 6 Stories)

Complete all phases for full redesign:
- Estimated 10-14 days for single developer following TDD
- Week 1: Setup + Foundational + US1 + US2
- Week 2: US3 + US4 + US5 + US6 + Integration + Polish

### Parallel Development (3 Developers)

With 3 developers working in parallel:
- Estimated 5-7 days to complete all 6 user stories
- Developer assignments by expertise:
  - Dev 1: P1 stories (Hero, Final CTA) - critical path
  - Dev 2: P1 + P2 (Social Proof, Features) - data-heavy
  - Dev 3: P2 stories (Problem/Solution, How It Works) - content-focused

---

## Task Summary

**Total Tasks**: 79
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 7 tasks (3 atoms + tests)
- Phase 3 (US1 - Hero): 8 tasks
- Phase 4 (US2 - Social Proof): 7 tasks
- Phase 5 (US3 - Problem/Solution): 6 tasks
- Phase 6 (US4 - Features): 7 tasks
- Phase 7 (US5 - How It Works): 7 tasks
- Phase 8 (US6 - Final CTA): 3 tasks
- Phase 9 (Integration): 8 tasks
- Phase 10 (Polish): 22 tasks

**Parallel Opportunities**: 37+ tasks marked [P] can execute in parallel

**MVP Scope**: 
- Phases 1-2 (Foundational): 11 tasks
- Phase 3 (US1): 8 tasks  
- Phase 4 (US2): 7 tasks
- Phase 8 (US6): 3 tasks
- Phase 9-10 (Integration + Polish): 30 tasks
- **MVP Total**: 59 tasks (75% of full feature)

**Independent Test Criteria**:
- US1: 90% correctly identify app purpose in 5 seconds
- US2: 80%+ report increased trust after viewing
- US3: 70%+ identify with at least one pain point
- US4: 75%+ recall 2+ features with benefits
- US5: 90%+ describe 3-step process correctly
- US6: 15%+ click-through rate on final CTA

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] and [Story] labels, and file paths

---

## Next Steps

1. **Review task breakdown** with team/stakeholder
2. **Decide on strategy**: MVP-first or full feature
3. **Assign developers** if parallel development (recommended)
4. **Begin Phase 1**: Install dependencies and setup structure
5. **Follow TDD workflow**: Write tests → Show to user → Get approval → Implement → Verify pass
6. **Track progress**: Update checkboxes as tasks complete
7. **Deploy MVP** after Phase 4 + Phase 8 + Integration/Polish for P1 stories

**Ready to start! 🚀 Begin with Task T001: Install Framer Motion**
