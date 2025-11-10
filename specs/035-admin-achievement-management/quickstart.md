# Quickstart Guide: Feature 035 Admin Achievement Management

**Last Updated**: 2025-01-09  
**Feature Branch**: `035-admin-achievement-management`  
**Target Audience**: Developers implementing this feature

---

## Overview

This guide helps you set up your development environment and understand the architecture for implementing the Admin Achievement Management UI.

**What This Feature Does**:
- Provides admin-only UI for CRUD operations on achievements
- Supports multilingual content management (5 languages)
- Includes bulk operations, CSV import/export, and analytics dashboard
- Adds audit logging for all admin actions

---

## Prerequisites

### Required Knowledge
- Next.js 15 App Router (Server/Client Components)
- React 19 with hooks (useState, useEffect, useReducer)
- MongoDB + Mongoose ODM
- React Hook Form for complex forms
- TailwindCSS for styling

### Installed Tools
- Node.js 18+ (verify: `node --version`)
- MongoDB running locally or connection to remote instance
- Git (verify: `git --version`)

### Access Requirements
- Admin role in your dev database (check `User.role === 'admin'`)
- NextAuth session configured (existing from Feature 005)

---

## Quick Setup (5 Minutes)

### 1. Clone and Branch

```powershell
# Navigate to project root
cd "C:\Code projects\fasting"

# Ensure main branch is up to date
git checkout main
git pull origin main

# Create feature branch (may already exist)
git checkout -b 035-admin-achievement-management
```

### 2. Install Dependencies

```powershell
# No new dependencies required - feature uses existing stack
npm install

# Verify key packages are present:
# - next@15.5.6
# - react@19.1.0
# - mongoose@^8.0.0
# - react-hook-form@^7.0.0
# - tailwindcss@^3.0.0
```

### 3. Environment Variables

Add to `.env.local` (if not already present from Feature 005):

```env
# MongoDB (existing)
MONGODB_URI=mongodb://localhost:27017/fasting-tracker

# NextAuth (existing from Feature 005)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Admin Access (existing)
# Your dev user should have role='admin' in database
```

### 4. Database Setup

```powershell
# Ensure MongoDB is running
# Windows: Check Services or run: mongod

# Verify achievements collection exists (from Feature 028)
# Should have 81+ achievements already seeded
```

Run migration for new AdminAuditLog collection:

```powershell
# This will be created in migrations/ directory during implementation
node scripts/migrations/create-audit-log-collection.js
```

### 5. Verify Existing Admin Area

```powershell
# Start dev server
npm run dev

# Navigate to: http://localhost:3000/admin
# You should see existing admin dashboard (Feature 005)
# If redirected to login, your dev user needs role='admin'
```

---

## Architecture Overview

### File Structure

```
src/
├── app/
│   └── admin/
│       └── achievements/         # NEW - This feature's pages
│           ├── page.js           # List view
│           ├── create/page.js    # Create form
│           ├── [achievementId]/edit/page.js  # Edit form
│           ├── translations/page.js  # Translation manager
│           └── analytics/page.js     # Analytics dashboard
│
├── components/
│   └── admin/
│       └── achievements/         # NEW - Feature-specific components
│           ├── AchievementList.jsx
│           ├── AchievementForm.jsx  # Multi-step form
│           ├── ContentStep.jsx
│           ├── CriteriaStep.jsx
│           ├── MetadataStep.jsx
│           ├── SettingsStep.jsx
│           └── ...
│
├── lib/
│   ├── models/
│   │   ├── Achievement.js        # EXISTING (Feature 028)
│   │   ├── UserAchievement.js    # EXISTING (Feature 028)
│   │   └── AdminAuditLog.js      # NEW
│   │
│   ├── services/
│   │   ├── achievementAdminService.js  # NEW - Business logic
│   │   ├── auditLogService.js          # NEW
│   │   ├── csvService.js               # NEW
│   │   └── analyticsService.js         # NEW
│   │
│   └── middleware/
│       ├── adminAuth.js          # EXISTING (Feature 005)
│       └── rateLimit.js          # NEW
│
└── app/api/
    └── admin/
        └── achievements/         # NEW - API routes
            ├── route.js          # GET (list), POST (create)
            ├── [achievementId]/route.js
            ├── bulk-activate/route.js
            ├── translations/export/route.js
            └── analytics/route.js
```

### Data Flow

