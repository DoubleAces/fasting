# Development Tasks: Daily Fasting Tracker

**Branch**: `001-daily-fasting-tracker` | **Generated**: October 17, 2025  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Workflow**: Following TDD mandatory requirement from constitution. Each task follows: Write Test → Implement → Refactor.

---

## Phase 0: Project Setup & Infrastructure

**Goal**: Establish development environment, configure tooling, and set up project structure.

### Task 0.1: Initialize Next.js Project
- [ ] Create Next.js 14 project with App Router
- [ ] Configure JavaScript (ES6+), no TypeScript
- [ ] Set up project structure (src/, app/, components/, lib/, tests/)
- [ ] Initialize git repository (already done, verify structure)
- [ ] Create `.env.local.example` with MongoDB URI template

**Acceptance Criteria**: 
- `npm run dev` starts development server
- App Router directory exists at `src/app/`
- Constitution-compliant folder structure matches plan.md

---

### Task 0.2: Configure TailwindCSS
- [ ] Install TailwindCSS 3 and dependencies
- [ ] Create `tailwind.config.js` with mobile-first breakpoints
- [ ] Configure `globals.css` with Tailwind directives
- [ ] Add custom configuration (44x44px touch targets, color palette)
- [ ] Verify hot reload works with Tailwind classes

**Acceptance Criteria**:
- TailwindCSS classes render correctly
- Mobile-first responsive breakpoints configured
- Touch target sizes meet WCAG requirements (44x44px minimum)

---

### Task 0.3: Set Up Testing Infrastructure
- [ ] Install Jest and React Testing Library
- [ ] Create `jest.config.js` with Next.js preset
- [ ] Set up test directory structure (unit/, integration/, components/, e2e/)
- [ ] Install Playwright for E2E testing
- [ ] Create `playwright.config.js`
- [ ] Add npm scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`
- [ ] Verify test runner works with sample test

**Acceptance Criteria**:
- `npm test` runs Jest tests successfully
- `npm run test:e2e` runs Playwright tests
- Test coverage reporting configured (80% minimum target)
- Test files follow naming convention (*.test.js, *.spec.js)

---

### Task 0.4: Configure MongoDB Connection
- [ ] Install Mongoose dependency
- [ ] Create `src/lib/db.js` with MongoDB connection logic
- [ ] Implement connection pooling and error handling
- [ ] Add environment variable validation
- [ ] **TEST**: Write unit test for connection initialization
- [ ] **TEST**: Write test for connection error handling
- [ ] Set up local MongoDB (Docker or MongoDB Atlas)

**Acceptance Criteria**:
- MongoDB connection established successfully
- Connection reused across API routes (singleton pattern)
- Environment variables validated on startup
- Tests pass for connection logic

**TDD Steps**:
1. Write test: `db.connect() should return valid connection`
2. Write test: `db.connect() should throw error with invalid URI`
3. Implement connection logic to pass tests
4. Refactor for connection pooling

---

## Phase 1: Data Layer (Models & Validation)

**Goal**: Implement MongoDB schemas, validation logic, and utility functions. All TDD-driven.

### Task 1.1: Create Entry Model (TDD)
- [ ] **TEST**: Write tests for Entry schema validation rules
  - Required fields: date, firstMealTime, lastMealTime
  - Optional fields: hoursOfSleep, morningWeight, hungerLevel, energyLevel, wellBeing, foodNotes
  - Date unique constraint
  - Time format validation (HH:mm)
- [ ] **IMPLEMENT**: Create `src/lib/models/Entry.js` with Mongoose schema
- [ ] Add virtuals for computed fields (e.g., formattedDate)
- [ ] Add indexes (date unique, createdAt for sorting)
- [ ] **REFACTOR**: Optimize schema performance

**Acceptance Criteria**:
- Entry model validates required fields
- Date uniqueness enforced at database level
- Virtual fields work correctly
- All tests pass (100% coverage for model)

**Test File**: `tests/unit/models/Entry.test.js`

---

### Task 1.2: Create Settings Model (TDD)
- [ ] **TEST**: Write tests for Settings schema validation
  - Required fields: userId (default: 'default')
  - measurementSystem enum: ['metric', 'imperial']
  - timeFormat enum: ['12h', '24h']
  - Default values test
- [ ] **IMPLEMENT**: Create `src/lib/models/Settings.js`
- [ ] Add static method to get or create default settings
- [ ] **REFACTOR**: Extract enum constants

**Acceptance Criteria**:
- Settings model validates enum values
- Default settings created for new user
- All tests pass

**Test File**: `tests/unit/models/Settings.test.js`

---

### Task 1.3: Build Date & Time Utilities (TDD)
- [ ] **TEST**: Write tests for date utilities
  - Parse date strings to Date objects
  - Format dates for display (locale-aware)
  - Compare dates (same day check)
  - Get yesterday's date
- [ ] **IMPLEMENT**: Create `src/lib/utils/dateUtils.js`
- [ ] **TEST**: Write tests for time utilities
  - Parse time strings (HH:mm format)
  - Convert between 12h/24h formats
  - Validate time format
  - Calculate time difference
- [ ] **IMPLEMENT**: Create `src/lib/utils/timeUtils.js`
- [ ] **REFACTOR**: Use date-fns for consistency

**Acceptance Criteria**:
- All date/time conversions work correctly
- Edge cases handled (midnight, invalid formats)
- 100% test coverage for utils
- date-fns integrated properly

**Test Files**: 
- `tests/unit/utils/dateUtils.test.js`
- `tests/unit/utils/timeUtils.test.js`

---

### Task 1.4: Build Fasting Duration Calculator (TDD)
- [ ] **TEST**: Write comprehensive tests for fasting calculation
  - Calculate duration between two times (same day)
  - Calculate duration spanning midnight
  - Handle missing previous day data (return null)
  - Handle invalid time formats
  - Test edge cases (24+ hour fasts, very short fasts)
- [ ] **IMPLEMENT**: Create `src/lib/utils/fastingCalculator.js`
  - `calculateFastingDuration(lastMealTime, firstMealTime, lastMealDate, firstMealDate)`
  - Return object: `{ hours, minutes, totalMinutes }`
- [ ] **REFACTOR**: Optimize calculation logic

**Acceptance Criteria**:
- Fasting calculation accurate across midnight boundary
- Returns null when previous day missing
- Formatted output (e.g., "16h 30m")
- All edge case tests pass

**Test File**: `tests/unit/utils/fastingCalculator.test.js`

**Example Tests**:
```javascript
// Last meal: 8 PM yesterday, First meal: 12 PM today = 16 hours
expect(calculateFastingDuration('20:00', '12:00', yesterday, today)).toEqual({ hours: 16, minutes: 0 })

