# Feature Specification: Biological Fasting Stages Timeline

**Feature Branch**: `026-biological-fasting-stages`  
**Created**: November 2, 2025  
**Status**: Draft  
**Input**: User description: "Replace the clock face visual in the fasting timer with a vertical timeline showing biological fasting stages. Display all completed stages in lighter color at the top, the current stage in darker/highlighted color in the middle, and all upcoming stages in lighter color at the bottom. Each stage shows the hour milestone and scientifically accurate description of what's happening in the body. Include a progress indicator showing how far through the current stage the user is (e.g., '1.5 hours into the 12-24 hour autophagy stage'). Research and use medically accurate fasting stage milestones and biological effects. The timeline should be scrollable to show all stages with the current stage always visible and emphasized."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Fasting Stage with Biological Context (Priority: P1)

When a user has an active fast, they see a vertical timeline showing all biological fasting stages from 0 hours to 72+ hours. The current stage they're in is highlighted prominently with darker styling, while completed stages above are lighter (showing past progress) and upcoming stages below are also lighter (showing what's ahead). Each stage displays the hour milestone and a scientifically accurate description of the biological processes occurring at that stage.

**Why this priority**: This is the core value proposition - transforming the timer from a simple elapsed time display into an educational tool that helps users understand what's happening in their body. This motivates users to continue fasting by showing them the biological benefits they're achieving at each stage.

**Independent Test**: Can be fully tested by creating an active fast and verifying the timeline displays with proper stage highlighting, scientific descriptions, and visual hierarchy. Delivers immediate educational value even as a standalone feature.

**Acceptance Scenarios**:

1. **Given** a user has an active fast of 14 hours, **When** they view the fasting timer, **Then** they see a vertical timeline with all stages (0-72+ hours) where the 12-16 hour stage is highlighted with darker background/border, stages before 12 hours have lighter styling (completed), and stages after 16 hours have lighter styling (upcoming)

2. **Given** a user views the biological stages timeline, **When** they read any stage, **Then** each stage displays the hour milestone (e.g., "12-16 Hours") and a scientifically accurate description of biological processes (e.g., "Ketosis begins - Body shifts from glucose to fat burning")

3. **Given** a user has an active fast of 2 hours, **When** they view the timeline, **Then** they see early stages (0-4 hours) with one stage highlighted as current, showing them they're in the initial digestion phase with relevant biological description

4. **Given** a user has an active fast of 36 hours, **When** they view the timeline, **Then** they see stages spanning from 0 to 72+ hours with the 24-48 hour autophagy stage highlighted, and can scroll to see all past and future stages

5. **Given** a user with an active fast refreshes the page, **When** the timer recalculates, **Then** the timeline automatically updates to highlight the correct current stage based on elapsed time

---

### User Story 2 - Track Progress Within Current Stage (Priority: P1)

Users see a visual progress indicator within the current fasting stage showing how far they've progressed through that specific stage. For example, if they're 1.5 hours into a 12-24 hour autophagy stage, they see both a visual progress bar and text indicator showing "1.5 hours into this stage" or similar feedback.

**Why this priority**: This adds granular motivation and progress tracking within each stage, helping users understand not just what stage they're in, but how close they are to the next milestone. This reduces the feeling of "stalling" during long stages.

**Independent Test**: Can be tested by creating fasts at different durations and verifying the progress indicator accurately reflects position within the current stage. Works independently and adds measurable value to the timeline.

**Acceptance Scenarios**:

1. **Given** a user has been fasting for 14 hours (in 12-16 hour stage), **When** they view the current stage, **Then** they see a progress indicator showing "2 hours into this stage" or "50% through this stage" with a visual progress bar

2. **Given** a user has just entered a new stage (e.g., exactly 16 hours), **When** they view the timeline, **Then** the progress indicator shows "Just started this stage" or "0 hours into this stage" at 0% progress

3. **Given** a user is near the end of a stage (e.g., 15.8 hours in a 12-16 hour stage), **When** they view the progress, **Then** they see "3.8 hours into this stage" or "95% through this stage" showing they're about to reach the next milestone

4. **Given** a user is in a long stage (e.g., 30 hours in a 24-48 hour stage), **When** they view the progress, **Then** they see "6 hours into this stage" or "25% through this stage" helping them track progress through extended fasting

5. **Given** the timer updates every 60 seconds, **When** a minute passes, **Then** the progress indicator updates to reflect the new elapsed time within the current stage

---

### User Story 3 - Scroll Through Full Timeline with Current Stage Visible (Priority: P2)