```
1. USER ACTION
   └─> Admin clicks "Create Achievement"

2. CLIENT-SIDE
   └─> src/app/admin/achievements/create/page.js
       └─> AchievementForm.jsx (multi-step)
           └─> React Hook Form validates
               └─> POST /api/admin/achievements

3. API LAYER
   └─> src/app/api/admin/achievements/route.js
       └─> adminAuth middleware (verify role)
       └─> rateLimit middleware (100 req/min)
       └─> achievementAdminService.create()

4. SERVICE LAYER
   └─> achievementAdminService.js
       └─> Achievement.create()
       └─> auditLogService.log({ action: 'create', ... })

5. DATABASE
   └─> achievements collection (new document)
   └─> adminauditlogs collection (audit entry)

6. RESPONSE
   └─> API returns { success: true, data: {...} }
       └─> Client updates UI, shows success toast
```

---

## Development Workflow

### TDD Approach (Mandatory per Constitution)

Follow this cycle for EVERY component, service, and API route:

```
1. RED: Write failing test
2. GREEN: Implement minimal code to pass
3. REFACTOR: Clean up without breaking tests
4. REPEAT: Move to next feature
```

**Example**: Creating `AchievementList` component

```powershell
# 1. Create test file FIRST
# tests/unit/components/admin/achievements/AchievementList.test.jsx

# 2. Write test (it will fail - component doesn't exist yet)
describe('AchievementList', () => {
  it('renders empty state when no achievements', () => {
    render(<AchievementList achievements={[]} />);
    expect(screen.getByText(/no achievements/i)).toBeInTheDocument();
  });
});

# 3. Run test (should fail)
npm test -- AchievementList.test.jsx

# 4. Create component with minimal implementation
# src/components/admin/achievements/AchievementList.jsx
export default function AchievementList({ achievements }) {
  if (achievements.length === 0) {
    return <div>No achievements found</div>;
  }
  return null;
}

# 5. Run test (should pass)
npm test -- AchievementList.test.jsx

# 6. Refactor and add more tests iteratively
```

### Running Tests

```powershell
# Unit tests (Jest + React Testing Library)
npm test

# Watch mode (recommended during development)
npm test -- --watch

# Specific test file
npm test -- AchievementForm.test.jsx

# Coverage report (must reach 80% per constitution)
npm test -- --coverage

# Integration tests (API routes)
npm run test:integration

# E2E tests (Playwright - run dev server first)
npm run dev  # Terminal 1
npm run test:e2e  # Terminal 2
```

### Code Quality Checks

```powershell
# ESLint (auto-fix when possible)
npm run lint
npm run lint -- --fix

# Prettier (format all files)
npm run format

# Type checking (if using JSDoc)
npm run typecheck

# Pre-commit hook will run these automatically
```

---

## Key Implementation Patterns

### 1. Multi-step Form (FR-012 to FR-025)

Use React Hook Form with custom stepper:

```javascript
// src/components/admin/achievements/AchievementForm.jsx
import { useForm, FormProvider } from 'react-hook-form';
import { useState } from 'react';

const STEPS = [
  { id: 'content', component: ContentStep },
  { id: 'criteria', component: CriteriaStep },
  { id: 'metadata', component: MetadataStep },
  { id: 'settings', component: SettingsStep }
];

export default function AchievementForm({ initialData, onSubmit }) {
  const methods = useForm({ defaultValues: initialData });
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = async () => {
    const valid = await methods.trigger(); // Validate current step
    if (valid) setCurrentStep(prev => prev + 1);
  };
  
  const handleSubmit = methods.handleSubmit(async (data) => {
    await onSubmit(data);
  });
  
  const StepComponent = STEPS[currentStep].component;
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <StepComponent />
        {/* Stepper navigation */}
      </form>
    </FormProvider>
  );
}
```

### 2. Server Components + Client Components

Leverage Next.js 15 hybrid rendering:

```javascript
// src/app/admin/achievements/page.js (SERVER COMPONENT)
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import AchievementList from '@/components/admin/achievements/AchievementList';

export default async function AchievementsPage({ searchParams }) {
  const session = await getServerSession();
  if (session?.user?.role !== 'admin') redirect('/');
  
  // Fetch data server-side (fast, no loading state)
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/achievements?page=${searchParams.page || 1}`);
  const data = await response.json();
  
  return <AchievementList initialData={data} />;
}
```

```javascript
// src/components/admin/achievements/AchievementList.jsx (CLIENT COMPONENT)
'use client';

import { useState } from 'react';

export default function AchievementList({ initialData }) {
  const [achievements, setAchievements] = useState(initialData.data);
  
  const handleSearch = async (query) => {
    // Client-side interaction
    const res = await fetch(`/api/admin/achievements?search=${query}`);
    const data = await res.json();
    setAchievements(data.data);
  };
  
  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {/* Table rendering */}
    </div>
  );
}
```

### 3. API Route with Middleware

```javascript
// src/app/api/admin/achievements/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuth } from '@/lib/middleware/adminAuth';
import { rateLimit } from '@/lib/middleware/rateLimit';
import achievementAdminService from '@/lib/services/achievementAdminService';

