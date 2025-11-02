# Fasting Tracker

A daily fasting and health metrics tracking application built with Next.js 14+, React 18, and MongoDB.

## Features

- 📊 Track daily fasting windows with automatic duration calculation
- 🏋️ Monitor health metrics (weight, sleep, energy, hunger, well-being)
- 📝 Record food intake notes with expandable display (auto-truncates >300 characters)
- 📈 View historical data and trends
- 🎨 **Beautiful Entry Details Page (Feature 025)**:
  - Glassmorphic design with gradient backgrounds and soft blur effects
  - Comprehensive view of all entry data with visual timeline
  - Share button with Web Share API (native sharing on mobile/desktop)
  - Edit/Delete action buttons with proper confirmation flows
  - Entry navigation with prev/next arrows and keyboard shortcuts (← →)
  - Responsive performance: <300ms cached page loads, ISR with 5-min revalidate
  - Smart date display for midnight-crossing fasts (shows dates when needed)
- 🔍 **Personal Insights & Comparisons**:
  - Personalized insights comparing each entry to your history
  - Historical ranking (e.g., "Your #3 longest fast")
  - Monthly achievements (longest fast this month)
  - Average duration comparisons (overall, last 30 days, same day-of-week)
  - Typical breakfast time patterns
  - Daily streak tracking with current/longest streaks
  - "Best Day" badges for exceptional performance
  - Automatic unlock at 5+ entries (shows empty state before threshold)
- 🚀 **Performance & Caching**:
  - ISR (Incremental Static Regeneration) with 5-minute page revalidation
  - 30-minute insights cache with automatic invalidation
  - 1-hour settings cache for user preferences
  - Server-side performance logging with detailed metrics
  - Aggressive cache revalidation on mutations (entries, dashboard, insights)
  - Target: <500ms page load (200-300ms with cache hits)
- ⚙️ Configurable measurement units (metric/imperial) and time formats (12h/24h)
- 📱 **Mobile-Optimized UX**:
  - Responsive 3-column table on mobile (Date, Duration, Actions)
  - Full 8-column table on desktop
  - Compact typography (14px body text on mobile, 16px on desktop)
  - Mobile-friendly forms with vertical stacking and full-width buttons
  - 44px minimum touch targets (WCAG AA compliant)
  - Responsive breakpoint: 768px (mobile < 768px, desktop ≥ 768px)
  - Native share sheet on mobile devices via Web Share API
- ♿ WCAG 2.1 Level AA accessible

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript ES6+
- **Styling**: TailwindCSS 3
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form
- **Validation**: Joi
- **Testing**: Jest + React Testing Library + Playwright
- **Development**: Test-Driven Development (TDD) with 80% coverage minimum

## Responsive Design

This application uses a **mobile-first approach** with Tailwind CSS responsive utilities:

- **Breakpoint**: 768px
  - Mobile: < 768px (base classes apply)
  - Desktop: ≥ 768px (md: prefix classes apply)

**Mobile Optimizations (< 768px)**:
- Compact typography scale (14px body, 24px h1, 18px h2)
- 12px padding (p-3) for tighter layouts
- 3-column entry table (Date, Duration, Actions)
- Vertical form layouts with full-width buttons
- 44px minimum touch targets for accessibility

**Desktop Experience (≥ 768px)**:
- Standard typography scale (16px body, 32px h1, 24px h2)
- 16px padding (p-4) for comfortable spacing
- 8-column entry table (full data visibility)
- Horizontal form layouts with auto-width buttons
- Optimized for mouse/trackpad interaction

**Key Implementation Details**:
- Pure CSS/Tailwind only (zero JavaScript media queries)
- Zero performance impact (no runtime calculations)
- WCAG 2.1 AA compliant touch targets (≥44px)
- Consistent 4.5:1 color contrast ratios

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DoubleAces/fasting.git
cd fasting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/fasting-tracker
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fasting/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components (atomic design)
│   │   ├── atoms/       # Basic building blocks (Button, Input, etc.)
│   │   ├── molecules/   # Simple component combinations
│   │   ├── organisms/   # Complex components (forms, lists)
│   │   └── templates/   # Page layouts
│   ├── lib/             # Utilities and business logic
│   │   ├── db.js        # MongoDB connection
│   │   ├── models/      # Mongoose schemas
│   │   ├── utils/       # Helper functions
│   │   └── validation/  # Joi validation schemas
│   └── styles/          # Global styles
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # API integration tests
│   ├── components/     # Component tests
│   └── e2e/            # End-to-end tests (Playwright)
├── public/             # Static assets
└── specs/              # Feature specifications and documentation

```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (to be configured)
- `npm run test:watch` - Run tests in watch mode (to be configured)
- `npm run test:coverage` - Run tests with coverage (to be configured)
- `npm run test:e2e` - Run E2E tests (to be configured)

## Development Workflow

This project follows **Test-Driven Development (TDD)**:

1. ✅ Write tests first (Red)
2. ✅ Implement feature to pass tests (Green)
3. ✅ Refactor code (Refactor)

See [tasks.md](./specs/001-daily-fasting-tracker/tasks.md) for detailed implementation tasks.

## Documentation

### Core Features
- [Feature Specification](./specs/001-daily-fasting-tracker/spec.md)
- [Implementation Plan](./specs/001-daily-fasting-tracker/plan.md)
- [Technical Research](./specs/001-daily-fasting-tracker/research.md)
- [Data Model](./specs/001-daily-fasting-tracker/data-model.md)
- [API Specification](./specs/001-daily-fasting-tracker/contracts/api-spec.json)
- [Development Tasks](./specs/001-daily-fasting-tracker/tasks.md)
- [Quickstart Guide](./specs/001-daily-fasting-tracker/quickstart.md)

### Mobile UX Improvements (Feature 022)
- [Mobile UX Specification](./specs/022-mobile-ux-improvements/spec.md)
- [Mobile UX Tasks](./specs/022-mobile-ux-improvements/tasks.md)
- Includes: Responsive table, compact typography, mobile-friendly forms

## Contributing

1. Follow TDD principles (tests first!)
2. Maintain 80%+ test coverage
3. Ensure WCAG 2.1 AA compliance
4. Use mobile-first responsive design
5. Follow ESLint rules

## License

Private project - All rights reserved.

## Project Status

**Branch**: `001-daily-fasting-tracker`  
**Phase**: Setup & Infrastructure  
**Progress**: 1/60 tasks complete

See [tasks.md](./specs/001-daily-fasting-tracker/tasks.md) for current progress.