The biological stages timeline is scrollable to accommodate all stages from 0-72+ hours, with the current stage always emphasized and visible. When the page loads, the timeline automatically positions to show the current stage prominently, and users can scroll up to see completed stages or down to see upcoming stages.

**Why this priority**: Ensures usability for both short fasts (4-12 hours) and extended fasts (48-72 hours) without overwhelming the interface. The scrollable design with auto-positioning maintains focus on current progress while allowing exploration of all stages.

**Independent Test**: Can be tested by creating fasts of varying lengths and verifying the timeline scrolls properly, auto-positions to current stage, and maintains visual emphasis. Works independently as a UX enhancement.

**Acceptance Scenarios**:

1. **Given** a user has an active fast and loads the timer page, **When** the timeline renders, **Then** the viewport automatically scrolls to show the current stage in the visible area (centered or near-top) without requiring manual scrolling

2. **Given** a user views the timeline with a current stage visible, **When** they scroll up, **Then** they can view all completed stages with lighter styling, and the current stage remains visually emphasized even when scrolling

3. **Given** a user views the timeline, **When** they scroll down, **Then** they can view all upcoming stages with lighter styling to see what biological processes are ahead

4. **Given** a user is viewing completed or upcoming stages (scrolled away from current), **When** they observe the timeline, **Then** the current stage remains emphasized with darker styling to maintain visual anchor

5. **Given** a user has a very long fast (60+ hours), **When** they view the timeline, **Then** the scrollable area contains all stages up to 72+ hours with smooth scrolling and the current stage highlighted

---

### User Story 4 - Understand Stage Transitions and Milestones (Priority: P3)

Users clearly see when they transition from one biological stage to another, with visual feedback indicating milestone achievements. The timeline makes it obvious what hour markers define each stage boundary and what benefits unlock at each transition.

**Why this priority**: Adds motivational elements and clarity to the biological timeline, helping users understand the significance of reaching each new stage. This is less critical than displaying the stages themselves but enhances engagement.

**Independent Test**: Can be tested by observing the timer as it crosses stage boundaries (or simulating different elapsed times) and verifying clear visual distinction between stages and milestone markers.

**Acceptance Scenarios**:

1. **Given** a user views the timeline, **When** they examine stage boundaries, **Then** each stage clearly shows its hour range (e.g., "0-4 Hours", "4-8 Hours", "12-16 Hours") with visual separators between stages

2. **Given** a user reaches a new stage (e.g., transitions from 8 hours to 12 hours), **When** the timer updates, **Then** the highlighting shifts to the new current stage and the previous stage becomes lighter (completed styling)

3. **Given** a user views milestone transitions, **When** they read stage descriptions, **Then** each description explains what biological change occurs at that milestone (e.g., "Entering fat-burning mode" at 12 hours)

4. **Given** a user completes a significant milestone (e.g., 24 hours autophagy), **When** they view the timeline, **Then** the completed stage shows with lighter styling and any associated badge or achievement indicator

5. **Given** a user is curious about upcoming stages, **When** they scroll to future stages, **Then** they see clear hour markers and biological descriptions for what will happen when they reach those stages

---

### Edge Cases

- **Sub-1-hour fasts**: How does the timeline display when a fast is less than 1 hour old? (Show the 0-4 hour initial stage as current, with progress indicator showing fraction of first stage completed)

- **Exactly at stage boundary**: What happens when elapsed time is exactly at a stage transition (e.g., exactly 12 hours)? (User is considered to have just entered the new stage - show the 12-16 hour stage as current with 0% progress)

- **72+ hour extended fasts**: How does the timeline handle fasts beyond 72 hours? (Include a final "72+ Hours" stage with description of deep autophagy and cellular regeneration; progress indicator shows hours beyond 72)

- **Fast completed/broken**: What happens to the timeline when a fast is completed? (Timeline freezes at the final stage reached, with all completed stages shown in lighter styling and final stage highlighted showing total duration achieved)

- **No active fast**: What displays when there's no active fast? (Timeline component doesn't render - existing timer behavior of showing nothing or "No active fast" message remains)

- **Scroll behavior on mobile**: How does scrolling work on small mobile screens? (Timeline is scrollable with touch gestures, auto-positions to current stage on load, with sufficient padding to prevent awkward edge positions)

- **Stage data not loaded**: What happens if biological stage data fails to load? (Show error message: "Unable to load fasting stages. Please refresh the page." Fallback to showing elapsed time without stages)