export async function GET(request) {
  // 1. Authentication
  const session = await getServerSession();
  if (!adminAuth(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 2. Rate limiting
  const limited = await rateLimit(request, { limit: 100, window: 60000 });
  if (limited) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  
  // 3. Parse query params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search');
  
  // 4. Service layer
  const result = await achievementAdminService.list({ page, search });
  
  // 5. Audit logging
  await auditLogService.log({
    userId: session.user.id,
    action: 'view-list',
    resource: 'achievement'
  });
  
  return NextResponse.json(result);
}
```

### 4. Audit Logging Pattern

Every admin action must be logged:

```javascript
// src/lib/services/auditLogService.js
import AdminAuditLog from '@/lib/models/AdminAuditLog';

export async function log({ userId, action, resource, resourceId, changes, req }) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.ip;
  const userAgent = req.headers.get('user-agent');
  
  await AdminAuditLog.create({
    timestamp: new Date(),
    userId,
    action,
    resource,
    resourceId,
    changes,
    ipAddress,
    userAgent
  });
}
```

---

## Testing Strategy

### Unit Tests (80% Coverage Target)

**Components**:
```javascript
// tests/unit/components/admin/achievements/AchievementForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AchievementForm from '@/components/admin/achievements/AchievementForm';

describe('AchievementForm', () => {
  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<AchievementForm onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText(/save/i));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('submits valid form data', async () => {
    const onSubmit = jest.fn();
    render(<AchievementForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Achievement' } });
    // ... fill other fields
    
    fireEvent.click(screen.getByText(/save/i));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        translations: { en: { name: 'Test Achievement' } }
      }));
    });
  });
});
```

**Services**:
```javascript
// tests/unit/lib/services/achievementAdminService.test.js
import achievementAdminService from '@/lib/services/achievementAdminService';
import Achievement from '@/lib/models/Achievement';

jest.mock('@/lib/models/Achievement');

describe('achievementAdminService', () => {
  describe('create', () => {
    it('creates achievement with audit log', async () => {
      const mockAchievement = { achievementId: 'test-achievement', ... };
      Achievement.create.mockResolvedValue(mockAchievement);
      
      const result = await achievementAdminService.create({
        translations: { en: { name: 'Test' } },
        tier: 'bronze'
      }, { userId: 'admin-123' });
      
      expect(Achievement.create).toHaveBeenCalledWith(expect.objectContaining({
        achievementId: 'test-achievement'
      }));
      
      expect(result).toEqual(mockAchievement);
    });
  });
});
```

### Integration Tests (API Routes)

```javascript
// tests/integration/api/admin/achievements/crud.test.js
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/admin/achievements/route';

