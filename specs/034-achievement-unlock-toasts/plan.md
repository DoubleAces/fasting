# Implementation Plan: Achievement Unlock Toast Notifications

**Branch**: `034-achievement-unlock-toasts` | **Date**: November 8, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/034-achievement-unlock-toasts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement toast notifications in the EntryForm component to display newly unlocked achievements when users save or update fasting entries. The API already returns an `unlockedAchievements` array in the response from POST/PUT `/api/entries` endpoints (Feature 032), but the frontend currently ignores this data. This feature adds logic to check the response for unlocked achievements and display celebratory toast notifications with achievement name, icon, points earned, and rarity level. Multiple achievements are displayed in a single consolidated toast. Clicking the toast navigates to the `/achievements` page. This completes the achievement unlock feedback loop and provides immediate gratification for user progress.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js (App Router)  
**Primary Dependencies**: React Context (ToastContext), Next.js router, existing `useToast` hook  
**Storage**: N/A (frontend display only, uses API response data)  
**Testing**: Jest + React Testing Library for component tests, integration tests for EntryForm  
**Target Platform**: Web application (Next.js), mobile-responsive  
**Project Type**: Web application (frontend React component enhancement)  
**Performance Goals**: Toast display within 500ms of API response, smooth animations without UI blocking  
**Constraints**: Must not break existing entry save flow, must work on mobile devices (667px+ height), maximum 4 toasts displayed (existing toast system constraint)  
**Scale/Scope**: Single component modification (EntryForm), new achievement toast helper function, integration with existing toast system (Feature 021)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ **Next.js Best Practices**
- **Status**: PASS
- **Rationale**: Feature uses existing Client Component (EntryForm.js), leverages existing Context API (ToastContext), follows established patterns for form submission handling. No new Server/Client Component boundaries introduced.

### ✅ **Mobile-First Responsive Design**
- **Status**: PASS
- **Rationale**: Toasts are already mobile-responsive (Feature 021). Spec explicitly addresses mobile constraints (667px+ screen height - SC-010). Touch-friendly clickable toasts for navigation.

### ✅ **Test-Driven Development (NON-NEGOTIABLE)**
- **Status**: PASS
- **Rationale**: Spec includes comprehensive acceptance scenarios for all user stories. Tests will be written for achievement toast display logic, multiple achievement handling, error cases, and click navigation before implementation. Integration tests will verify EntryForm behavior with API responses containing unlocked achievements.

### ✅ **Component Architecture**
- **Status**: PASS
- **Rationale**: Feature enhances existing EntryForm component with new toast display logic. No new components required. Reuses existing ToastContext and toast display infrastructure. Follows composition pattern - achievement toast logic can be extracted to helper function if needed.

### ✅ **User Privacy & Data Security**
- **Status**: PASS / N/A
- **Rationale**: Feature displays achievement data already returned by authenticated API. No additional data collection, no new API calls, no security concerns. Uses existing secure authentication flow.

### ✅ **Performance & Accessibility**
- **Status**: PASS
- **Rationale**: 
  - Performance: Toast display is non-blocking, uses existing optimized toast system, <500ms display requirement (SC-001)
  - Accessibility: Spec includes edge case for screen reader support. Existing toast system likely has ARIA attributes (Feature 021). Will verify and enhance if needed. Keyboard navigation preserved (Escape key clears toasts).

**Overall Gate Status**: ✅ **PASS** - No constitution violations. Ready to proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```
specs/034-achievement-unlock-toasts/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for this feature
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Next.js Web Application Structure
src/
├── components/
│   └── organisms/
│       └── EntryForm.js           # MODIFY: Add achievement toast logic after API response
├── contexts/
│   └── ToastContext.js            # EXISTING: Provides useToast hook with showSuccess/showError
├── hooks/
│   └── useToast.js                # EXISTING: Re-exports useToast from ToastContext
├── lib/
│   └── utils/
│       └── achievementToast.js    # NEW: Helper function for formatting achievement toast content
└── app/
    ├── achievements/
    │   └── page.js                # EXISTING: Target page for toast click navigation
    └── api/
        └── entries/
            ├── route.js           # EXISTING: POST endpoint returns unlockedAchievements
            └── [id]/
                └── route.js       # EXISTING: PUT endpoint returns unlockedAchievements

tests/
├── unit/
│   ├── components/
│   │   └── EntryForm.achievement-toasts.test.js  # NEW: Unit tests for achievement toast logic
│   └── lib/
│       └── achievementToast.test.js               # NEW: Tests for helper function
└── integration/
    └── EntryForm.unlocked-achievements.test.js    # NEW: Integration test with API response
```

