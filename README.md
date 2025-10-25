# Fasting Tracker

A daily fasting and health metrics tracking application built with Next.js 14+, React 18, and MongoDB.

## Features

- 📊 Track daily fasting windows with automatic duration calculation
- 🏋️ Monitor health metrics (weight, sleep, energy, hunger, well-being)
- 📝 Record food intake notes
- 📈 View historical data and trends
- 🔍 **Entry Details with Personal Insights**:
  - Comprehensive view of all entry data with visual timeline
  - Personalized insights comparing each entry to your history
  - Historical ranking (e.g., "Your #3 longest fast")
  - Monthly achievements (longest fast this month)
  - Average duration comparisons
  - Typical breakfast time patterns
  - Daily streak tracking
  - "Best Day" badges for exceptional performance
- ⚙️ Configurable measurement units (metric/imperial) and time formats (12h/24h)
- 📱 Mobile-first responsive design
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

- [Feature Specification](./specs/001-daily-fasting-tracker/spec.md)
- [Implementation Plan](./specs/001-daily-fasting-tracker/plan.md)
- [Technical Research](./specs/001-daily-fasting-tracker/research.md)
- [Data Model](./specs/001-daily-fasting-tracker/data-model.md)
- [API Specification](./specs/001-daily-fasting-tracker/contracts/api-spec.json)
- [Development Tasks](./specs/001-daily-fasting-tracker/tasks.md)
- [Quickstart Guide](./specs/001-daily-fasting-tracker/quickstart.md)

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

