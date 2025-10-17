# Fasting Tracker System Constitution

## Core Principles

### I. Next.js Best Practices
- Follow Next.js latest version conventions and patterns
- Utilize App Router architecture for optimal performance
- Implement Server Components by default; Client Components only when necessary
- Leverage built-in optimizations: Image optimization, Font optimization, Script optimization
- Use proper data fetching patterns (Server Components, streaming, caching)
- Follow file-based routing conventions

### II. Mobile-First Responsive Design
- Design mobile-first, scale up to desktop
- All features must be fully responsive across devices
- Touch-friendly UI elements (minimum 44x44px touch targets)
- Progressive enhancement approach
- Test on real mobile devices during development
- Optimize for both portrait and landscape orientations

### III. Test-Driven Development (NON-NEGOTIABLE)
- TDD mandatory: Tests written → User approved → Tests fail → Then implement
- Red-Green-Refactor cycle strictly enforced
- Unit tests for all business logic and utilities
- Integration tests for API routes and database operations
- Component tests for UI interactions
- E2E tests for critical user flows
- Minimum 80% code coverage required

### IV. Component Architecture
- Build reusable, composable components
- Follow atomic design principles (atoms, molecules, organisms)
- Components must be self-contained and independently testable
- Props validation using PropTypes or JSDoc comments
- Document component APIs and usage examples
- Separate presentation components from container components

### V. User Privacy & Data Security
- User health data is sensitive and must be protected
- Client-side data encryption where appropriate
- Secure API routes with proper authentication
- Follow OWASP security best practices
- No tracking or analytics without explicit user consent
- Data retention policies must be clear and user-controllable

### VI. Performance & Accessibility
- Lighthouse scores: Performance >90, Accessibility 100, Best Practices >90, SEO 100
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- WCAG 2.1 Level AA compliance minimum
- Semantic HTML throughout
- Keyboard navigation support for all interactive elements
- Screen reader friendly

## Technology Stack

### Frontend
- **Framework**: Next.js (latest stable version)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context API / Zustand for global state
- **Forms**: React Hook Form with validation
- **Testing**: Jest + React Testing Library + Playwright for E2E

### Backend
- **API**: Next.js API Routes / Server Actions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (or Auth.js)
- **Validation**: Joi or custom validation schemas

### Development Tools
- **Package Manager**: npm or pnpm
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Documentation**: JSDoc for function/component documentation
- **Git Hooks**: Husky for pre-commit checks

## Development Workflow

### Code Quality Gates
1. ESLint must pass with no errors (warnings reviewed case-by-case)
2. Prettier formatting enforced
3. All tests must pass before merge
4. JSDoc comments required for public APIs and complex functions
5. Code review required for all PRs
6. No direct commits to main branch

### Feature Development Process
1. **Specify**: Create feature specification (what, why, success criteria)
2. **Plan**: Technical design and implementation approach
3. **Test**: Write tests based on specifications
4. **Implement**: Write code to pass tests
5. **Review**: Code review and QA
6. **Deploy**: Merge and deploy to production

### Database Conventions
- Use Mongoose schemas with clear documentation
- Implement proper indexing for query performance
- Use atomic operations for data integrity
- Implement soft deletes where appropriate
- Maintain audit trails for sensitive data changes

## Governance

### Constitution Authority
- This constitution supersedes all other development practices
- All PRs must verify compliance with these principles
- Deviations require documented justification and team approval

### Amendment Process
- Amendments require documentation of rationale
- Team consensus required for core principle changes
- Migration plan required for breaking changes
- All amendments must be versioned and dated

### Complexity Management
- Favor simplicity over cleverness
- YAGNI (You Aren't Gonna Need It) principle enforced
- Complex solutions must be justified and documented
- Regular refactoring to reduce technical debt

**Version**: 1.0.0 | **Ratified**: October 17, 2025 | **Last Amended**: October 17, 2025