describe('/api/admin/achievements', () => {
  it('requires admin authentication', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });
  
  it('creates achievement with valid data', async () => {
    // Mock authenticated admin session
    jest.mock('next-auth', () => ({
      getServerSession: jest.fn(() => ({
        user: { id: 'admin-123', role: 'admin' }
      }))
    }));
    
    const { req } = createMocks({
      method: 'POST',
      body: {
        translations: { en: { name: 'New Achievement', ... } },
        tier: 'bronze',
        category: 'fasting'
      }
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.achievementId).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```javascript
// tests/e2e/admin-achievements.spec.js
import { test, expect } from '@playwright/test';

test.describe('Admin Achievement Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });
  
  test('creates new achievement end-to-end', async ({ page }) => {
    await page.goto('/admin/achievements');
    await page.click('text=Create Achievement');
    
    // Step 1: Content
    await page.fill('[name="translations.en.name"]', 'Test E2E Achievement');
    await page.fill('[name="translations.en.description"]', 'E2E test description');
    await page.click('text=Next');
    
    // Step 2: Criteria
    await page.selectOption('[name="criteria.type"]', 'fasting-hours');
    await page.fill('[name="criteria.value"]', '10');
    await page.click('text=Next');
    
    // Step 3: Metadata
    await page.selectOption('[name="category"]', 'fasting');
    await page.selectOption('[name="tier"]', 'bronze');
    await page.click('text=Next');
    
    // Step 4: Settings
    await page.check('[name="isActive"]');
    await page.click('text=Create Achievement');
    
    // Verify success
    await expect(page.locator('text=Achievement created successfully')).toBeVisible();
    await expect(page).toHaveURL('/admin/achievements');
    await expect(page.locator('text=Test E2E Achievement')).toBeVisible();
  });
});
```

---

## Common Gotchas

### 1. achievementId Generation

```javascript
// ❌ WRONG: Using _id (ObjectId) as identifier
const achievement = await Achievement.findById(req.params.id);

// ✅ CORRECT: Using achievementId (slug)
const achievement = await Achievement.findOne({ achievementId: req.params.achievementId });
```

### 2. Translation Consistency

```javascript
// ❌ WRONG: Partial translations cause UI issues
translations: {
  es: { name: 'Nombre' }  // Missing description and iconUrl
}

// ✅ CORRECT: All-or-nothing per language
translations: {
  es: {
    name: 'Nombre',
    description: 'Descripción',
    iconUrl: '/icons/achievement.svg'
  }
}
```

### 3. Rate Limiting

```javascript
// ❌ WRONG: No rate limit protection
export async function POST(request) {
  return achievementAdminService.create(await request.json());
}

// ✅ CORRECT: Apply rate limit middleware (100 req/min)
export async function POST(request) {
  const limited = await rateLimit(request, { limit: 100, window: 60000 });
  if (limited) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  
  return achievementAdminService.create(await request.json());
}
```

### 4. Audit Logging

```javascript
// ❌ WRONG: Forgetting to log admin actions
await Achievement.create(data);

// ✅ CORRECT: Always log via service layer
await achievementAdminService.create(data, { userId, req });
// Service calls auditLogService.log() automatically
```

---

## Debugging Tips

### Check Admin Access

```javascript
// In browser console at /admin/achievements
console.log(await fetch('/api/auth/session').then(r => r.json()));
// Should show: { user: { role: 'admin', ... } }
```

### View Audit Logs

```javascript
// In MongoDB shell or Compass
db.adminauditlogs.find({ userId: ObjectId("your-admin-id") }).sort({ timestamp: -1 }).limit(10);
```

### Test Rate Limiting

```powershell
# Send 100 requests in 1 minute (should succeed)
for ($i=1; $i -le 100; $i++) {
  curl http://localhost:3000/api/admin/achievements
}

# 101st request should return 429
```

### Check CSV Import Errors

```javascript
// In browser network tab, check response from:
// POST /api/admin/achievements/translations/import

// Response includes:
{
  "summary": {
    "totalRows": 250,
    "processed": 245,
    "errors": [
      { "row": 12, "error": "Invalid language code" }
    ]
  }
}
```

---

## Performance Benchmarks

Target performance (from success criteria):

| Operation | Target | How to Measure |
|-----------|--------|----------------|
| Achievement list load | <2 seconds | Network tab: `/api/admin/achievements` response time |
| Search results | <500ms | Network tab: `/api/admin/achievements?search=...` |
| Save achievement | <1.5s | Network tab: `POST /api/admin/achievements` |
| Analytics calculation | 3-5s | Network tab: `/api/admin/achievements/analytics` |
| CSV export | <5s | Network tab: `GET /api/admin/achievements/translations/export` |
| CSV import (500 rows) | <10s | Network tab: `POST /api/admin/achievements/translations/import` |

**Lighthouse Audit** (FR-070):
```powershell
npm run lighthouse -- http://localhost:3000/admin/achievements

# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: N/A (admin area, no SEO needed)
```

---

## Next Steps

1. **Read the Specification**: `specs/035-admin-achievement-management/spec.md`
2. **Review Data Models**: `specs/035-admin-achievement-management/data-model.md`
3. **Study API Contracts**: `specs/035-admin-achievement-management/contracts/achievements-api.yaml`
4. **Check Tasks Breakdown**: `specs/035-admin-achievement-management/tasks.md` (generated by `/speckit.tasks`)
5. **Start with TDD**: Write first test, implement, repeat

---

## Useful Resources

### Internal Documentation
- **Feature 005**: Admin area setup, AdminLayout component, authentication middleware
- **Feature 028**: Achievement and UserAchievement models (existing schemas)
- **Constitution**: `.specify/memory/constitution.md` (project standards)
- **Style Guide**: Design system components in `src/components/atoms/`, `src/components/molecules/`

### External References
- [Next.js 15 App Router Docs](https://nextjs.org/docs/app)
- [React Hook Form v7](https://react-hook-form.com/)
- [Mongoose Schema Docs](https://mongoosejs.com/docs/guide.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)

---

## Support

Questions? Issues? Check:
1. **Spec clarifications section**: `specs/035-admin-achievement-management/spec.md`
2. **Known test issues**: `docs/KNOWN-TEST-ISSUES.md`
3. **Project constitution**: `.specify/memory/constitution.md`

Happy coding! 🚀
