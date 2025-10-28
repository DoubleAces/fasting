# fasting Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-17

## Active Technologies
- JavaScript ES6+ with Node.js 18+ (Next.js 14+) + Next.js 14, React 18, TailwindCSS 3, Mongoose, React Hook Form, date-fns (001-daily-fasting-tracker)
- JavaScript (ES6+) / Next.js 14.2+ (App Router) (002-website-auth-structure)
- MongoDB (existing) with new collections: (002-website-auth-structure)
- JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, NextAuth.js v5 (003-terms-conditions-page)
- MongoDB with Mongoose (User model extension for termsAcceptedAt field) (003-terms-conditions-page)
- JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, existing TermsSection/TermsContent architecture (004-privacy-policy-page)
- N/A (static content page, no database changes required) (004-privacy-policy-page)
- JavaScript (ES6+) with Next.js 15.5.6 + React 19.1.0, NextAuth 5.0 (beta), Mongoose 8.19.1, Tailwind CSS 4.1.14 (005-admin-area-access)
- MongoDB with Mongoose ODM (existing database) (005-admin-area-access)
- JavaScript ES6+ / TypeScript (optional), Node.js 18+ + Next.js 15.5.6 (App Router), React 19.1.0, NextAuth.js v5, Mongoose (MongoDB ODM) (006-admin-user-management)
- MongoDB with replica set (required for atomic transactions) (006-admin-user-management)
- JavaScript (ES6+) with Node.js (compatible with Next.js 15.5.6) + Jest 30.2.0, Mongoose 8.19.1, MongoDB 5.5, Dotenv 17.2.3, mongodb-memory-server 10.2.3 (008-test-database-separation)
- MongoDB (production, development, and test databases) (008-test-database-separation)
- JavaScript (ES6+) / Node.js with Next.js 14+ (App Router) + Next.js, Mongoose ODM, MongoDB Atlas, NextAuth.js (009-backfill-fasting-calculation)
- MongoDB Atlas (cloud database) - existing `entries` collection with userId and date compound index (009-backfill-fasting-calculation)
- JavaScript (ES6+) / Next.js 15.5.6 (App Router) (010-pwa-conversion)
- JavaScript ES6+ with Next.js 15.5.6 (App Router) (011-entry-details-page)
- MongoDB with Mongoose schemas (Entry, User, Settings collections) (011-entry-details-page)
- JavaScript ES6+ / Next.js 15.5.6 + React 18, Mongoose ODM, NextAuth.js (012-remove-copy-today)
- MongoDB (Entry model with optional templateSource field) (012-remove-copy-today)
- JavaScript (ES6+) with React 18 + Next.js 15.5.6 (App Router), React Hook Form, Tailwind CSS (013-inline-fast-confirmation)
- MongoDB with Mongoose ODM (Entry model with extendedFastConfirmed fields) (013-inline-fast-confirmation)
- JavaScript (ES6+) / React 18 / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS, Mongoose, NextAuth.js v5 (014-codebase-cleanup-refactor)
- MongoDB with Mongoose ODM (no schema changes - refactoring only) (014-codebase-cleanup-refactor)
- JavaScript (ES6+) with React 18 + Next.js 15.5.6 (App Router), Tailwind CSS for styling (015-extended-fast-datetime-display)
- MongoDB with Mongoose ODM (Entry model - no schema changes required) (015-extended-fast-datetime-display)
- JavaScript (ES6+), Node.js 18+ + Next.js 15+ (App Router), MongoDB 4.0+, Mongoose ODM, Redis 6+, ioredis or node-redis client (016-performance-optimization)
- MongoDB with Mongoose schemas (Entry, Settings collections) (016-performance-optimization)
- JavaScript ES6+ / Next.js 15+ (App Router) + React 18, Tailwind CSS, date-fns (or existing date utilities) (017-live-fasting-timer)
- MongoDB (existing Entry model - no schema changes required) (017-live-fasting-timer)
- JavaScript ES6+ (Next.js 14 App Router)<!-- + React 18, Next.js 14, Tailwind CSS 3, date-fns (existing utility library)  ACTION REQUIRED: Replace the content in this section with the technical details (018-improve-form-inputs)
- MongoDB with Mongoose (existing - dates stored as ISO format, times as HH:mm)  for the project. The structure here is presented in advisory capacity to guide (018-improve-form-inputs)
- JavaScript (ES6+), Node.js 18+ + Next.js 15+ (App Router), React 18, date-fns, Mongoose ODM (019-fix-entry-click-delay)
- MongoDB with existing indexes (Feature 016), in-memory cache for settings/insights (019-fix-entry-click-delay)
- JavaScript (ES6+) with React 19.1.0, Next.js 15.5.6 (App Router) + Next.js, React, Mongoose 8.19.1, date-fns 4.1.0, Tailwind CSS, lucide-react (020-fasting-goal-timer)
- MongoDB with Mongoose ODM (extends Entry model with 2 optional fields) (020-fasting-goal-timer)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test; npm run lint

## Code Style
JavaScript ES6+ with Node.js 18+ (Next.js 14+): Follow standard conventions

## Recent Changes
- 020-fasting-goal-timer: Added JavaScript (ES6+) with React 19.1.0, Next.js 15.5.6 (App Router) + Next.js, React, Mongoose 8.19.1, date-fns 4.1.0, Tailwind CSS, lucide-react
- 019-fix-entry-click-delay: Added JavaScript (ES6+), Node.js 18+ + Next.js 15+ (App Router), React 18, date-fns, Mongoose ODM
- 018-improve-form-inputs: Added JavaScript ES6+ (Next.js 14 App Router)<!-- + React 18, Next.js 14, Tailwind CSS 3, date-fns (existing utility library)  ACTION REQUIRED: Replace the content in this section with the technical details

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
