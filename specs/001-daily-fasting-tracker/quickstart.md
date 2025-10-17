# Quickstart Guide - Daily Fasting Tracker

**Feature**: Daily Fasting Tracker  
**Date**: October 17, 2025  
**Target Audience**: Developers setting up local development environment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Latest version (comes with Node.js)
- **MongoDB**: v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
  - OR use **MongoDB Atlas** for cloud database ([Sign up](https://www.mongodb.com/cloud/atlas/register))
- **Git**: For version control
- **VS Code**: Recommended editor with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Jest Runner

---

## 🚀 Quick Setup (5 minutes)

### 1. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/fasting.git
cd fasting

# Checkout the feature branch
git checkout 001-daily-fasting-tracker

# Install dependencies
npm install
# OR if using pnpm
pnpm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
# On Mac (with Homebrew):
brew services start mongodb-community

# On Windows (as Administrator):
net start MongoDB

# On Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net`)
3. Whitelist your IP address in Atlas dashboard

### 3. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/fasting-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasting-tracker?retryWrites=true&w=majority

# Next.js configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Database (Optional)

```bash
# Seed default settings (optional - will be created automatically on first use)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit and component tests (Jest + RTL) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |

---

## 🏗️ Project Structure

```
fasting/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── log/               # Daily log entry page
│   │   ├── history/           # Historical entries page
│   │   └── settings/          # User settings page
│   ├── components/            # React components
│   │   ├── atoms/            # Basic components (Button, Input)
│   │   ├── molecules/        # Composite components (FormField)
│   │   └── organisms/        # Complex components (EntryForm)
│   ├── lib/                   # Utilities and models
│   │   ├── db.js             # MongoDB connection
│   │   ├── models/           # Mongoose schemas
│   │   └── utils/            # Helper functions
│   └── styles/               # Global styles
├── tests/                     # All tests
├── public/                    # Static files
└── .env.local                # Environment variables (create this)
```

---

## 🧪 Running Tests

### Unit & Component Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage Requirements** (per constitution):
- Minimum 80% overall coverage
- 100% for utility functions
- 90% for API routes

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI (visual debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/log-entry.spec.js
```

---

## 🔍 Verify Installation

### 1. Check Database Connection

```bash
# Access MongoDB shell
mongosh

# List databases
show dbs

# Use the fasting tracker database
use fasting-tracker

# List collections (should see 'entries' and 'user_settings' after first use)
show collections
```

### 2. Test API Endpoints

```bash
# Get settings (should return default settings or 404 if not initialized)
curl http://localhost:3000/api/settings

# Create a test entry
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-17",
    "firstMealTime": "12:00",
    "lastMealTime": "20:00",
    "weight": 75,
    "hungerLevel": "Medium",
    "energyLevel": "High Energy",
    "wellBeing": "Good"
  }'

# Get all entries
curl http://localhost:3000/api/entries
```

### 3. Check Pages

- Home/Dashboard: [http://localhost:3000](http://localhost:3000)
- Log Entry: [http://localhost:3000/log](http://localhost:3000/log)
- View History: [http://localhost:3000/history](http://localhost:3000/history)
- Settings: [http://localhost:3000/settings](http://localhost:3000/settings)

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Ensure MongoDB is running: `brew services list` (Mac) or check Task Manager (Windows)
2. Check connection string in `.env.local`
3. For Atlas: Verify IP whitelist and credentials

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm run dev
```

### ESLint Errors

**Problem**: Linting errors prevent build

**Solutions**:
```bash
# Auto-fix most errors
npm run lint:fix

# Temporarily disable for debugging (not recommended for commits)
NEXT_LINT_IGNORE=true npm run build
```

### Test Failures

**Problem**: Tests failing unexpectedly

**Solutions**:
1. Clear test cache: `npm run test -- --clearCache`
2. Update snapshots (if UI changed): `npm run test -- -u`
3. Check MongoDB test database connection

---

## 📚 Development Workflow

### 1. TDD Cycle (Constitution Requirement)

```bash
# 1. Write tests first
# Create/edit test file in tests/

# 2. Run tests (should fail - RED)
npm run test:watch

# 3. Write minimal code to pass tests (GREEN)
# Edit source files

# 4. Refactor code (REFACTOR)
# Improve code quality while tests pass

# 5. Commit when all tests pass
git add .
git commit -m "feat: implement feature X"
```

### 2. Adding New Components

```bash
# 1. Create component file
touch src/components/atoms/NewComponent.js

# 2. Create test file
touch tests/components/NewComponent.test.js

# 3. Write tests first (TDD)
npm run test:watch

# 4. Implement component
# Edit NewComponent.js

# 5. Verify accessibility
# Run with screen reader, check keyboard navigation
```

### 3. Adding API Endpoints

```bash
# 1. Create route file
touch src/app/api/your-endpoint/route.js

# 2. Create test file
touch tests/integration/api/your-endpoint.test.js

# 3. Define API contract in contracts/
# Edit api-spec.json

# 4. Write tests (TDD)
npm run test

# 5. Implement endpoint

# 6. Test manually
curl http://localhost:3000/api/your-endpoint
```

---

## 🎨 Styling with Tailwind

### Using Tailwind Classes

```jsx
// Mobile-first responsive design
<button className="
  w-full              // Full width on mobile
  md:w-auto          // Auto width on desktop
  px-4 py-2          // Padding
  bg-blue-500        // Background color
  hover:bg-blue-600  // Hover state
  text-white         // Text color
  rounded-lg         // Rounded corners
  min-h-[44px]       // Touch-friendly height (44px minimum)
">
  Submit
</button>
```

### Custom Configuration

Edit `tailwind.config.js` to add custom colors, spacing, etc:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

---

## 🚢 Ready to Code!

You're all set! Here's what to do next:

1. ✅ Development server running at [http://localhost:3000](http://localhost:3000)
2. ✅ MongoDB connected and ready
3. ✅ Tests passing: `npm run test`
4. ✅ Review [spec.md](./spec.md) for requirements
5. ✅ Review [data-model.md](./data-model.md) for schemas
6. ✅ Follow [TDD workflow](#1-tdd-cycle-constitution-requirement)

**Next steps**: Run `/speckit.tasks` to generate implementation tasks!

---

## 📞 Need Help?

- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 📖 [TailwindCSS Documentation](https://tailwindcss.com/docs)
- 📖 [MongoDB Documentation](https://www.mongodb.com/docs/)
- 📖 [Jest Documentation](https://jestjs.io/docs/getting-started)
- 📖 [Playwright Documentation](https://playwright.dev/docs/intro)

---

**Last Updated**: October 17, 2025  
**Feature Branch**: `001-daily-fasting-tracker`
