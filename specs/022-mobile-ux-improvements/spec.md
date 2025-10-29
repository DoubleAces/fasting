# Feature Specification: Mobile UX Quick Fixes

**Feature Branch**: `022-mobile-ux-improvements`  
**Created**: October 29, 2025  
**Status**: Draft  
**Input**: User description: "Mobile UX Quick Fixes - Make the fasting tracker feel more like a native mobile app. Currently the entries table requires horizontal scrolling on mobile and has desktop-sized spacing/typography. Fix these issues: (1) Hide non-essential columns on mobile - only show date, fast duration, and status. Add a 'View Details' button on each row. (2) Reduce padding and margins on mobile from 16px to 12px throughout the app. (3) Scale down typography - use 14px body text instead of 16px, h1 24px, h2 18px, h3 16px, tighter line-height 1.2-1.4. (4) Use system fonts for native feel (-apple-system, BlinkMacSystemFont). (5) Form optimization - stack inputs vertically on mobile, reduce field heights, bottom-aligned action buttons. (6) Use icon + number format to save space (⏱ 16h instead of 'Duration: 16 hours'). Goal: Fit 4-5 entries on mobile screen without scrolling, inspired by Zero app's compact design. Responsive breakpoint: <768px for mobile, ≥768px for desktop. These are CSS/layout changes only, no backend changes needed. Should take 2-3 hours max, delivers immediate high-impact mobile experience improvement."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Optimized Entries Table on Mobile (Priority: P1)

A mobile user views their entries list on a phone and sees a clean, compact table that fits naturally on their screen without requiring horizontal scrolling or excessive vertical scrolling, showing only the most essential information (date, fasting duration, view details action).

**Why this priority**: This is the most critical pain point. Currently users must scroll horizontally on mobile to see all entry columns, creating a poor experience. The entries list is the primary screen users interact with daily, so fixing this delivers immediate high-impact value and makes the app feel professional and mobile-native.

**Independent Test**: Can be fully tested by opening the entries list on a mobile device (<768px width), verifying that the table shows only Date, Fasting Duration, and View Details columns without horizontal scrolling, and that 4-5 entries fit on screen without vertical scrolling.

**Acceptance Scenarios**:

1. **Given** a user is viewing the entries list on a mobile device (<768px width), **When** the page loads, **Then** they see a table with only 3 columns: Date, Fasting Duration, and a "View Details" link/button
2. **Given** a user is viewing the entries list on mobile, **When** they scan the screen, **Then** they can see 4-5 complete entries without scrolling
3. **Given** a user is viewing the entries list on mobile, **When** they look at the table, **Then** there is no horizontal scrollbar and all content fits within the viewport width
4. **Given** a user is viewing the entries list on mobile, **When** they tap "View Details" on an entry, **Then** they navigate to the full entry details page
5. **Given** a user is viewing the entries list on desktop (≥768px width), **When** the page loads, **Then** they see the full table with all columns (Date, First Meal, Last Meal, Fasting, Weight, Sleep, Ratings, Actions)
6. **Given** a user is viewing the entries list on mobile, **When** viewing an extended fast entry (24+ hours), **Then** the fasting duration is displayed prominently (e.g., "26h 30m" in green/highlighted)

---

### User Story 2 - Compact Typography and Spacing (Priority: P2)

A mobile user navigates through the app and experiences tighter, more efficient spacing and typography that allows more content to fit on screen while remaining readable, making the app feel more like a native mobile application rather than a responsive website.

**Why this priority**: Desktop-sized padding (16px) and typography (16px body text) waste precious mobile screen space. Reducing padding to 12px and body text to 14px (following Zero app patterns) allows fitting 40% more content per screen while maintaining readability. This delivers significant UX improvement with minimal effort.

**Independent Test**: Can be fully tested by viewing any page on mobile and verifying that padding is reduced to 12px, body text is 14px, headings are appropriately sized (h1: 24px, h2: 18px, h3: 16px), and line-height is tighter (1.2-1.4), resulting in visibly more content per screen.

**Acceptance Scenarios**:

1. **Given** a user is viewing any page on mobile (<768px), **When** they inspect the layout, **Then** padding and margins are 12px instead of 16px (px-3, py-3 instead of px-4, py-4 in Tailwind)
2. **Given** a user is viewing any page on mobile, **When** they read body text, **Then** font size is 14px with line-height 1.3 (text-sm in Tailwind)
3. **Given** a user is viewing page headings on mobile, **When** they scan the page, **Then** h1 is 24px, h2 is 18px, h3 is 16px (text-2xl, text-lg, text-base in Tailwind)
4. **Given** a user is viewing any page on desktop (≥768px), **When** they inspect the layout, **Then** padding and typography remain at original desktop sizes (16px padding, 16px body text)
5. **Given** a user is viewing the dashboard on mobile, **When** they look at the screen, **Then** they can see at least 4-5 entries without scrolling (compared to 2-3 before)
6. **Given** a user is viewing entry form on mobile, **When** they read labels and help text, **Then** all text uses system fonts (-apple-system, BlinkMacSystemFont) for a native feel