- **Timer updates during scroll**: If user is scrolled to a future stage and the timer updates, does it auto-scroll back to current? (No - maintain user's scroll position to allow exploration; only auto-position on initial page load)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a vertical timeline of biological fasting stages ranging from 0 hours to 72+ hours when an active fast exists

- **FR-002**: System MUST highlight the current fasting stage with darker/prominent styling (darker background, stronger border, or enhanced elevation) while displaying completed stages above with lighter styling and upcoming stages below with lighter styling

- **FR-003**: System MUST display each stage with an hour range milestone (e.g., "0-4 Hours", "4-8 Hours", "12-16 Hours", "16-24 Hours", "24-48 Hours", "48-72 Hours", "72+ Hours") and a scientifically accurate description of biological processes occurring during that stage

- **FR-004**: System MUST research and use medically accurate fasting stage information from reputable scientific sources (peer-reviewed journals, university-press textbooks, or accredited research institutions), including but not limited to: insulin response phases, glycogen depletion, ketosis initiation, autophagy activation, growth hormone changes, and metabolic switching

- **FR-005**: System MUST include a progress indicator within the current stage showing how far the user has progressed through that specific stage, displaying both visual progress (e.g., progress bar) and text indicator (e.g., "1.5 hours into this stage")

- **FR-006**: System MUST make the timeline scrollable to accommodate all stages from 0-72+ hours without overwhelming the interface or requiring excessive viewport space

- **FR-007**: System MUST automatically position the timeline to show the current stage in the visible viewport area when the page loads, without requiring manual user scrolling to find their current position

- **FR-008**: System MUST maintain visual emphasis on the current stage even when user scrolls to view completed or upcoming stages, providing a consistent visual anchor

- **FR-009**: System MUST update the timeline highlighting and progress indicators every 60 seconds (matching existing timer update interval) to reflect current fasting duration

- **FR-010**: System MUST transition the current stage highlighting when elapsed time crosses a stage boundary (e.g., from 0-4 hours to 4-8 hours), moving the previous stage to "completed" lighter styling

- **FR-011**: System MUST integrate with existing timer infrastructure using the same data source (lastMealTime, date, isActive) without requiring schema changes or new API endpoints

- **FR-012**: System MUST maintain the existing glassmorphic design system with purple-pink-indigo gradient accents established in the application

- **FR-013**: System MUST be responsive and functional on mobile devices (320px+), tablets (768px+), and desktops (1024px+) with appropriate touch and scroll interactions

- **FR-014**: System MUST handle edge cases gracefully: sub-1-hour fasts, exact stage boundaries, 72+ hour fasts, completed fasts, and data loading errors

- **FR-015**: System MUST preserve the existing timer numeric display (days, hours, minutes) alongside the biological stages timeline, not replace it entirely

### Key Entities *(include if feature involves data)*

- **FastingStage**: Represents a biological phase during fasting
  - Attributes: hourRangeStart (number), hourRangeEnd (number), title (string), description (string), biologicalProcesses (array of strings)
  - No database storage - defined as static configuration data in the application code
  - Example: { hourRangeStart: 12, hourRangeEnd: 16, title: "Early Ketosis", description: "Body shifts from glucose to fat burning", biologicalProcesses: ["Ketone production begins", "Fat oxidation increases"] }

- **TimelineState**: Computed state representing user's position in the fasting timeline
  - Attributes: currentStageIndex (number), elapsedHours (number), progressWithinStage (number 0-1), stagesCompleted (array), stagesUpcoming (array)
  - Computed on-demand from existing Entry data (lastMealTime, current time)
  - Not persisted to database - calculated client-side in React component

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can immediately identify which biological fasting stage they're currently in within 3 seconds of viewing the timer

- **SC-002**: Users can scroll through and view all fasting stages (0-72+ hours) with the current stage remaining visually prominent

- **SC-003**: The timeline displays scientifically accurate biological information for each stage, verified against at least 3 reputable medical/scientific sources

- **SC-004**: The timeline updates within 60 seconds when crossing a stage boundary (e.g., moving from 11:50 hours to 12:10 hours crosses from one stage to another)

- **SC-005**: Users with fasts ranging from 1 hour to 72+ hours can view appropriate stage information with their current stage correctly highlighted

- **SC-006**: The progress indicator within the current stage accurately reflects percentage completion (within 1% accuracy based on elapsed time)

- **SC-007**: The timeline maintains the existing glassmorphic design aesthetic and integrates seamlessly with the current timer display

- **SC-008**: Mobile users (320px viewport) can scroll and interact with the timeline without horizontal overflow or touch interaction issues

- **SC-009**: The timeline loads and positions to the current stage within 500ms on initial page render

- **SC-010**: Users report increased understanding of fasting biology and increased motivation to reach the next stage milestone (qualitative feedback through user testing)

---

## Assumptions *(mandatory)*

- Users are interested in understanding the biological effects of fasting beyond just tracking elapsed time
- The existing timer numeric display (days, hours, minutes) provides value and should be retained alongside the new biological stages timeline
- Scientific consensus exists on approximate hour ranges for major biological fasting stages (insulin, ketosis, autophagy, etc.)
- Users will benefit from seeing all stages (past, current, future) rather than only the current stage
- The 60-second update interval established for the existing timer is sufficient for stage transition updates
- The existing design system (glassmorphic, gradient colors) should be maintained for visual consistency
- Users are primarily using the timer on the entries page or dashboard where vertical scroll space is available
- Mobile users are comfortable with vertical scrolling to view multiple stages

---

## Out of Scope *(mandatory)*

- **Custom stage definitions**: Users cannot define or customize their own fasting stages or hour ranges
- **Personalized biology**: Stage descriptions are generalized and do not account for individual metabolic differences, body composition, or prior fasting experience
- **Stage notifications**: No push notifications or alerts when crossing stage boundaries (may be considered in future feature)
- **Historical stage tracking**: No visualization of which stages were reached in past completed fasts
- **Medical advice**: Stage descriptions are educational and informational only, not medical advice or treatment recommendations
- **Stage comparison across fasts**: No analytics showing frequency of reaching specific stages over time
- **Interactive stage education**: No expandable sections, modal dialogs, or deep-dive educational content for each stage (keeping it simple)
- **Animation effects**: No complex animations or transitions when crossing stage boundaries (may add subtle effects in polish phase)
- **Clock face removal**: There is no "clock face visual" in the current implementation - the existing timer shows digital numbers. This feature adds a timeline, not removes something
- **Integration with wearables**: No API integration with fitness trackers or smartwatches to sync biometric data
- **Community features**: No social sharing of stage achievements or comparison with other users' stage progress

---

## Research Notes *(optional)*

### Biological Fasting Stages - Scientific Research

**Phase 1: Fed State (0-4 Hours)**
- **Biological Process**: Digestion and nutrient absorption
- **Scientific Basis**: After eating, insulin rises to facilitate glucose uptake. Blood glucose peaks 1-2 hours post-meal. The body is in anabolic (building) state, storing excess glucose as glycogen in liver and muscles.
- **Sources**: Berg et al., "Biochemistry" 8th Edition; Cahill, "Fuel Metabolism in Starvation" (Annual Review of Nutrition, 2006)

**Phase 2: Early Fasting (4-8 Hours)**
- **Biological Process**: Transition from fed to fasted state, insulin levels dropping
- **Scientific Basis**: Insulin begins declining. The body starts shifting from using dietary glucose to stored glycogen. Not yet in true fasting state but no longer digesting.
- **Sources**: Kerndt et al., "Fasting: The History, Pathophysiology and Complications" (Western Journal of Medicine, 1982)

**Phase 3: Glycogen Depletion Begins (8-12 Hours)**
- **Biological Process**: Liver glycogen breakdown accelerates, glucagon rises
- **Scientific Basis**: After 8-10 hours, liver glycogen stores begin significant depletion. Glucagon hormone rises to maintain blood glucose. Body prepares for metabolic switch.
- **Sources**: Rothman et al., "Decreased muscle glucose transport in diabetes" (Journal of Clinical Investigation, 1995)

**Phase 4: Early Ketosis (12-16 Hours)**
- **Biological Process**: Ketone production begins, fat oxidation increases
- **Scientific Basis**: As glycogen depletes, liver begins producing ketone bodies (beta-hydroxybutyrate, acetoacetate) from fatty acids. Metabolic switch from glucose to fat burning initiates.
- **Sources**: Cahill, "Fuel Metabolism in Starvation"; Veech, "The therapeutic implications of ketone bodies" (Prostaglandins, Leukotrienes and Essential Fatty Acids, 2004)

**Phase 5: Full Ketosis (16-24 Hours)**
- **Biological Process**: Deep fat burning, ketones become primary brain fuel
- **Scientific Basis**: Ketone levels rise to 0.5-3.0 mM. Brain begins using ketones for 30-40% of energy needs. Fat oxidation is dominant metabolic pathway. Insulin at baseline low levels.
- **Sources**: Owen et al., "Brain metabolism during fasting" (Journal of Clinical Investigation, 1967); Veech et al., ketone body research

**Phase 6: Autophagy Activation (24-48 Hours)**
- **Biological Process**: Cellular cleanup and recycling, autophagy peaks
- **Scientific Basis**: Autophagy (cellular self-cleaning) significantly increases after 24 hours of fasting. Damaged proteins and organelles are broken down and recycled. mTOR pathway suppressed, AMPK activated.
- **Sources**: Alirezaei et al., "Short-term fasting induces profound neuronal autophagy" (Autophagy, 2010); Levine & Kroemer, "Autophagy in the Pathogenesis of Disease" (Cell, 2008); Nobel Prize research by Yoshinori Ohsumi (2016)

**Phase 7: Deep Autophagy (48-72 Hours)**
- **Biological Process**: Peak autophagy, growth hormone surge, stem cell activation
- **Scientific Basis**: After 48 hours, autophagy is at peak levels. Growth hormone can increase 5-fold, preserving muscle mass. Immune system regeneration begins. Stem cell-based regeneration pathways activate.
- **Sources**: Longo & Mattson, "Fasting: Molecular Mechanisms and Clinical Applications" (Cell Metabolism, 2014); Cheng et al., "Prolonged fasting reduces IGF-1/PKA to promote hematopoietic stem cell regeneration" (Cell Stem Cell, 2014)

**Phase 8: Extended Fasting (72+ Hours)**
- **Biological Process**: Continued cellular regeneration, potential immune system reset
- **Scientific Basis**: Beyond 72 hours, body continues deep autophagy and cellular regeneration. Studies show potential for immune system rejuvenation. Ketone levels plateau at optimal ranges. Medical supervision recommended beyond this point.
- **Sources**: Cheng et al., stem cell research; Longo lab research on fasting-mimicking diets

### Design Considerations

- **Visual Hierarchy**: Use size, color intensity, and spacing to distinguish current stage from completed/upcoming stages
- **Glassmorphic Integration**: Apply subtle backdrop-blur, transparency, and gradient borders consistent with existing design system
- **Typography**: Use Inter font family (existing in project) with clear hierarchy for stage titles vs. descriptions
- **Color Progression**: Consider subtle color gradient shift through stages (lighter purple → pink → deeper purple) to show progression
- **Accessibility**: Ensure sufficient color contrast for text readability, use ARIA labels for screen readers
- **Mobile Optimization**: Stack stages vertically with touch-friendly tap targets, test on smallest viewport (320px)

### Technical Approach

- **Component Structure**: Create new `BiologicalStagesTimeline.js` component, integrate into existing `FastingTimer.js`
- **Data Source**: Define stage configuration as constant array in `src/lib/constants/fastingStages.js`
- **Stage Calculation**: Reuse existing `useFastingTimer` hook for elapsed time, compute current stage index based on elapsed hours
- **Scroll Behavior**: Use `useRef` and `scrollIntoView` to auto-position current stage on mount, allow manual scrolling
- **Performance**: Memoize stage calculations with `useMemo` to avoid unnecessary re-renders
- **Testing**: Unit tests for stage boundary logic, component tests for rendering, E2E tests for full user journey

---

## Dependencies *(optional)*

- **Feature 017 (Live Fasting Timer)**: This feature builds directly on the existing timer infrastructure, reusing the `useFastingTimer` hook, `FastingTimer` component, and timer update logic
- **Feature 025 (Entry Details Enhancement)**: Maintains the glassmorphic design system and gradient styling established in this feature
- **Feature 020 (Fasting Goal Timer)**: Shares the same `FastingGoalProvider` context and integrates alongside goal progress display

---

## Future Enhancements *(optional)*

- **Stage Achievement Badges**: Award badges for reaching significant milestones (first 24-hour fast, first 48-hour fast, etc.)
- **Stage Notifications**: Optional push notifications or in-app alerts when crossing into a new stage
- **Personalized Stages**: Adjust stage hour ranges based on user's fasting history, metabolism data, or biometric inputs
- **Expandable Stage Details**: Click/tap to expand each stage for deeper educational content, scientific citations, or tips
- **Historical Stage Analytics**: Dashboard widget showing frequency of reaching each stage over past 30/90 days
- **Animated Transitions**: Smooth animations when crossing stage boundaries or when current stage changes
- **Stage Comparison**: Compare current fast's stage progress to previous fasts or user averages
- **Community Milestones**: Show anonymized stats like "87% of users reach this stage" for motivation
- **Stage-Specific Tips**: Display actionable tips for each stage (e.g., "Drink electrolytes during deep ketosis")
- **Medical Disclaimer Modal**: Optional modal explaining that stage timings are approximate and vary by individual