**Structure Decision**: This is a frontend enhancement to an existing Next.js web application. Primary modification is to the `EntryForm.js` component to handle `unlockedAchievements` from API responses. A new helper function `achievementToast.js` will format toast content. Leverages existing toast system infrastructure (Feature 021). No backend changes required - API already returns achievement data (Feature 032).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - Feature adheres to all constitution principles.

---

## Post-Design Constitution Re-Evaluation

*Re-check after Phase 1 design to confirm compliance*

### ✅ **Next.js Best Practices**
- **Status**: PASS (Confirmed)
- **Design Review**: 
  - Uses Client Component enhancement only (EntryForm.js)
  - No Server/Client boundary crossings introduced
  - Leverages existing Context API patterns
  - No new routing or page structure changes

### ✅ **Mobile-First Responsive Design**
- **Status**: PASS (Confirmed)
- **Design Review**:
  - Leverages existing responsive toast system (Feature 021)
  - Quickstart includes mobile testing checklist (667px minimum)
  - No new UI components - reuses existing toast infrastructure

### ✅ **Test-Driven Development**
- **Status**: PASS (Confirmed)
- **Design Review**:
  - Quickstart provides comprehensive test specifications
  - Unit tests for helper functions (achievementToast.js)
  - Integration tests for EntryForm with API responses
  - Manual QA checklist included
  - Tests cover success cases, error handling, edge cases

### ✅ **Component Architecture**
- **Status**: PASS (Confirmed)
- **Design Review**:
  - Helper function extracted to `lib/utils/achievementToast.js`
  - Modification confined to single component (EntryForm)
  - No prop drilling or state complexity added
  - Follows single responsibility principle

### ✅ **User Privacy & Data Security**
- **Status**: PASS / N/A (Confirmed)
- **Design Review**:
  - No new data collection or storage
  - Uses existing authenticated API data
  - No security implications

### ✅ **Performance & Accessibility**
- **Status**: PASS (Confirmed)
- **Design Review**:
  - <500ms toast display target documented
  - Error handling prevents blocking main flow
  - Accessibility considerations in research.md (screen readers, ARIA)
  - Mobile performance validated in quickstart QA

**Final Verdict**: ✅ **ALL GATES PASS** - Design maintains constitution compliance

---

## Implementation Readiness

**Status**: ✅ **READY FOR IMPLEMENTATION** (`/speckit.tasks`)

### Artifacts Delivered

1. ✅ **plan.md** - Technical context, constitution check, project structure
2. ✅ **research.md** - 5 research questions resolved, best practices documented
3. ✅ **data-model.md** - Data structures, flow, validation rules, integration points
4. ✅ **quickstart.md** - Step-by-step implementation guide with code samples
5. ✅ **Agent Context Updated** - Claude.md updated with feature technology stack

### No Contracts Needed

This feature is frontend-only with no API changes. The API contract already exists (Feature 032 - `unlockedAchievements` array in POST/PUT `/api/entries` responses). No `/contracts/` directory created as no new APIs are defined.

### Design Decisions Summary

1. **Toast Integration**: Use existing `showSuccess()` with formatted messages (not new toast type)
2. **Multiple Achievements**: Single consolidated toast (not sequential toasts)
3. **Rarity Styling**: Emoji-based differentiation (defer custom colors to future)
4. **Navigation**: Action button "View Achievements" (not click-anywhere)
5. **Error Handling**: Graceful degradation with fallback messages

### Next Steps

Run `/speckit.tasks` to generate implementation task breakdown (`tasks.md`).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

