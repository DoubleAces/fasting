# Research: Website Structure & Authentication

**Branch**: 002-website-auth-structure  
**Status**: Complete  
**Date**: 2025-01-XX

## Purpose

Document research findings and technology decisions for implementing website structure with authentication, FAQ page, and SEO optimization.

## Technology Research

### Authentication: NextAuth.js v5 (Auth.js)

**Decision**: Use NextAuth.js v5 for authentication

**Rationale**:
- ✅ Constitution-compliant (mandated in technology stack)
- ✅ Supports multiple providers (email/password + Google OAuth)
- ✅ Built-in session management with JWT or database sessions
- ✅ Excellent Next.js App Router integration
- ✅ CSRF protection included
- ✅ Secure cookie handling (HttpOnly, Secure, SameSite)
- ✅ Active maintenance and community support

**Implementation Approach**:
- Use Credentials provider for email/password authentication
- Use Google provider for OAuth authentication
- Configure MongoDB adapter for session persistence
- Implement custom callbacks for user data handling

**References**:
- https://authjs.dev/ (official documentation)
- https://authjs.dev/getting-started/providers/credentials
- https://authjs.dev/getting-started/providers/google
- https://authjs.dev/getting-started/adapters/mongodb

### Password Security: Bcrypt

**Decision**: Use bcrypt for password hashing

**Rationale**:
- ✅ Industry standard for password hashing
- ✅ Adaptive hashing (configurable work factor)
- ✅ Built-in salt generation
- ✅ Resistant to rainbow table attacks
- ✅ Resistant to brute-force attacks (slow by design)

**Implementation Approach**:
- Use bcrypt.hash() with minimum 10 rounds (cost factor)
- Use bcrypt.compare() for password verification
- Store only hashed passwords (never plaintext)

**References**:
- https://www.npmjs.com/package/bcrypt
- OWASP Password Storage Cheat Sheet

### SEO Implementation: Next.js Built-in Features

**Decision**: Use Next.js built-in SEO features

**Rationale**:
- ✅ Metadata API for head tags (Next.js 14+)
- ✅ Automatic sitemap generation via route handlers
- ✅ Server-side rendering for public pages
- ✅ Image optimization built-in
- ✅ Structured data support

**Implementation Approach**:
- Use `metadata` export in page.js files for meta tags
- Implement generateMetadata() for dynamic pages
- Create /api/sitemap.xml route for sitemap generation
- Use next/image for optimized images
- Add JSON-LD structured data to homepage and FAQ

**References**:
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata
- https://developers.google.com/search/docs/appearance/structured-data

### FAQ Search: Client-side Filtering

**Decision**: Implement client-side FAQ search (initial version)

**Rationale**:
- ✅ Simple implementation (no server-side complexity)
- ✅ Fast response times (<500ms required)
- ✅ Appropriate for small FAQ datasets (<100 items)
- ✅ No additional database queries needed
- ✅ Can upgrade to server-side search if FAQ grows

**Implementation Approach**:
- Load all FAQ items on page load (server-side rendered)
- Filter in-memory using JavaScript (case-insensitive matching)
- Search across question, answer, and keywords fields
- Use debounce for search input (300ms delay)

**Upgrade Path**: If FAQ exceeds 100 items, migrate to MongoDB text search with indexes

## Security Research

### Session Management

**Decisions**:
- Use NextAuth.js JWT strategy for sessions (stateless)
- OR MongoDB session store (stateful, more secure for revocation)
- Session duration: 30 days (default), 90 days with "remember me"
- Secure, HttpOnly, SameSite=Strict cookies
- CSRF token validation on all mutating requests

### Rate Limiting

**Decision**: Implement rate limiting middleware

**Approach**:
- Track login attempts by IP address
- Max 5 attempts per 15 minutes per IP
- Store in-memory (simple) or Redis (production scalable)
- Return 429 Too Many Requests on limit exceeded

**Implementation**: Express-style middleware compatible with Next.js API routes

### Password Reset Flow

**Security Measures**:
- Generate cryptographically secure tokens (crypto.randomBytes(32))
- 1-hour expiration on reset tokens
- One-time use only (mark as used after reset)
- Email verification before sending reset link
- No user enumeration (same response for existing/non-existing emails)

## Performance Research

### Target Metrics (from Success Criteria)

- **Homepage**: <2 seconds load time, LCP <2.5s
- **Authentication**: Login <10s, Registration <60s
- **FAQ**: <2 seconds load, search results <500ms
- **Lighthouse**: SEO >90, Performance >90, Accessibility 100

### Optimization Strategies

1. **Server-Side Rendering**: Public pages (homepage, FAQ) use SSR for SEO and initial load performance
2. **Image Optimization**: Use next/image for automatic optimization
3. **Code Splitting**: Automatic with Next.js App Router
4. **Caching**: Implement appropriate cache headers for static assets
5. **Database Indexing**: Add indexes on frequently queried fields (user email, FAQ keywords)

## Accessibility Research

### WCAG 2.1 AA Compliance

**Requirements**:
- Semantic HTML5 elements
- Keyboard navigation support
- Screen reader friendly (ARIA labels where needed)
- Sufficient color contrast (4.5:1 for text)
- 44x44px minimum touch targets (mobile)
- Focus indicators visible
- Form labels and error messages accessible

**Tools**:
- axe DevTools for accessibility testing
- Lighthouse accessibility audit
- Manual keyboard navigation testing

## Open Questions

**All questions resolved**. No unknowns or NEEDS CLARIFICATION items remain.

## Decisions Summary

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Authentication | NextAuth.js v5 | Constitution-compliant, full-featured, Next.js optimized |
| Password Hashing | Bcrypt (10+ rounds) | Industry standard, adaptive, secure |
| Database | MongoDB + Mongoose | Existing project stack, constitution-compliant |
| SEO | Next.js Metadata API | Built-in, no additional dependencies |
| FAQ Search | Client-side filtering | Fast, simple, appropriate for small datasets |
| Session Storage | NextAuth JWT or MongoDB | Flexible, both options evaluated |
| Rate Limiting | Middleware (in-memory or Redis) | Simple for MVP, scalable for production |
| Accessibility | WCAG 2.1 AA | Minimum constitution requirement |

## Next Steps

Proceed to **Phase 1: Design & Contracts**
- ✅ Research complete
- ⏭ Generate data-model.md
- ⏭ Generate API contracts
- ⏭ Generate quickstart.md
- ⏭ Update agent context