// Last meal: 11 PM yesterday, First meal: 7 AM today = 8 hours
expect(calculateFastingDuration('23:00', '07:00', yesterday, today)).toEqual({ hours: 8, minutes: 0 })
```

---

### Task 1.5: Build Unit Conversion Utilities (TDD)
- [ ] **TEST**: Write tests for weight conversion
  - kg to lbs conversion
  - lbs to kg conversion
  - Rounding to 1 decimal place
  - Handle edge cases (zero, negative, very large numbers)
- [ ] **IMPLEMENT**: Create `src/lib/utils/unitConversion.js`
  - `kgToLbs(kg)` - multiply by 2.20462
  - `lbsToKg(lbs)` - divide by 2.20462
  - `convertWeight(value, fromUnit, toUnit)`
- [ ] **REFACTOR**: Add validation for numeric inputs

**Acceptance Criteria**:
- Conversion calculations accurate within 0.1 unit
- Invalid inputs handled gracefully
- All tests pass

**Test File**: `tests/unit/utils/unitConversion.test.js`

---

### Task 1.6: Create Form Validation Schemas (TDD)
- [ ] **TEST**: Write validation tests for entry data
  - Date required and valid format
  - First meal time after last meal time (same day)
  - Hours of sleep positive number
  - Weight positive number
  - Rating enums valid
- [ ] **IMPLEMENT**: Create `src/lib/validation/entrySchema.js` using Joi
- [ ] **TEST**: Write validation tests for settings data
- [ ] **IMPLEMENT**: Create `src/lib/validation/settingsSchema.js` using Joi
- [ ] Install Joi validation library

**Acceptance Criteria**:
- Invalid data rejected with clear error messages
- Valid data passes validation
- Schema reusable in API routes and forms
- All validation tests pass

**Test Files**:
- `tests/unit/validation/entrySchema.test.js`
- `tests/unit/validation/settingsSchema.test.js`

---

## Phase 2: API Layer (Backend Routes)

**Goal**: Implement RESTful API endpoints with full test coverage. Follow TDD cycle for each route.

### Task 2.1: Create GET /api/entries Route (TDD)
- [ ] **TEST**: Write integration tests
  - Returns 200 with array of entries
  - Returns entries sorted by date (newest first)
  - Returns empty array when no entries exist
  - Handles database errors gracefully (500)
- [ ] **IMPLEMENT**: Create `src/app/api/entries/route.js`
  - Export async `GET()` function
  - Connect to MongoDB
  - Query Entry model
  - Return JSON response
- [ ] **REFACTOR**: Extract query logic to service layer if needed

**Acceptance Criteria**:
- API returns correct status codes
- Data format matches API spec (api-spec.json)
- Sorting verified by tests
- Error handling tested

**Test File**: `tests/integration/api/entries.test.js`

**Related**: FR-013, FR-014

---

### Task 2.2: Create POST /api/entries Route (TDD)
- [ ] **TEST**: Write integration tests
  - Creates entry with valid data (201 status)
  - Returns created entry with ID
  - Rejects invalid data (400 status)
  - Rejects duplicate date (409 conflict)
  - Validates time format
  - Validates first meal > last meal constraint
- [ ] **IMPLEMENT**: Create `POST()` function in `src/app/api/entries/route.js`
  - Validate request body with Joi schema
  - Calculate fasting duration (fetch previous day)
  - Create Entry document
  - Return created entry
- [ ] **REFACTOR**: Extract fasting calculation to service

**Acceptance Criteria**:
- Entry created in database
- Fasting duration auto-calculated when previous day exists
- Validation errors return clear messages
- Duplicate prevention works
- All tests pass

**Test File**: `tests/integration/api/entries.test.js`

**Related**: FR-001, FR-002, FR-003, FR-011, FR-012

---

### Task 2.3: Create GET /api/entries/[id] Route (TDD)
- [ ] **TEST**: Write integration tests
  - Returns 200 with single entry for valid ID
  - Returns 404 for non-existent ID
  - Returns 400 for invalid ID format
- [ ] **IMPLEMENT**: Create `src/app/api/entries/[id]/route.js`
  - Export async `GET(request, { params })` function
  - Validate ObjectId format
  - Query by ID
  - Return entry or 404
- [ ] **REFACTOR**: Create reusable ID validation helper

**Acceptance Criteria**:
- Single entry retrieved correctly
- Error handling tested
- ID validation works

**Test File**: `tests/integration/api/entries-by-id.test.js`

**Related**: FR-013

---

### Task 2.4: Create PUT /api/entries/[id] Route (TDD)
- [ ] **TEST**: Write integration tests
  - Updates entry with valid data (200)
  - Returns updated entry
  - Rejects invalid data (400)
  - Returns 404 for non-existent ID
  - Recalculates fasting duration for next day when meal times change
  - Updates lastModified timestamp
- [ ] **IMPLEMENT**: Create `PUT()` function in `src/app/api/entries/[id]/route.js`
  - Validate request body
  - Find entry by ID
  - Update fields
  - Recalculate affected fasting durations (current + next day)
  - Return updated entry
- [ ] **REFACTOR**: Extract recalculation logic to service

**Acceptance Criteria**:
- Entry updates persisted
- Adjacent day fasting durations recalculated
- Validation works
- All tests pass

**Test File**: `tests/integration/api/entries-by-id.test.js`

**Related**: FR-017, FR-018

---

### Task 2.5: Create DELETE /api/entries/[id] Route (TDD)
- [ ] **TEST**: Write integration tests
  - Deletes entry and returns 204 (no content)
  - Returns 404 for non-existent ID
  - Recalculates fasting duration for next day after deletion
- [ ] **IMPLEMENT**: Create `DELETE()` function in `src/app/api/entries/[id]/route.js`
  - Find and delete entry
  - Recalculate next day's fasting duration
  - Return 204 status
- [ ] **REFACTOR**: Ensure cascade recalculation works

**Acceptance Criteria**:
- Entry deleted from database
- Next day entry loses fasting duration (set to null)
- All tests pass

**Test File**: `tests/integration/api/entries-by-id.test.js`

**Related**: FR-018

---

### Task 2.6: Create GET /api/settings Route (TDD)
- [ ] **TEST**: Write integration tests
  - Returns 200 with default settings if none exist
  - Returns existing settings if present
  - Handles database errors
- [ ] **IMPLEMENT**: Create `src/app/api/settings/route.js`
  - Export async `GET()` function
  - Query Settings model (userId: 'default')
  - Create default settings if none exist
  - Return settings
- [ ] **REFACTOR**: Cache settings in-memory for performance

**Acceptance Criteria**:
- Default settings returned for new users
- Existing settings retrieved correctly
- All tests pass

**Test File**: `tests/integration/api/settings.test.js`

**Related**: FR-019, FR-021

---

### Task 2.7: Create PUT /api/settings Route (TDD)
- [ ] **TEST**: Write integration tests
  - Updates settings with valid data (200)
  - Returns updated settings
  - Rejects invalid enum values (400)
  - Creates settings if none exist (upsert)
- [ ] **IMPLEMENT**: Create `PUT()` function in `src/app/api/settings/route.js`
  - Validate request body with Joi schema
  - Upsert settings (userId: 'default')
  - Return updated settings
- [ ] **REFACTOR**: Clear cache after update

**Acceptance Criteria**:
- Settings updated/created correctly
- Validation works for enums
- All tests pass

**Test File**: `tests/integration/api/settings.test.js`

**Related**: FR-019, FR-020, FR-021, FR-022

---

## Phase 3: UI Components (Atomic Design)

**Goal**: Build reusable, accessible components with React Testing Library. TDD for each component.

### Task 3.1: Create Atom Components (TDD)
Components: Button, Input, Select, Label, ErrorMessage, LoadingSpinner

- [ ] **TEST**: Button component tests
  - Renders with text
  - Handles click events
  - Supports disabled state
  - Has 44x44px minimum touch target
  - Supports variant prop (primary, secondary, danger)
- [ ] **IMPLEMENT**: Create `src/components/atoms/Button.js`
- [ ] **TEST**: Input component tests
  - Renders with label
  - Handles onChange
  - Supports various types (text, number, time)
  - Shows error state
  - Accessible (aria-labels, focus states)
- [ ] **IMPLEMENT**: Create `src/components/atoms/Input.js`
- [ ] **TEST**: Select component tests
  - Renders options from array
  - Handles selection change
  - Shows error state
  - Keyboard accessible
- [ ] **IMPLEMENT**: Create `src/components/atoms/Select.js`
- [ ] **TEST**: Label component tests
- [ ] **IMPLEMENT**: Create `src/components/atoms/Label.js`
- [ ] **TEST**: ErrorMessage component tests
- [ ] **IMPLEMENT**: Create `src/components/atoms/ErrorMessage.js`
- [ ] **TEST**: LoadingSpinner component tests
- [ ] **IMPLEMENT**: Create `src/components/atoms/LoadingSpinner.js`
- [ ] **REFACTOR**: Extract shared styles to TailwindCSS classes

**Acceptance Criteria**:
- All atoms render correctly
- Accessibility requirements met (WCAG 2.1 AA)
- Touch targets meet 44x44px minimum
- All component tests pass
- Storybook documentation (optional but recommended)

**Test Files**: `tests/components/atoms/*.test.js`

**Related**: Mobile-first responsive design principle, WCAG compliance

---

### Task 3.2: Create TimeInput Molecule (TDD)
- [ ] **TEST**: TimeInput component tests
  - Renders input field with label
  - Validates time format (HH:mm or h:mm AM/PM based on settings)
  - Shows error for invalid time
  - Supports 12h and 24h formats via prop
  - Accessible (aria-describedby for errors)
- [ ] **IMPLEMENT**: Create `src/components/molecules/TimeInput.js`
  - Use Input atom
  - Add time format validation
  - Support format switching based on user settings
- [ ] **REFACTOR**: Use timeUtils for validation

**Acceptance Criteria**:
- Time input validates correctly for both formats
- Error messages clear and helpful
- Keyboard accessible
- All tests pass

**Test File**: `tests/components/molecules/TimeInput.test.js`

**Related**: FR-002, FR-021, FR-022

---

### Task 3.3: Create RatingSelector Molecule (TDD)
- [ ] **TEST**: RatingSelector component tests
  - Renders radio buttons or select dropdown
  - Shows text labels (Low/Medium/High, etc.)
  - Handles selection change
  - Supports different rating scales via prop
  - Accessible (role="radiogroup", aria-labels)
- [ ] **IMPLEMENT**: Create `src/components/molecules/RatingSelector.js`
  - Accept options array prop: `[{value: 'low', label: 'Low'}, ...]`
  - Render as radio group or select based on prop
  - Handle onChange callback
- [ ] **REFACTOR**: Optimize for touch (larger touch targets for mobile)

**Acceptance Criteria**:
- Rating selection works correctly
- Supports different rating scales (hunger, energy, well-being)
- Keyboard and screen reader accessible
- All tests pass

**Test File**: `tests/components/molecules/RatingSelector.test.js`

**Related**: FR-007, FR-008, FR-009

---

### Task 3.4: Create FormField Molecule (TDD)
- [ ] **TEST**: FormField component tests
  - Wraps Input/Select with Label
  - Shows ErrorMessage when error prop provided
  - Renders help text
  - Generates unique IDs for accessibility
- [ ] **IMPLEMENT**: Create `src/components/molecules/FormField.js`
  - Compose Label + Input/Select + ErrorMessage
  - Generate unique ID for htmlFor/id association
  - Support optional help text
- [ ] **REFACTOR**: Use React.useId() for unique IDs

**Acceptance Criteria**:
- Form fields properly associated (label for input)
- Error messages linked with aria-describedby
- All tests pass

**Test File**: `tests/components/molecules/FormField.test.js`

---

### Task 3.5: Create EntryForm Organism (TDD)
Main form for logging daily entries. Complex component with many fields.

- [ ] **TEST**: EntryForm component tests
  - Renders all form fields (date, meal times, health metrics, food notes)
  - Validates required fields on submit
  - Shows validation errors
  - Submits valid data
  - Disables submit during API call
  - Shows success message after submit
  - Handles API errors
  - Pre-fills form for edit mode
  - Integrates with React Hook Form
- [ ] **IMPLEMENT**: Create `src/components/organisms/EntryForm.js`
  - Use React Hook Form for form state
  - Integrate with Joi validation schema
  - Compose FormField, TimeInput, RatingSelector molecules
  - Handle form submission (POST or PUT)
  - Show loading state during submit
  - Display success/error feedback
- [ ] **REFACTOR**: Extract API calls to custom hooks (useCreateEntry, useUpdateEntry)

**Acceptance Criteria**:
- Form submission works for create and update
- All validation rules enforced
- Loading states prevent double submission
- Accessible form labels and errors
- All tests pass (high coverage due to complexity)

**Test File**: `tests/components/organisms/EntryForm.test.js`

**Related**: FR-001 through FR-012, FR-017

---

### Task 3.6: Create EntryCard Organism (TDD)
Displays a single entry's data in a card format for history view.

- [ ] **TEST**: EntryCard component tests
  - Renders entry date prominently
  - Shows meal times formatted per user settings
  - Displays fasting duration (or "N/A")
  - Shows health metrics (weight converted to user's unit preference)
  - Shows rating labels (not numeric values)
  - Shows food notes if present
  - Renders edit and delete buttons
  - Handles edit click (calls callback)
  - Handles delete click (shows confirmation, calls callback)
- [ ] **IMPLEMENT**: Create `src/components/organisms/EntryCard.js`
  - Accept entry object and user settings as props
  - Format display values based on settings (time format, weight unit)
  - Implement edit/delete actions
  - Add confirmation dialog for delete
- [ ] **REFACTOR**: Extract formatting logic to custom hook (useEntryFormatting)

**Acceptance Criteria**:
- Entry displays correctly with proper formatting
- Edit/delete actions work
- Delete confirmation prevents accidental deletion
- Responsive on mobile
- All tests pass

**Test File**: `tests/components/organisms/EntryCard.test.js`

**Related**: FR-013, FR-014, FR-020, FR-022

---

### Task 3.7: Create HistoryList Organism (TDD)
- [ ] **TEST**: HistoryList component tests
  - Renders list of EntryCard components
  - Shows empty state when no entries
  - Maintains reverse chronological order
  - Handles loading state
  - Handles error state
  - Pagination controls work (if implemented)
- [ ] **IMPLEMENT**: Create `src/components/organisms/HistoryList.js`
  - Fetch entries from API (use SWR or React Query)
  - Map entries to EntryCard components
  - Show loading spinner during fetch
  - Show empty state message
  - Handle fetch errors
- [ ] **REFACTOR**: Use custom hook (useEntries) for data fetching

**Acceptance Criteria**:
- List displays correctly with proper sorting
- Loading and error states handled
- Empty state guides user to create first entry
- All tests pass

**Test File**: `tests/components/organisms/HistoryList.test.js`

**Related**: FR-013, FR-014

---

### Task 3.8: Create SettingsForm Organism (TDD)
- [ ] **TEST**: SettingsForm component tests
  - Renders measurement system radio buttons (metric/imperial)
  - Renders time format radio buttons (12h/24h)
  - Pre-fills with current settings
  - Saves settings on submit
  - Shows success message
  - Handles API errors
- [ ] **IMPLEMENT**: Create `src/components/organisms/SettingsForm.js`
  - Fetch current settings on mount
  - Use React Hook Form
  - Submit to PUT /api/settings
  - Show feedback after save
- [ ] **REFACTOR**: Use custom hook (useSettings) for settings management

**Acceptance Criteria**:
- Settings form loads and saves correctly
- UI updates immediately after save (optimistic update)
- All tests pass

**Test File**: `tests/components/organisms/SettingsForm.test.js`

**Related**: FR-019, FR-021

---

### Task 3.9: Create Layout Templates (TDD)
- [ ] **TEST**: PageLayout component tests
  - Renders children
  - Shows navigation menu
  - Responsive layout (mobile/desktop)
- [ ] **IMPLEMENT**: Create `src/components/templates/PageLayout.js`
  - Header with app title and navigation
  - Main content area
  - Footer (optional)
  - Mobile hamburger menu
- [ ] **TEST**: FormLayout component tests
- [ ] **IMPLEMENT**: Create `src/components/templates/FormLayout.js`
  - Centered form container
  - Max-width constraint for readability
  - Padding for mobile

**Acceptance Criteria**:
- Layouts render correctly on mobile and desktop
- Navigation works
- All tests pass

**Test Files**: `tests/components/templates/*.test.js`

---

## Phase 4: Pages & Application Flow

**Goal**: Build Next.js pages using components. Test user flows end-to-end.

### Task 4.1: Create Home/Dashboard Page (TDD)
- [ ] **TEST**: Write E2E tests for dashboard
  - Page loads successfully
  - Shows today's date prominently
  - Shows "Log Today's Entry" button
  - Shows recent entries preview (last 3 days)
  - Navigation to log page works
- [ ] **IMPLEMENT**: Create `src/app/page.js`
  - Use PageLayout template
  - Fetch recent entries (limit 3)
  - Display summary cards
  - Show call-to-action button
  - Link to log page and history page
- [ ] **REFACTOR**: Optimize data fetching (Server Component)

**Acceptance Criteria**:
- Dashboard provides quick overview
- Navigation to key features works
- E2E tests pass

**Test File**: `tests/e2e/dashboard.spec.js`

---

### Task 4.2: Create Log Entry Page (TDD)
- [ ] **TEST**: Write E2E tests for log entry page
  - Page renders EntryForm
  - User can create new entry
  - User can edit existing entry (when entry ID in URL)
  - Form validation errors shown
  - Success redirect after save
- [ ] **IMPLEMENT**: Create `src/app/log/page.js`
  - Check if entry for today exists (load for edit)
  - Render EntryForm component
  - Pass entry data for edit mode
  - Handle form submission success (redirect or show message)
- [ ] **REFACTOR**: Use searchParams for edit mode detection

**Acceptance Criteria**:
- Users can create and edit entries
- Form validation prevents invalid data
- E2E tests pass for full flow

**Test File**: `tests/e2e/log-entry.spec.js`

**Related**: FR-001 through FR-012, FR-017

---

### Task 4.3: Create History Page (TDD)
- [ ] **TEST**: Write E2E tests for history page
  - Page loads with entries list
  - Entries shown in reverse chronological order
  - Empty state shown when no entries
  - User can click entry to view details
  - User can edit entry from history
  - User can delete entry from history
- [ ] **IMPLEMENT**: Create `src/app/history/page.js`
  - Render HistoryList organism
  - Implement pagination (if needed)
  - Handle edit action (navigate to log page with ID)
  - Handle delete action (confirm and delete)
- [ ] **REFACTOR**: Add infinite scroll or pagination for large datasets

**Acceptance Criteria**:
- History view displays all entries correctly
- CRUD operations work from history page
- E2E tests pass

**Test File**: `tests/e2e/view-history.spec.js`

**Related**: FR-013, FR-014, FR-017

---

### Task 4.4: Create Settings Page (TDD)
- [ ] **TEST**: Write E2E tests for settings page
  - Page renders SettingsForm
  - User can change measurement system
  - User can change time format
  - Settings persist after save
  - UI updates reflect new settings (e.g., weight units change)
- [ ] **IMPLEMENT**: Create `src/app/settings/page.js`
  - Render SettingsForm organism
  - Show success message after save
  - Explain impact of settings changes
- [ ] **REFACTOR**: Add confirmation for measurement system change (affects existing data display)

**Acceptance Criteria**:
- Settings can be updated
- Changes reflected across the app immediately
- E2E tests pass

**Test File**: `tests/e2e/settings.spec.js`

**Related**: FR-019, FR-020, FR-021, FR-022

---

### Task 4.5: Create Root Layout (TDD)
- [ ] **TEST**: Test root layout rendering
  - Renders children correctly
  - Includes global styles
  - Sets up React Context providers
- [ ] **IMPLEMENT**: Create `src/app/layout.js`
  - Import globals.css
  - Set up SettingsProvider (React Context for user settings)
  - Add metadata (title, description)
  - Configure font (optional)
- [ ] **REFACTOR**: Optimize with Next.js font loading

**Acceptance Criteria**:
- Layout provides consistent structure
- Global state (settings) accessible to all pages
- Tests pass

**Test File**: `tests/components/layout.test.js`

---

## Phase 5: State Management & Context

**Goal**: Implement React Context for global settings. TDD for context logic.

### Task 5.1: Create Settings Context (TDD)
- [ ] **TEST**: SettingsContext tests
  - Provides settings to consuming components
  - Fetches settings from API on mount
  - Updates settings in context when changed
  - Persists settings to API
  - Handles loading and error states
- [ ] **IMPLEMENT**: Create `src/contexts/SettingsContext.js`
  - `SettingsProvider` component
  - `useSettings` custom hook
  - Fetch settings from /api/settings
  - Update settings via PUT /api/settings
  - Provide settings object and update function to consumers
- [ ] **REFACTOR**: Add local storage caching for offline support

**Acceptance Criteria**:
- Settings available globally without prop drilling
- Settings changes propagate to all components
- All tests pass

**Test File**: `tests/unit/contexts/SettingsContext.test.js`

**Related**: FR-019, FR-020, FR-021, FR-022

---

### Task 5.2: Create Custom Hooks for API Calls (TDD)
- [ ] **TEST**: useEntries hook tests
  - Fetches entries from API
  - Returns loading, error, and data states
  - Supports refetching
- [ ] **IMPLEMENT**: Create `src/hooks/useEntries.js` using SWR or React Query
- [ ] **TEST**: useCreateEntry hook tests
- [ ] **IMPLEMENT**: Create `src/hooks/useCreateEntry.js`
- [ ] **TEST**: useUpdateEntry hook tests
- [ ] **IMPLEMENT**: Create `src/hooks/useUpdateEntry.js`
- [ ] **TEST**: useDeleteEntry hook tests
- [ ] **IMPLEMENT**: Create `src/hooks/useDeleteEntry.js`
- [ ] **REFACTOR**: Centralize API base URL configuration

**Acceptance Criteria**:
- Hooks encapsulate API logic
- Components use hooks instead of direct fetch calls
- All hooks tested with mock API responses
- All tests pass

**Test Files**: `tests/unit/hooks/*.test.js`

---

## Phase 6: Accessibility & Responsiveness

**Goal**: Ensure WCAG 2.1 AA compliance and mobile-first responsive design.

### Task 6.1: Accessibility Audit & Fixes
- [ ] Run axe DevTools on all pages
- [ ] Fix color contrast issues (if any)
- [ ] Verify keyboard navigation works on all interactive elements
- [ ] Test screen reader compatibility (NVDA/JAWS)
- [ ] Add skip navigation links
- [ ] Ensure focus indicators visible
- [ ] Add ARIA labels where needed
- [ ] Test with keyboard only (no mouse)
- [ ] Verify semantic HTML usage

**Acceptance Criteria**:
- Zero axe violations on all pages
- All interactive elements keyboard accessible
- Screen reader announces content correctly
- Focus management works for modals/forms

**Related**: WCAG 2.1 AA compliance requirement

---

### Task 6.2: Responsive Design Testing
- [ ] Test all pages on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify touch targets ≥44x44px on mobile
- [ ] Test landscape and portrait orientations
- [ ] Verify forms usable on small screens
- [ ] Test with browser zoom (up to 200%)
- [ ] Ensure no horizontal scrolling

**Acceptance Criteria**:
- All pages responsive across breakpoints
- Touch targets meet minimum size
- Content readable at all zoom levels

**Related**: Mobile-first responsive design principle

---

### Task 6.3: Performance Optimization
- [ ] Run Lighthouse audit on all pages
- [ ] Optimize images (use Next.js Image component)
- [ ] Minimize JavaScript bundle size
- [ ] Enable code splitting (automatic in Next.js)
- [ ] Add loading skeletons for async content
- [ ] Optimize database queries (add indexes)
- [ ] Enable caching headers
- [ ] Test performance on slow 3G network

**Acceptance Criteria**:
- Lighthouse Performance score >90
- LCP <2.5s
- FID <100ms
- CLS <0.1
- Page loads <3s on 3G

**Related**: Performance optimization goal from research.md

---

## Phase 7: End-to-End Testing & Edge Cases

**Goal**: Write comprehensive E2E tests covering user stories and edge cases.

### Task 7.1: E2E Test - Complete User Journey
- [ ] **TEST**: Write Playwright test for full user flow
  - New user opens app for first time
  - Sets preferences in settings (metric, 24h)
  - Logs first day entry (no fasting duration shown)
  - Logs second day entry (fasting duration calculated)
  - Views history page (sees both entries)
  - Edits first entry (meal time changes)
  - Verifies second entry's fasting duration updated
  - Deletes second entry
  - Verifies first entry's fasting duration removed

**Acceptance Criteria**:
- E2E test passes consistently
- Tests cover happy path and major features

**Test File**: `tests/e2e/user-journey.spec.js`

**Related**: All user stories

---

### Task 7.2: E2E Test - Edge Cases
- [ ] **TEST**: Duplicate date entry prevention
- [ ] **TEST**: Invalid time format handling
- [ ] **TEST**: First meal before last meal validation
- [ ] **TEST**: Midnight boundary fasting calculation
- [ ] **TEST**: Editing entry affects adjacent entries
- [ ] **TEST**: Deleting entry affects next entry
- [ ] **TEST**: Measurement unit switching (existing data converts)
- [ ] **TEST**: Time format switching (display changes)
- [ ] **TEST**: Network error handling (API down)
- [ ] **TEST**: Very large weight values
- [ ] **TEST**: Negative weight values (should reject)
- [ ] **TEST**: Empty history view
- [ ] **TEST**: Very long food notes (text truncation)

**Acceptance Criteria**:
- All edge cases handled gracefully
- User-friendly error messages shown
- No data corruption or crashes

**Test File**: `tests/e2e/edge-cases.spec.js`

**Related**: Edge cases from spec.md

---

## Phase 8: Documentation & Deployment

**Goal**: Finalize documentation and prepare for deployment.

### Task 8.1: Update Documentation
- [ ] Update README.md with project overview
- [ ] Document environment variables (.env.local.example)
- [ ] Add setup instructions for developers
- [ ] Document API endpoints (link to api-spec.json)
- [ ] Add troubleshooting section
- [ ] Document deployment process
- [ ] Create user guide (how to use the app)
- [ ] Add screenshots to documentation

**Acceptance Criteria**:
- README is comprehensive and beginner-friendly
- New developers can set up project in <10 minutes
- All features documented

---

### Task 8.2: Code Quality & Linting
- [ ] Set up ESLint with Next.js config
- [ ] Fix all linting errors
- [ ] Run Prettier for code formatting
- [ ] Add pre-commit hooks (Husky + lint-staged)
- [ ] Ensure 80%+ test coverage achieved
- [ ] Run `npm audit` and fix security vulnerabilities
- [ ] Review and remove console.logs
- [ ] Remove unused dependencies

**Acceptance Criteria**:
- Zero linting errors
- Code formatted consistently
- Test coverage ≥80%
- No high/critical security vulnerabilities

---

### Task 8.3: Deployment Preparation
- [ ] Configure MongoDB Atlas production database
- [ ] Set up Vercel project (or chosen hosting)
- [ ] Configure environment variables in hosting platform
- [ ] Set up production build
- [ ] Test production build locally (`npm run build && npm run start`)
- [ ] Configure custom domain (optional)
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Configure analytics (privacy-respecting, optional)

**Acceptance Criteria**:
- App builds successfully for production
- Production environment variables configured
- Database accessible from hosting platform

---

### Task 8.4: Deploy to Production
- [ ] Deploy to Vercel (or chosen platform)
- [ ] Verify deployment successful
- [ ] Test all features in production
- [ ] Verify MongoDB connection works
- [ ] Test on real mobile devices
- [ ] Run Lighthouse audit on production URL
- [ ] Verify SSL certificate working
- [ ] Test from different networks (mobile data, WiFi)

**Acceptance Criteria**:
- App accessible at production URL
- All features working in production
- Performance metrics meet targets
- No console errors in production

---

## Phase 9: Post-Deployment & Monitoring

**Goal**: Monitor app in production and address any issues.

### Task 9.1: User Acceptance Testing
- [ ] Share app with beta users
- [ ] Collect feedback on usability
- [ ] Monitor error logs
- [ ] Track performance metrics
- [ ] Identify bugs or issues
- [ ] Prioritize fixes

**Acceptance Criteria**:
- At least 5 beta users test the app
- Feedback collected and documented
- Critical bugs fixed within 48 hours

---

### Task 9.2: Iterate Based on Feedback
- [ ] Review user feedback
- [ ] Create tickets for enhancements
- [ ] Fix reported bugs
- [ ] Improve UX based on feedback
- [ ] Update documentation with learnings

**Acceptance Criteria**:
- User feedback addressed
- App improved based on real-world usage

---

## Success Criteria Verification

**Before marking feature as COMPLETE, verify all success criteria from spec.md:**

- [ ] **SC-001**: Users can log daily entries with meal times, health metrics, and food notes
- [ ] **SC-002**: Fasting duration automatically calculated and displayed when previous day's data exists
- [ ] **SC-003**: Users can view all historical entries in reverse chronological order
- [ ] **SC-004**: Users can edit and delete previous entries
- [ ] **SC-005**: Users can configure measurement system (metric/imperial) and all weight values display in chosen unit
- [ ] **SC-006**: Users can configure time format (12h/24h) and all time values display in chosen format
- [ ] **SC-007**: Application is responsive and usable on mobile devices (touch targets ≥44x44px)
- [ ] **SC-008**: Application meets WCAG 2.1 Level AA accessibility standards

---

## Risk Mitigation

**Identified Risks**:

1. **Fasting Calculation Complexity**: Spanning midnight boundary can be error-prone
   - Mitigation: Write extensive unit tests for calculator (Task 1.4)
   
2. **Adjacent Entry Updates**: Editing one entry affects others
   - Mitigation: Test cascade updates thoroughly (Task 2.4, 7.2)
   
3. **Unit Conversion Accuracy**: Rounding errors in weight conversion
   - Mitigation: Store in single unit (kg) internally, convert for display only
   
4. **Time Format Confusion**: Switching between 12h/24h
   - Mitigation: Internal storage in 24h format, convert for display based on settings

5. **Mobile Performance**: Large history list may lag on mobile
   - Mitigation: Implement pagination or virtualized list (Task 4.3)

6. **Database Connection Issues**: MongoDB connection failures
   - Mitigation: Implement retry logic and clear error messages (Task 0.4)

---

## Definition of Done

A task is considered "done" when:

1. ✅ **Tests written first** (TDD) and all tests pass
2. ✅ **Implementation complete** and meets acceptance criteria
3. ✅ **Code reviewed** (self-review or peer review)
4. ✅ **No linting errors**
5. ✅ **Accessibility verified** (keyboard, screen reader if applicable)
6. ✅ **Responsive on mobile** (if UI component)
7. ✅ **Documentation updated** (if needed)
8. ✅ **Test coverage ≥80%** for the feature area
9. ✅ **Committed to git** with descriptive commit message

---

## Next Steps

1. **Start with Phase 0** (Project Setup)
2. **Follow TDD cycle** for each task: Red → Green → Refactor
3. **Run tests frequently** (on every save if possible)
4. **Commit after each completed task**
5. **Update this file** with progress (check off completed tasks)
6. **Push to GitHub** regularly
7. **Deploy to staging** after Phase 4 for early testing

---

**Estimated Timeline**: 3-4 weeks for solo developer following TDD (constitution requirement)

**Total Tasks**: 60+ individual tasks across 9 phases

**Current Progress**: 0/60 tasks complete (0%)

---

*Generated by `/speckit.tasks` on October 17, 2025*
