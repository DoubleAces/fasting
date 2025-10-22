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
- 005-admin-area-access: Added JavaScript (ES6+) with Next.js 15.5.6 + React 19.1.0, NextAuth 5.0 (beta), Mongoose 8.19.1, Tailwind CSS 4.1.14
- 004-privacy-policy-page: Added JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, existing TermsSection/TermsContent architecture
- 003-terms-conditions-page: Added JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, NextAuth.js v5

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