---

### User Story 3 - Optimized Form Layout on Mobile (Priority: P3)

A mobile user fills out a form (new entry, edit entry, settings) and experiences a vertically stacked, compact layout with reduced field heights and bottom-aligned action buttons, making form completion faster and more natural on a touch device.

**Why this priority**: While not as critical as table and spacing fixes, form optimization significantly improves task completion speed on mobile. Stacking inputs vertically, reducing heights, and placing action buttons at the bottom follows mobile best practices and makes the app feel more polished.

**Independent Test**: Can be fully tested by opening any form on mobile, verifying that inputs stack vertically, field heights are reduced (min-height: 44px for touch targets but tighter vertical spacing), and primary action buttons are fixed at the bottom of the viewport or form container.

**Acceptance Scenarios**:

1. **Given** a user is viewing a form (EntryForm, SettingsForm, etc.) on mobile (<768px), **When** the form loads, **Then** all input fields are stacked vertically in a single column
2. **Given** a user is viewing a form on mobile, **When** they scroll through the form, **Then** input field heights are compact (min 44px for touch but reduced padding inside)
3. **Given** a user is viewing a form on mobile, **When** they reach the end of the form, **Then** the primary action button (Submit, Save, Update) is positioned at the bottom
4. **Given** a user is filling out a form on mobile, **When** they type in fields, **Then** labels and inputs have reduced spacing (8-12px gaps instead of 16px)
5. **Given** a user is viewing a form on desktop (≥768px), **When** the form loads, **Then** input fields may be arranged in multi-column layout where appropriate (e.g., meal time fields side-by-side)
6. **Given** a user is viewing the entries list on mobile, **When** they look at fasting durations, **Then** they see icon + number format (⏱ 16h instead of "Duration: 16 hours") saving space

---

### Edge Cases

- What happens when a mobile user rotates their device from portrait to landscape? (Answer: Layout should adapt using the same 768px breakpoint - landscape phones <768px still get mobile view, tablets ≥768px get desktop view)
- What happens when viewing on a very small phone (320px width)? (Answer: Layout must still work without horizontal scrolling; padding may reduce further if needed, text remains readable at 14px minimum)
- What happens when a very long fasting duration appears in mobile view (e.g., "148h 30m")? (Answer: Duration column should have sufficient width; text-overflow: ellipsis if necessary, full value visible on details page)
- What happens when user has browser zoom enabled on mobile? (Answer: Layout should remain functional; responsive breakpoints are based on viewport width which adjusts with zoom)
- What happens when entries table has only 1-2 entries on mobile? (Answer: Compact spacing should still apply; empty space below is acceptable, maintains consistent design)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST hide non-essential columns (First Meal, Last Meal, Weight, Sleep, Ratings, Actions) in entries table on viewports <768px wide
- **FR-002**: System MUST display only Date, Fasting Duration, and View Details link in entries table on mobile viewports (<768px)
- **FR-003**: System MUST show "View Details" link/button in each entry row on mobile that navigates to the entry details page
- **FR-004**: System MUST display full table with all columns on desktop viewports (≥768px)
- **FR-005**: System MUST apply 12px padding and margins to mobile layouts (<768px) instead of 16px
- **FR-006**: System MUST use 14px body text size on mobile viewports (<768px) with line-height 1.3
- **FR-007**: System MUST use heading sizes on mobile: h1 24px, h2 18px, h3 16px
- **FR-008**: System MUST use system fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto) for all text
- **FR-009**: System MUST stack form input fields vertically (single column) on mobile viewports (<768px)
- **FR-010**: System MUST reduce form field vertical spacing to 8-12px on mobile (<768px)
- **FR-011**: System MUST position primary form action buttons at the bottom of forms on mobile
- **FR-012**: System MUST display fasting durations using icon + number format (⏱ 16h 30m) on mobile to save space
- **FR-013**: System MUST ensure entries table has no horizontal scrolling on mobile viewports
- **FR-014**: System MUST fit 4-5 complete entries on mobile screen (375px × 667px) without vertical scrolling
- **FR-015**: System MUST maintain minimum touch target size of 44px for all interactive elements on mobile
- **FR-016**: System MUST preserve all existing functionality (navigation, edit, delete, view details) on mobile
- **FR-017**: System MUST apply mobile optimizations only to viewports <768px; desktop view (≥768px) must remain unchanged
- **FR-018**: System MUST handle very long fasting durations (>100 hours) without breaking mobile layout

### Key Entities

**No new entities** - This feature only modifies the presentation layer (CSS/layout) of existing entry data.

### Non-Functional Requirements

- **NFR-001**: Mobile layout changes must not impact page load performance (no additional JavaScript required)
- **NFR-002**: Typography changes must maintain WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- **NFR-003**: Reduced spacing must maintain WCAG 2.1 AA touch target sizes (44px minimum)
- **NFR-004**: Layout changes must work across all major mobile browsers (Safari iOS, Chrome Android, Samsung Internet)
- **NFR-005**: Changes must be purely CSS-based using Tailwind responsive utilities; no JavaScript media queries
- **NFR-006**: Implementation must follow existing Tailwind configuration and utility class patterns

## Success Criteria *(mandatory)*

Success is achieved when:

1. **SC-001**: Mobile users (viewport <768px) view entries table with only 3 columns and no horizontal scrolling
2. **SC-002**: Mobile users see 4-5 complete entries on screen (375px × 667px) without vertical scrolling
3. **SC-003**: All pages on mobile use 12px padding/margins and 14px body text with tighter line-height (1.2-1.4)
4. **SC-004**: Forms on mobile display single-column vertical layout with action buttons at bottom
5. **SC-005**: All text uses system fonts for native mobile feel
6. **SC-006**: Desktop view (≥768px) remains completely unchanged with all original columns and spacing
7. **SC-007**: Zero horizontal scrolling on any mobile page or component
8. **SC-008**: Task completion time for mobile users decreases by at least 25% (measured by time to view and edit entry)
9. **SC-009**: All interactive elements maintain 44px minimum touch targets on mobile (WCAG 2.1 AA)
10. **SC-010**: Mobile users report app feels "native" and "professional" in feedback

## Assumptions *(mandatory)*

1. **Responsive breakpoint**: Using 768px as the threshold between mobile (<768px) and desktop (≥768px) is consistent with existing Tailwind configuration
2. **Entries table**: Assumes EntryList component uses table element with thead/tbody structure that can be adapted with responsive Tailwind utilities
3. **Typography scale**: 14px body text remains readable on all mobile devices; industry standard minimum is 12px, we're using 14px for comfort
4. **System fonts**: All modern mobile browsers support -apple-system and BlinkMacSystemFont font stack
5. **Icon usage**: Assumes emoji icons (⏱, 😊) or simple text symbols are acceptable; no icon library installation needed
6. **Form structure**: Assumes forms already use Tailwind grid/flex utilities that can be modified with responsive breakpoints
7. **Testing viewport**: Using iPhone SE dimensions (375px × 667px) as minimum target; represents ~15% of mobile users
8. **Content priority**: Date and Fasting Duration are the most important columns on mobile; users can tap "View Details" for other data
9. **Performance**: Pure CSS changes have zero performance impact; no JavaScript execution or additional HTTP requests
10. **Browser support**: Targeting iOS Safari 14+, Chrome Android 90+, Samsung Internet 14+; covers 95%+ mobile users

## Dependencies *(mandatory)*

- **Existing EntryList component**: Located at `src/components/organisms/EntryList.js`, uses table structure
- **Existing Tailwind configuration**: Located at `tailwind.config.js`, already defines responsive breakpoints
- **Existing form components**: EntryForm, SettingsForm, LoginForm, RegisterForm, etc. all need mobile layout updates
- **Existing globals.css**: System font stack needs to be added or verified
- **Next.js Link component**: Already used in EntryList for navigation; "View Details" will use same pattern

## Out of Scope *(mandatory)*

The following are explicitly excluded from this feature:

1. **Backend changes**: No API modifications, no database schema changes, no server-side logic
2. **Card-based redesign**: Not replacing table with card components (that's Phase 2 in backlog)
3. **Timeline view**: Not implementing timeline/activity feed layout (that's Phase 4 in backlog)
4. **Bottom tab navigation**: Not adding bottom navigation bar (that's Phase 3 in backlog)
5. **Pull to refresh**: Not implementing native-style gestures (that's Phase 3 in backlog)
6. **New features**: No new columns, no new data fields, no new functionality
7. **Icon library installation**: Using emoji or basic text symbols; not installing Font Awesome, Heroicons, etc.
8. **Advanced responsive**: Not creating separate mobile/desktop components; using CSS media queries only
9. **Theme system**: Not implementing dark mode or theme switching
10. **Animation changes**: Not modifying existing animations or transitions beyond responsive behavior
11. **Loading states**: Not changing loading spinners, skeletons, or error messages
12. **Accessibility audit**: Assuming existing WCAG compliance is maintained; not conducting new accessibility testing
13. **Performance optimization**: Not optimizing images, code splitting, or caching beyond layout changes
14. **Browser polyfills**: Not adding support for IE11 or other legacy browsers

## Related Features

- **Feature 019 - Fix Entry Click Delay**: Already optimized entry list navigation with Link prefetch; mobile improvements complement this
- **Feature 011 - Entry Details Page**: Mobile users will tap "View Details" to see full entry data on details page
- **Feature 018 - Improve Form Inputs**: Enhanced form inputs will work with new mobile-optimized vertical layout
- **Phase 2 - Card-Based Entry List** (future): Mobile card view would replace this table-based mobile view
- **Phase 3 - Native App Feel** (future): Bottom tab navigation and gestures would build on these typography/spacing improvements
