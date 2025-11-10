# Feature Backlog - Fasting Tracker

**Last Updated**: November 9, 2025  
**Completed Features**: 001-034 (All shipped!)
**Note**: This backlog has been audited against the actual codebase. Only features NOT yet implemented are listed below.

---

## ✅ Recently Completed (Features 028-034)

### Feature 034: Achievement Unlock Toast Notifications (November 9, 2025)
- ✅ **Achievement toast helper** - formatAchievementToast() with validation, truncation, fallback messages
- ✅ **Rarity-based emojis** - 🏆 Common, ⭐ Rare, 🎉 Epic, ✨ Legendary
- ✅ **Multi-achievement consolidation** - Single toast for 2-3 achievements, truncation for 4+
- ✅ **EntryForm integration** - Displays toast after entry save with "View Achievements" action button
- ✅ **Navigation integration** - Routes to /achievements page on button click
- ✅ **Error handling** - Graceful degradation, validation filters malformed data, entry save never blocked
- ✅ **27+ unit tests passing** (getRarityEmoji, formatAchievementToast, edge cases)
- ✅ **15+ integration tests** (EntryForm behavior, navigation, error scenarios)
- 🚀 **Production-ready** - All automated tasks complete, manual QA pending

### Feature 033: Admin Achievement Backfill (November 2025)
- ✅ Admin-only backfill endpoint for historical achievement evaluation
- ✅ Dry-run mode for testing without database changes
- ✅ Progress tracking with detailed results
- ✅ Batch processing for all users or specific user

### Feature 032: Achievement Unlock API Response (November 2025)
- ✅ POST/PUT /api/entries returns unlockedAchievements array
- ✅ Integration with AchievementService evaluation
- ✅ Non-blocking achievement evaluation
- ✅ Detailed achievement metadata in response

### Feature 031: Achievement Unlock Logic (November 7, 2025)
- ✅ **AchievementService** with 6 evaluator methods (Duration, Streak, Goal, Entry Count, Weight, Custom)
- ✅ **evaluateAndUnlock orchestrator** - Coordinates all evaluators with Promise.all
- ✅ **Batch unlocking** - Creates UserAchievement records with E11000 duplicate handling
- ✅ **API Integration** - POST/PUT /api/entries evaluate achievements and return unlockedAchievements
- ✅ **SimpleCache utility** - 1-hour TTL for achievement definitions
- ✅ **calculateStreak helper** - Detects consecutive daily fasting patterns
- ✅ **Error resilience** - Non-blocking, graceful degradation
- ✅ **60/60 tests passing** (46 unit + 14 integration)
  - Duration evaluator: 7 tests
  - Streak evaluator: 8 tests
  - Goal evaluator: 6 tests
  - Batch unlocking: 7 tests
  - Orchestrator: 7 tests
  - Helper functions: 11 tests
  - Integration flows: 6 tests
  - Error resilience: 8 tests
- ✅ **Performance validated**: <7s test suite, <100ms individual operations
- 📝 Entry Count, Weight, and Custom evaluators stubbed for post-MVP (P3)
- 🚀 **Production deployed** - Ready for user achievement unlocking

### Feature 030: Achievement Content Seed Data (November 6, 2025)
- ✅ 81 comprehensive achievements across 8 categories
- ✅ Bilingual content (English/Spanish) for all achievements
- ✅ Balanced rarity distribution (40% common, 26% rare, 22% epic, 12% legendary)
- ✅ Point scaling system (5-500 points based on rarity)
- ✅ 5 secret achievements (hidden until unlocked)
- ✅ Database seed script with idempotent upsert pattern
- ✅ 16/16 tests passing (10 unit + 6 integration)
- ✅ Achievements page updated with gradient highlighting and pagination fix

### Feature 029: Achievement API Endpoints (November 2025)
- ✅ GET /api/user/achievements - List all achievements with user progress
- ✅ Pagination, filtering, and sorting
- ✅ Category and status filters
- ✅ Secret achievement handling
- ✅ Multilingual translation support

### Feature 028: Achievement Badges Database Models (November 2025)
- ✅ Achievement model with multilingual support
- ✅ UserAchievement model for tracking unlocks
- ✅ Flexible criteria system for unlock conditions
- ✅ Rarity and point system
- ✅ Secret achievements support

### Feature 027: Timer Date Crossing Bug Fix (November 4, 2025)
- Fixed critical bug where timer showed 0:00:00 at month boundaries
- Replaced manual calendar arithmetic with native Date API
- All 8 comprehensive tests passing

### Feature 026: Biological Fasting Stages Timeline (November 2025)
- 10-stage fasting timeline with hormonal markers
- Real-time stage tracking in live timer
- Collapsible/expandable timeline view

### Feature 025: Entry Details Enhancement (October 2025)
- Share functionality for entries
- Enhanced navigation
- Dashboard chart integration

### Feature 024: User Dashboard (October 2025)
- ✅ Current fast timer with live updates
- ✅ Streak counter (current & longest)
- ✅ Key statistics (total fasts, average duration)
- ✅ Weight progress chart (Recharts line chart)
- ✅ Recent fasting history (last 5 entries)
- ✅ Quick actions (Start/End fast buttons)

### Feature 023: Homepage Redesign (October 2025)
- Modern glassmorphic design system
- Purple-pink-indigo gradient palette
- GlassmorphicCard and GradientButton components

### Feature 022: Mobile UX Quick Fixes (October 2025)
- Responsive entry table
- Compact mobile typography
- Mobile-friendly forms

### Feature 020: Fasting Goal Timer (October 2025)
- ✅ Set fasting goals (12h, 16h, 18h, 24h presets + custom)
- ✅ Real-time progress tracking
- ✅ Goal completion time calculation
- ✅ Session-based goals (per fast)
- ✅ Goal status tracking (completed/not-completed/no-goal)

---

## 🎯 High-Impact Features

Features that deliver significant value and user engagement:

### ⏱️ Smart Goal Suggestions (Enhancement to Feature 020)
- **Problem**: Users set manual goals; system could suggest optimal targets based on history
- **Solution**: Analyze user's past fasting patterns to suggest achievable goals
  - Use historical average (not median to avoid unambitious 8h suggestions)
  - Consider time-of-day patterns (weekday vs weekend fasts)
  - Adaptive targets that grow with user's progress
  - "You usually fast 16h on weekdays - try for 17h today?"
- **Value**: Motivation and personalized guidance
- **Effort**: Medium (8-12 hours)
- **Note**: Feature 020 (goal setting) is complete, this adds intelligence

### 📊 Data Visualization & Trends (Partially Complete)
- ✅ Weight progress visualization (Feature 024 - DashboardChart component)
- ✅ Basic fasting duration trends (Dashboard stats)
- ⏳ Interactive charts and graphs (only weight chart exists)
- ⏳ Energy/wellbeing correlation charts
- ⏳ Heat maps (calendar view)
- ⏳ Comparative analytics (week/month/year)

### 🎯 Goal Setting & Tracking (Basic Implementation Complete)
- ✅ Set fasting duration goals (Feature 020 - FastingGoalContext)
- ✅ Progress tracking (Goal progress shown on timer)
- ✅ Streak goals (Dashboard shows current streak)
- ⏳ Weight loss targets (weight tracking exists, but no target setting)
- ⏳ Custom milestones
- ⏳ Achievement notifications

### 📥 Export/Import Data
- ⏳ CSV export (NOT implemented)
- ⏳ PDF reports (formatted, shareable)
- ⏳ JSON backup/restore
- ⏳ Import from other apps
- ⏳ Data portability
- ⏳ Scheduled exports

### 🔔 Reminders & Notifications (Infrastructure Complete)
- ✅ Push notification system (pushNotifications.js, notificationScheduler.js)
- ✅ Daily log reminders (notification infrastructure supports this)
- ✅ Fasting start/end alerts (scheduler can send timed notifications)
- ✅ PWA notification integration (complete)
- ⏳ Goal milestone notifications (infrastructure exists, milestone triggers not implemented)
- ⏳ Streak preservation alerts (infrastructure exists, need to implement streak logic)
- ⏳ Custom reminder schedules (basic scheduling exists, needs UI for customization)
- ⏳ Smart timing based on patterns

### � Scientific Fact-Checking System (Community-Driven)
**Effort**: High | **Value**: High | **Time**: 30-40 hours | **Status**: NOT implemented

**Problem**: Biological fasting stage descriptions need scientific accuracy, but maintaining this requires:
- Expert review of every claim
- Tracking of primary research sources
- Monitoring for updated/contradicting research
- Legal liability for medical misinformation

**Solution**: Build a three-phase system that combines admin tools, automation, and community involvement

#### Phase 1: Citation Management System (Foundation)
**Time**: 8-12 hours | **Priority**: P1 - Must Have

**Admin Dashboard for Scientific Claims**:
- Database of all biological claims with metadata
- Track sources (PubMed ID, journal, authors, year)
- Review schedule (flag claims older than 6-12 months)
- Approval workflow (draft → reviewed → published)
- Audit trail (who verified what when)
- Bulk status updates

**Database Schema**:
```javascript
ScientificClaim {
  claimText: String,              // "Brain uses ketones for 60-75% energy"
  category: String,               // "Ketosis", "Autophagy", "HGH"
  stage: String,                  // References FASTING_STAGES
  sources: [{
    citation: String,             // "Cahill, G.F. (2006)"
    title: String,                // Full paper title
    journal: String,              // "Annual Review of Nutrition"
    pubmedId: String,             // "16848698"
    doi: String,                  // "10.1146/annurev.nutr.26.061505.111258"
    url: String,                  // Direct link to paper
    addedDate: Date,
    addedBy: ObjectId             // Admin user who added it
  }],
  status: Enum,                   // 'draft', 'verified', 'needs-review', 'disputed'
  lastVerified: Date,
  lastVerifiedBy: ObjectId,
  reviewInterval: Number,         // Days (default: 180)
  adminNotes: String,             // Internal notes for reviewers
  publiclyVisible: Boolean,       // Show in app UI?
  qualityScore: Number            // 0-100 based on source quality
}
```

**Admin Features**:
- View all claims grouped by stage/category
- Filter by status (draft, needs review, verified)
- Reminder notifications when review is due
- Compare claim against multiple sources
- Version history of claim edits
- Export claims as CSV for external review

**Benefits**:
- Prevents outdated science from going live
- Clear responsibility (who verified what)
- Systematic review process
- Works with 1 admin (you)

#### Phase 2: Automated Citation Monitoring (Enhancement)
**Time**: 20-30 hours | **Priority**: P2 - Nice to Have

**Automated Research Monitoring**:
- Nightly cron job checks citation health
- PubMed API integration to verify papers exist
- Retraction watch (flag if paper withdrawn)
- Citation count tracking (highly debated topics)
- Related research finder (new papers since last review)
- Email alerts for admin when action needed

**External APIs to Integrate**:
- **PubMed E-utilities** (free, official NIH)
  - Verify papers exist
  - Get citation metadata
  - Search related research
- **Semantic Scholar API** (free)
  - Citation graphs
  - Find related papers
  - Track influence metrics
- **Crossref API** (free)
  - DOI verification
  - Journal metadata
  - Retraction notices

**Automated Health Checks**:
```javascript
// Example nightly job
async function checkCitationHealth() {
  const claims = await ScientificClaim.find({ 
    status: 'verified',
    lastVerified: { $lt: thirtyDaysAgo }
  });
  
  for (const claim of claims) {
    // Check if sources still valid
    const healthReport = await validateSources(claim.sources);
    
    if (healthReport.retracted.length > 0) {
      await flagClaimForReview(claim, 'Source retracted!');
    }
    
    // Find newer research
    const newPapers = await findRelatedResearch(claim);
    if (newPapers.length > 10) {
      await notifyAdmin(claim, `${newPapers.length} new papers found`);
    }
  }
}
```

**Admin Notifications**:
- Weekly digest: "3 claims need review, 5 new papers found"
- Urgent alerts: "Paper retracted! Review claim immediately"
- Monthly summary: Overall fact-checking health score

**Benefits**:
- Reduces manual monitoring burden
- Catches retractions automatically
- Discovers new research you might miss
- Prioritizes which claims need urgent review

#### Phase 3: Community Fact-Checking (Gamification)
**Time**: 16-24 hours | **Priority**: P2 - Nice to Have

**User-Driven Accuracy Improvement**:
- Users can flag potentially inaccurate claims
- Submit corrections with supporting sources
- Vote on other users' submissions (upvote/downvote)
- Earn reputation points and badges
- Admin reviews and approves/rejects submissions

**Public-Facing UI**:
```
┌──────────────────────────────────────────────┐
│ Stage 7: Ketosis and HGH Peak (48-72 hours) │
│                                              │
│ "Brain uses ketones for 30-40% of energy"   │
│ Source: Owen et al. (1967)                  │
│                                              │
│ 🚩 3 users flagged this claim                │
│                                              │
│ Top Correction (by @biochemist42):          │
│ "Actually 60-75% in prolonged ketosis"      │
│ Source: Cahill (2003) PMID: 12345678        │
│ 👍 12  👎 1                                   │
│                                              │
│ [View All Corrections] [Submit Correction]   │
└──────────────────────────────────────────────┘
```

**Admin Review Queue**:
```
┌──────────────────────────────────────────────┐
│ User Corrections - 5 Pending Review          │
├──────────────────────────────────────────────┤
│ ⭐⭐⭐⭐ @biochemist42 (reputation: 850)        │
│                                              │
│ Original: "Brain uses ketones 30-40%"       │
│ Correction: "Brain uses ketones 60-75%"     │
│ Source: Cahill (2003) PMID: 12345678        │
│ Community: 👍 12  👎 1                        │
│                                              │
│ [Approve & Update] [Reject] [Request Info]   │
├──────────────────────────────────────────────┤
│ ⭐ @newuser123 (reputation: 50)              │
│ ...                                          │
└──────────────────────────────────────────────┘
```

**Gamification System**:
- **Reputation Points**:
  - Flag claim (approved): +10 points
  - Submit correction (approved): +50 points
  - Correction gets upvoted: +5 points per vote
  - Bad submission (rejected): -20 points
- **Badges**:
  - 🔬 Fact Finder: First approved correction
  - 🏆 Research Hero: 10 approved corrections
  - 📚 Science Champion: 50 approved corrections
  - ⭐ Trusted Reviewer: 90%+ approval rate (min 10 submissions)
- **Leaderboard**:
  - Top contributors this month
  - All-time accuracy champions
  - Display on user profiles

**User Profiles**:
```
┌──────────────────────────────────────────────┐
│ @biochemist42                    ⭐⭐⭐⭐       │
│ Reputation: 850 points                       │
│                                              │
│ Contributions:                               │
│ • 15 approved corrections                    │
│ • 8 flagged inaccuracies                     │
│ • 92% approval rate                          │
│                                              │
│ Badges:                                      │
│ 🔬 🏆 📚 ⭐                                    │
│                                              │
│ Recent Activity:                             │
│ • Corrected "Ketosis" claim - approved       │
│ • Flagged "Autophagy" timing - under review  │
└──────────────────────────────────────────────┘
```

**Benefits**:
- Users help find errors (crowdsourced QA)
- Engaged community feels ownership
- Free fact-checking labor (incentivized by gamification)
- High-reputation users are trusted experts
- You still have final approval (quality control)

#### Implementation Roadmap

**Phase 1 First** (8-12 hours):
1. Create ScientificClaim model
2. Admin CRUD pages for claims
3. Review reminder system
4. Basic approval workflow
- **Outcome**: You can track and verify claims systematically

**Phase 2 When Needed** (20-30 hours):
- Wait until you have 50+ claims to manage
- Add API integrations for automation
- Set up nightly monitoring jobs
- **Outcome**: Automation reduces your workload

**Phase 3 When Community Exists** (16-24 hours):
- Wait until you have 500+ active users
- Add flagging and correction system
- Build reputation and badge system
- **Outcome**: Users help maintain accuracy

**Total Effort**: 44-66 hours across 3 phases (spread over time)

**Legal Considerations**:
- Add disclaimer: "Educational purposes only, not medical advice"
- Terms of Service: User-submitted content moderated
- Consult healthcare provider clause on every page with health claims
- Consider medical review before launching (optional)

**Success Metrics**:
- 100% of claims have ≥2 verified sources
- Review cycle < 6 months for all claims
- Community accuracy: 80%+ approved submissions
- User engagement: 10% of users submit corrections

---

### 🏆 Achievement & Badges System (Database-First with Multilang)
**Effort**: High | **Value**: High | **Time**: 50-67 hours | **Status**: ✅ PARTIALLY COMPLETE (Features 028-030)

**Completed** (November 2025):
- ✅ Database models (Achievement, UserAchievement) - Feature 028
- ✅ API endpoints for listing achievements with user progress - Feature 029
- ✅ 81 achievements seeded across 8 categories - Feature 030
- ✅ Multilingual support (English/Spanish)
- ✅ Rarity and point system
- ✅ Secret achievements
- ✅ Public achievements page with filtering

**Remaining Work**:
- ⏳ Achievement unlock logic (automatic checking when entries are created/updated) - **Feature 031 in progress**
- ⏳ **Hide locked achievements** - Only show progress count (e.g., "19/81 unlocked") and unlocked achievements, hide locked ones to prevent gaming
- ⏳ Achievement criteria visibility (show exact unlock requirements to users - only for unlocked achievements)
- ⏳ Admin achievement analytics page - Overview stats, unlock trends, performance metrics, engagement insights
- ⏳ Badge image uploads and cloud storage
- ⏳ Unlock notifications
- ⏳ Progress tracking for incremental achievements
- ⏳ Additional language translations

**Problem**: Users need motivation and recognition for their fasting milestones. Gamification increases engagement and retention.

**Solution**: Comprehensive achievement system with unlockable badges, progress tracking, and full admin control for multilingual support.

---

#### Core Features

**Dedicated Achievements Page** (`/achievements`):
- Grid/list view of all available achievements
- Unlocked badges displayed in full color with unlock date
- Locked badges grayed out with "???" or teaser description
- Progress bars for incremental achievements (e.g., "Fast 50 times: 23/50")
- Filter by category (Getting Started, Duration, Streak, Goals, etc.)
- Search functionality
- Total completion stats (e.g., "23/78 achievements unlocked")

**Achievement Categories** (80+ total badges):

1. **🚀 Getting Started** (Easy wins for new users)
   - First Steps - Log your first entry
   - Breaking the Fast - Complete your first fast
   - Double Digits - Fast for 10+ hours
   - Sweet Sixteen - Fast for 16+ hours
   - Daily Dozen - Log 12 days in a row

2. **⏱️ Duration Milestones**
   - Half Day Hero - Fast for 12+ hours
   - Golden Ratio - Fast for 16+ hours (classic IF)
   - Eighteen & Beyond - Fast for 18+ hours
   - Full Day Faster - Fast for 24+ hours
   - 36 Hour Warrior - Fast for 36+ hours
   - Two Day Champion - Fast for 48+ hours
   - Three Day Master - Fast for 72+ hours
   - Extended Elite - Fast for 120+ hours (5 days)

3. **🔥 Streak Achievements**
   - Newbie Streak - 3 days in a row
   - Weekly Warrior - 7 days in a row
   - Two Week Triumph - 14 days in a row
   - Monthly Master - 30 days in a row
   - Century Club - 100 days in a row
   - Unstoppable - 365 days in a row

4. **🎯 Goal Achievements**
   - Goal Getter - Hit your first goal
   - Overachiever - Exceed goal by 2+ hours
   - Consistent - Hit goals 7 days in a row
   - Perfectionist - Hit goals 30 days in a row
   - Goal Machine - Hit 100 goals total

5. **⚖️ Weight Tracking**
   - Scale Master - Log weight 7 days in a row
   - Progress Tracker - Log weight 30 times
   - 5 Pound Drop - Lose 5 lbs from starting weight
   - 10 Pound Victory - Lose 10 lbs from starting weight
   - Goal Weight - Reach your target weight

6. **� Consistency & Dedication**
   - Data Devotee - 30 complete entries (all fields filled)
   - Hundred Club - Log 100 entries total
   - Journaling Pro - Write food notes 50 times
   - Health Conscious - Log energy/mood 100 times
   - Early Bird - 10 entries before 8am

7. **🌟 Special Achievements**
   - Personal Best - Set a new longest fast record
   - Wellness Warrior - 10 "Best Days" (high energy + good mood)
   - Iron Will - Deny extended fast 5 times (discipline)
   - Night Owl - Log entry after midnight
   - Weekend Warrior - 10 weekend fasts 18h+

8. **🎓 Knowledge & Exploration**
   - Stage Explorer - Reach each of the 10 biological stages
   - Autophagy Activator - Reach 72h stage (autophagy)
   - Ketosis King/Queen - Reach 48h stage 10 times

---

#### Database Architecture

**Achievement Collection** (MongoDB):
```javascript
Achievement {
  _id: ObjectId,
  achievementId: String,           // Unique slug: 'sweet-sixteen'
  
  // Multilang support
  translations: {
    en: {
      name: String,                // 'Sweet Sixteen'
      description: String,         // 'Fast for 16+ hours'
      shortDescription: String     // 'Complete a 16h fast'
    },
    es: { name, description, shortDescription },
    fr: { name, description, shortDescription },
    de: { name, description, shortDescription },
    pt: { name, description, shortDescription }
    // Add languages as needed
  },
  
  // Badge images (uploaded via admin)
  badgeImage: {
    locked: String,                // '/uploads/badges/sweet-sixteen-locked.png'
    unlocked: String               // '/uploads/badges/sweet-sixteen-unlocked.png'
  },
  
  // Or use emoji/icon
  icon: String,                    // '⏱️'
  iconColor: String,               // '#8B5CF6' (purple)
  
  // Metadata
  category: String,                // 'duration', 'streak', 'goal', 'weight', 'consistency', 'special'
  points: Number,                  // 25 (gamification points)
  rarity: String,                  // 'common', 'rare', 'epic', 'legendary'
  order: Number,                   // Display order within category
  
  // Unlock criteria
  criteria: {
    type: String,                  // 'duration-milestone', 'streak', 'entry-count', 'goal-completion'
    params: Mixed                  // { hours: 16 } or { days: 7 } or { count: 100 }
  },
  
  // Admin control
  isActive: Boolean,               // Can disable without deleting
  isSecret: Boolean,               // Hidden until unlocked (easter eggs)
  releaseDate: Date,               // Launch new achievements over time
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId              // Admin who created it
}
```

**UserAchievement Collection** (MongoDB):
```javascript
UserAchievement {
  _id: ObjectId,
  userId: ObjectId,                // User who earned it
  achievementId: String,           // References Achievement.achievementId
  unlockedAt: Date,                // When earned
  progress: Number,                // For incremental (e.g., 7/12 days)
  notificationSeen: Boolean,       // Has user seen unlock notification?
  
  createdAt: Date
}

// Indexes
Index: { userId: 1, achievementId: 1 }, unique: true
Index: { userId: 1, unlockedAt: -1 }
```

**User Model Extension**:
```javascript
User {
  // ... existing fields
  preferredLanguage: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
    default: 'en'
  },
  achievementPoints: Number,       // Total points earned (sum of all unlocked)
}
```

---

#### Admin UI Features

**1. Achievement Management Dashboard**
- List all achievements with status (active/draft)
- Filter by category, status, rarity
- Search by name/description
- View unlock statistics (how many users earned each)
- Bulk activate/deactivate achievements
- Sort by display order, date created, popularity

**2. Achievement Create/Edit Form**
- Achievement ID (slug, unique)
- Multi-language fields:
  - Name (per language)
  - Description (per language)
  - Short description (per language)
  - Add/remove language tabs
- Badge image uploads:
  - Locked state image
  - Unlocked state image
  - Image preview
  - Drag & drop upload
  - Support PNG/JPG/SVG
- Emoji/icon alternative (if not using images)
- Metadata:
  - Category dropdown
  - Points value
  - Rarity selector
  - Display order
- Unlock criteria builder:
  - Type selector (duration, streak, count, etc.)
  - Dynamic parameter fields based on type
  - Preview criteria logic
- Settings:
  - Active toggle
  - Secret achievement toggle
  - Release date picker
- Save draft or publish

**3. Bulk Translation Manager**
- Select target language
- View all achievements with missing translations
- Inline editing for quick translations
- Export to CSV for external translation
- Import from CSV after translation
- Mark translations as "needs review"

**4. Badge Image Upload System**
- File upload via drag & drop or file picker
- Image preview before saving
- Automatic resizing/optimization
- Support for multiple formats (PNG, JPG, SVG)
- Cloud storage integration (AWS S3, Cloudinary, or Vercel Blob)
- Image validation (dimensions, file size)

**5. Achievement Analytics**
- Total achievements created
- Most popular achievements (highest unlock rate)
- Rarest achievements (lowest unlock rate)
- Average unlock time per achievement
- User progress distribution (0-10%, 10-25%, etc.)
- Unlock trends over time (chart)

---

#### Public User Features

**1. Achievements Page (`/achievements`)**

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Your Achievements                              🏆 23/78 (29%)│
├─────────────────────────────────────────────────────────────┤
│ [All] [🚀 Started] [⏱️ Duration] [🔥 Streak] [🎯 Goals] ... │
├─────────────────────────────────────────────────────────────┤
│ Search: [____________]              Sort: [Recent ▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🚀 GETTING STARTED                                   5/6    │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│ │   🏆    │  │   🏆    │  │   🔒    │  │   🏆    │       │
│ │  First  │  │Breaking │  │  Daily  │  │ Sweet   │       │
│ │  Steps  │  │the Fast │  │  Dozen  │  │ Sixteen │       │
│ │         │  │         │  │         │  │         │       │
│ │ ✅ Nov 1│  │ ✅ Nov 1│  │ 7/12    │  │ ✅ Nov 2│       │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│ ⏱️ DURATION MILESTONES                              3/8    │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│ │   ⏱️    │  │   ⏱️    │  │   🔒    │  │   🔒    │       │
│ │ Golden  │  │Eighteen │  │  Full   │  │ 36 Hour │       │
│ │  Ratio  │  │ Beyond  │  │   Day   │  │ Warrior │       │
│ │         │  │         │  │         │  │         │       │
│ │ ✅ Nov 2│  │ ✅ Nov 3│  │ ??? ??? │  │ ??? ??? │       │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Badge Hover Tooltip:**
```
┌───────────────────────────┐
│ 🏆 Sweet Sixteen          │
├───────────────────────────┤
│ Fast for 16+ hours        │
│                           │
│ ✅ Unlocked: Nov 2, 2025  │
│ 🎖️ 25 points              │
│ ⭐ Common                  │
└───────────────────────────┘
```

**Locked Badge Hover:**
```
┌───────────────────────────┐
│ 🔒 Full Day Faster        │
├───────────────────────────┤
│ Fast for 24+ hours        │
│                           │
│ Progress: 18/24 hours     │
│ Your best: 18h 30m        │
│ 🎖️ 50 points              │
│ ⭐ Rare                    │
└───────────────────────────┘
```

**2. Achievement Unlock Notification (Toast)**
```
┌─────────────────────────────────────────────────┐
│ 🎉 Achievement Unlocked!                        │
│                                                 │
│         🏆                                      │
│    Sweet Sixteen                                │
│                                                 │
│ You fasted for 16+ hours!                       │
│ +25 points                                      │
│                                                 │
│ [View Achievements]              [Dismiss]      │
└─────────────────────────────────────────────────┘
```

**3. Dashboard Widget (Recent Achievements)**
```
┌──────────────────────────────────────────────────┐
│ Recent Achievements                     [View All│
├──────────────────────────────────────────────────┤
│ 🏆 Sweet Sixteen              Nov 2, 2025   NEW! │
│ 🔥 Newbie Streak              Nov 4, 2025   NEW! │
│ 🎯 Goal Getter                Nov 3, 2025        │
└──────────────────────────────────────────────────┘
```

**4. Profile Badge Display**
- Show top 3-5 achievements on user profile
- "Featured badges" user can select to showcase
- Display total points and achievement percentage

---

#### Achievement Checking System

**Automatic Check After Entry Actions:**
```javascript
// Triggered after: entry create, entry update, entry delete
async function checkAchievementsForUser(userId, triggerType, entry) {
  const allAchievements = await Achievement.find({ isActive: true });
  const userAchievements = await UserAchievement.find({ userId });
  const unlockedIds = userAchievements.map(ua => ua.achievementId);
  
  const newUnlocks = [];
  
  for (const achievement of allAchievements) {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.achievementId)) continue;
    
    // Evaluate criteria
    const earned = await evaluateCriteria(userId, achievement.criteria, entry);
    
    if (earned) {
      // Create UserAchievement
      await UserAchievement.create({
        userId,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
        progress: 100,
        notificationSeen: false
      });
      
      // Update user points
      await User.updateOne(
        { _id: userId },
        { $inc: { achievementPoints: achievement.points } }
      );
      
      newUnlocks.push(achievement);
    } else {
      // Update progress for incremental achievements
      const progress = await calculateProgress(userId, achievement.criteria);
      if (progress > 0) {
        await UserAchievement.updateOne(
          { userId, achievementId: achievement.achievementId },
          { progress },
          { upsert: true }
        );
      }
    }
  }
  
  return newUnlocks; // Return for notification display
}
```

**Criteria Evaluators:**
```javascript
// Duration milestone
async function checkDurationMilestone(userId, params) {
  const entry = await Entry.findOne({
    userId,
    fastingDuration: { $gte: params.hours * 60 }
  });
  return !!entry;
}

// Streak
async function checkStreak(userId, params) {
  const entries = await Entry.find({ userId }).sort({ date: -1 });
  const streak = calculateStreak(entries);
  return streak >= params.days;
}

// Entry count
async function checkEntryCount(userId, params) {
  const count = await Entry.countDocuments({ userId });
  return count >= params.count;
}

// Goal completion
async function checkGoalCompletion(userId, params) {
  const count = await Entry.countDocuments({
    userId,
    goalStatus: 'completed'
  });
  return count >= params.count;
}
```

---

#### Image Upload & Storage

**Storage Options:**

1. **Local Filesystem** (development):
   - Store in `public/uploads/badges/`
   - Serve via Next.js static files
   - Simple but not scalable

2. **Cloud Storage** (production):
   - **AWS S3**: Industry standard, cheap, reliable
   - **Cloudinary**: Image optimization, transformations, CDN
   - **Vercel Blob**: Integrated with Vercel deployment
   - Recommended for production (CDN, backups, optimization)

**Upload Implementation:**
```javascript
// API: POST /api/admin/achievements/:id/badge
import multer from 'multer';
import { uploadToS3 } from '@/lib/storage/s3';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

export async function POST(req, res) {
  const { id } = req.params;
  const { type } = req.body; // 'locked' or 'unlocked'
  const file = req.file;
  
  // Upload to S3 or local storage
  const url = await uploadToS3(file, `badges/${id}-${type}.png`);
  
  // Update achievement
  await Achievement.updateOne(
    { _id: id },
    { [`badgeImage.${type}`]: url }
  );
  
  return res.json({ url });
}
```

---

#### Multilang Implementation

**Frontend Language Switching:**
```javascript
// hooks/useTranslation.js
import { useUser } from '@/contexts/UserContext';

export function useTranslation() {
  const { user } = useUser();
  const lang = user?.preferredLanguage || 'en';
  
  return {
    lang,
    t: (translations) => translations[lang] || translations.en
  };
}

// Usage in component
function AchievementCard({ achievement }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3>{t(achievement.translations).name}</h3>
      <p>{t(achievement.translations).description}</p>
    </div>
  );
}
```

**Language Selector (Settings Page):**
```
┌──────────────────────────────────┐
│ Language Preference              │
├──────────────────────────────────┤
│ ◉ English                        │
│ ○ Español (Spanish)              │
│ ○ Français (French)              │
│ ○ Deutsch (German)               │
│ ○ Português (Portuguese)         │
│ ○ 日本語 (Japanese)              │
│ ○ 中文 (Chinese)                 │
│                                  │
│ [Save Preference]                │
└──────────────────────────────────┘
```

---

#### Implementation Phases

**Phase 1: Core System (16-20 hours)**
- Database models (Achievement, UserAchievement)
- API endpoints (CRUD achievements, check unlocks)
- Basic achievement checking logic
- 10 starter achievements (hard-coded, no admin UI)
- Public achievements page (basic UI)
- Unlock notifications

**Phase 2: Admin UI (16-20 hours)**
- Admin achievement list page
- Create/edit achievement form
- Single language support (English only)
- Local image uploads
- Achievement activation/deactivation

**Phase 3: Multilang & Images (10-14 hours)**
- Multi-language translation fields
- Bulk translation manager
- Cloud image storage (S3/Cloudinary)
- Language preference in user settings
- Frontend translation system

**Phase 4: Polish & Gamification (8-13 hours)**
- Badge rarity system
- Points leaderboard (optional)
- Achievement analytics for admin
- Secret achievements
- Progress tracking for incremental achievements
- Share achievement unlocks (social)

**Total: 50-67 hours** across 4 phases

---

#### Success Metrics

- **Engagement**: 80%+ of users unlock at least 1 achievement
- **Retention**: Users with achievements have 2x higher 30-day retention
- **Admin Usage**: Admin can add new achievements without developer help
- **Multilang**: 50%+ of non-English users set preferred language
- **Performance**: Achievement page loads in <500ms
- **Unlock Rate**: Most common achievements unlock within first week

---

#### Technical Considerations

**Performance:**
- Cache active achievements list (30 min TTL)
- Index userId + achievementId for fast lookup
- Run achievement checks async (don't block entry save)
- Batch check multiple achievements in one query

**Security:**
- Admin-only routes protected by role check
- Validate uploaded images (type, size, dimensions)
- Rate limit achievement checks (prevent spam)
- Sanitize user input in translation fields

**SEO:**
- Achievement page is public (good for discovery)
- Social share cards for unlocked achievements
- Meta tags for achievement categories

---

#### Achievement Analytics Dashboard (Admin Feature)

**Purpose**: Provide admins with insights into achievement system performance and user engagement.

**Route**: `/admin/achievements/analytics`

**Key Metrics:**

1. **Overview Stats Cards**
   - Total Achievements (active/inactive)
   - Total Unlocks Across All Users
   - Most Popular Achievement
   - Rarest Achievement (lowest unlock rate)

2. **Performance Table**
   - Achievement Name, Unlocks, Unlock Rate %, Category, Tier
   - Sortable and searchable
   - Shows which achievements are performing well

3. **Category Breakdown** (Pie Chart)
   - Distribution by category (Duration, Streak, Goal, etc.)

4. **User Engagement Segments**
   - 0 achievements, 1-5, 6-15, 16+ counts
   - Helps understand user engagement levels

**API Endpoints:**
```javascript
GET /api/admin/achievements/analytics/overview
GET /api/admin/achievements/analytics/performance
GET /api/admin/achievements/analytics/categories
GET /api/admin/achievements/analytics/user-segments
```

**Implementation Priority:**
- Phase 1 (MVP - 2-3 hours): Stats cards + performance table
- Phase 2 (Enhanced - 4-6 hours): Add charts
- Phase 3 (Advanced - 2-3 hours): User segments, filters

**Status**: ⏳ Not yet implemented (added to backlog Nov 10, 2025)

---

### �👥 Social/Community Features
- Share progress publicly
- Friend connections
- Group challenges
- Community feed
- Success story sharing
- Support groups

### 🍽️ Meal Planning Integration
- Meal plan templates
- Recipe database
- Breaking fast suggestions
- Nutrition tracking
- Shopping lists
- Meal prep guides

### ⏱️ Fasting Timer/Widget
- Live countdown timer
- Desktop widget
- Mobile home screen widget
- Lock screen widget
- Timer notifications
- Visual progress ring

### 🏥 Health Integrations
- Apple Health sync
- Google Fit integration
- Fitbit connection
- Withings scale sync
- Heart rate data
- Sleep tracking integration

### 🎓 Personalized Coaching/Programs
- Guided fasting programs
- Progressive difficulty
- Personalized recommendations
- Educational content
- Expert tips
- Adaptive scheduling

### 📈 Advanced Analytics
- Detailed statistics dashboard
- Correlation analysis
- Predictive modeling
- Pattern recognition
- Success factor identification
- Comparative benchmarking

---

## 📱 Mobile UX Improvements

**Status**: Phase 1 ✅ COMPLETE (Feature 022)

Features to make the app feel more like a native mobile app rather than a responsive website:

### Phase 1: Quick Fixes ✅ COMPLETE (Feature 022)
**Effort**: Low | **Value**: High | **Time**: 2 hours

**Entries Table Mobile Optimization**:
- Hide non-essential columns on mobile (show only date, fast duration, status)
- Add "View Details" button/link on each row
- Reduce horizontal scrolling
- **Issue**: Currently showing all columns, requires horizontal scroll on mobile

**Spacing & Typography Adjustments** (Inspired by Zero app):
- Reduce padding/margins on mobile (16px → 12px)
- Scale down heading sizes responsively (e.g., h1: 24px, h2: 18px, h3: 16px)
- Tighter line-height for better content density (1.2-1.4 instead of 1.5+)
- Use system fonts for native feel (-apple-system, BlinkMacSystemFont)
- Smaller body text (14px instead of 16px) for more content per screen
- Strategic use of font weights (semibold for emphasis, regular for data)
- Compact number displays with larger font size for key metrics
- Generous use of icons to replace text labels (save space)
- **Key insight from Zero**: They fit 4-5 entries on screen without scrolling by using:
  - 14px body text
  - Minimal vertical spacing between items
  - Icon + number format (⏱ 16h instead of "Duration: 16 hours")
  - Single-line entries with smart data prioritization

**Form Layout Optimization**:
- Stack form inputs vertically on mobile
- Reduce field heights and spacing
- Bottom-aligned action buttons
- Single-column layout on mobile, multi-column on desktop

### Phase 2: Card-Based Entry List (Major Redesign)
**Effort**: Medium | **Value**: High | **Time**: 6 hours

**Replace Table with Mobile Cards**:
- Vertical card stack instead of table on mobile
- Each card shows: date, meal times, fast duration, wellness icons
- Tap anywhere on card to view full details
- Swipe left for delete, swipe right for edit
- All info visible without horizontal scrolling
- Natural mobile scrolling patterns

**Card Component Features** (Zero-inspired compact design):
```
┌─────────────────────────┐
│ Oct 27, 2025     16h 0m │ ← Date + duration (single line, 14px)
│ 12:00 PM → 8:00 PM  😊  │ ← Times + status (12px, muted)
├─────────────────────────┤ ← Subtle divider
│ Oct 26, 2025     18h 15m│
│ 11:00 AM → 7:15 PM  😊  │
└─────────────────────────┘
```
- **Typography Strategy** (like Zero):
  - Primary info (date, duration): 14-15px, semibold
  - Secondary info (times, details): 12px, regular, muted color
  - Minimal vertical padding: 8-10px per card
  - Horizontal layout: date/duration on same line
- **Information Density**: 5-6 entries visible without scrolling
- **Visual Hierarchy**: Size and weight differentiate importance
- **Icons as shortcuts**: ⏱ 😊 ⚡ instead of "Duration: " "Mood: " labels

**Alternative: Condensed List View**:
- More compact than cards
- See 10-15 entries without scrolling
- Format: "Oct 27 • 16h fast • 😊"
- Quick scanning, minimal but informative

### Phase 3: Native App Feel (Polish)
**Effort**: Medium | **Value**: High | **Time**: 8 hours

**Bottom Tab Navigation**:
- Move primary navigation to bottom on mobile
- Large touch targets (44x44px minimum)
- Fixed position, always accessible
- Icons: Home 🏠, Add ➕, Profile 👤
- Keep top nav on desktop

**Mobile Interaction Patterns**:
- Pull to refresh on entries list
- Swipe gestures for actions
- Bottom sheets for forms (instead of modals)
- Loading skeletons during data fetch
- Haptic feedback on actions (if supported)
- Smooth page transitions

**Visual Polish**:
- Subtle shadows instead of heavy borders
- Rounded corners (12-16px) for native feel
- Colored status indicators/badges
- More icon-heavy, less text-heavy
- Vibrant accent colors
- Native-style action sheets

### Phase 4: Timeline/Activity View (Optional)
**Effort**: High | **Value**: Medium | **Time**: 10 hours

**Timeline Style Entry Display**:
```
────────────────────
TODAY
  🔴 16h fasting
  12:00 PM → 8:00 PM
────────────────────
YESTERDAY  
  🟢 18h fasting
  11:00 AM → 7:00 PM
────────────────────
```
- Grouped by date headers
- Visual timeline with duration indicators
- Color-coded by fast type/status
- Infinite scroll with date separators
- Like fitness app activity feeds

**Technical Implementation**:
- Responsive breakpoints: `<EntriesList>` renders different components
  - Mobile (<768px): `<EntryCard>` or `<EntryTimeline>`
  - Desktop (≥1024px): `<EntriesTable>`
- Shared data layer (same API, different UI)
- Progressive enhancement strategy

**Success Metrics to Monitor**:
- Mobile engagement time (should increase)
- Form completion rate on mobile
- Time to complete entry (should decrease)
- User feedback/satisfaction

---

## ⚡ Quick Wins (Weekend Projects)

Features that can be implemented quickly but deliver immediate value:

###  CSV Export
**Effort**: Low | **Value**: Medium | **Time**: 3-4 hours
- Export all entries to CSV
- Date range selection
- Custom field selection
- Download button on entries page
- **Status**: NOT implemented

### 📅 Enhanced Date Picker (react-datepicker)
**Effort**: Low | **Value**: Medium | **Time**: 2-3 hours
- Replace native HTML5 date/time inputs with react-datepicker library
- Customizable calendar UI with brand styling
- Auto-open calendar on focus/click
- Better cross-browser consistency
- More flexible date range restrictions
- Custom date format display
- **Note**: Currently using native HTML5 inputs (Feature 018), works well but limited styling options
- **Status**: NOT implemented

---

## 💰 Premium Revenue Features

Features that could be monetized in a premium tier:

### 📄 PDF Reports
- Professionally styled reports
- Weekly/monthly summaries
- Progress charts included
- Shareable with doctors
- Print-friendly format

### 📊 Advanced Charts
- Multiple chart types
- Custom date ranges
- Comparison views
- Downloadable visualizations
- Interactive filtering

### ⏰ Custom Reminders
- Multiple reminder times
- Custom messages
- Different days of week
- Contextual reminders
- Smart suggestions

### 🍽️ Meal Plans & Recipes
- Curated meal plans
- Breaking fast recipes
- Nutrition information
- Shopping list generator
- Dietary preferences

### 📈 Analytics Dashboard
- Deep dive statistics
- Custom metrics
- Correlation analysis
- Predictive insights
- Export reports

### 🏥 Health App Sync
- Automatic data sync
- Multi-device support
- Wearable integration
- Real-time updates
- Historical data import

### 🚫 Ad-free Experience
- Remove all ads
- Premium badge
- Faster loading
- Priority features

### 🎯 Priority Support
- Email support
- Faster response times
- Feature requests priority
- Beta access
- Direct feedback channel

---

## 🚀 Growth/Virality Features

Features designed to drive user acquisition and retention:

### 📱 Social Sharing
- Share milestones
- Share weekly reports
- Beautiful share cards
- Twitter/Facebook integration
- Instagram stories format
- Customizable share templates

### 🏆 Friend Challenges
- Challenge friends
- Competitive streaks
- Group fasting events
- Leaderboards
- Achievement comparisons
- Friendly competition

### 🥇 Leaderboards
- Weekly top performers
- All-time records
- Category leaders
- Opt-in participation
- Anonymous options
- Fair ranking system

### 💬 Success Stories
- User testimonials
- Before/after sharing
- Journey narratives
- Photo galleries
- Community inspiration
- Moderated submissions

### 🎁 Referral Program
- Invite friends
- Referral bonuses
- Premium trial rewards
- Tracking dashboard
- Easy sharing
- Mutual benefits

### 👥 Community Forum
- Discussion boards
- Q&A section
- Support threads
- Success stories
- Tips and tricks
- Moderated community

---

## 🤖 AI-Enhanced Features

Features leveraging AI/ML for personalized experience:

### 💡 Smart Entry Insights
**Already Implemented**: Basic insights in Feature 011
**Enhancement Opportunities**:
- Deeper pattern analysis
- Predictive success factors
- Personalized tips
- Anomaly detection
- Contextual recommendations

### 📊 Monthly AI Reports
- AI-generated summaries
- Trend identification
- Success factor analysis
- Personalized recommendations
- Natural language insights
- Actionable suggestions

### 💬 AI Chat Assistant
- Conversational interface
- Answer fasting questions
- Provide encouragement
- Suggest meal times
- Troubleshoot issues
- 24/7 availability

### 🔮 Predictive Analysis
- Predict weight loss trajectory
- Estimate goal achievement date
- Identify potential plateaus
- Success probability scoring
- Risk factor identification
- Optimal fasting window suggestions

### 🧠 Pattern Recognition
- Identify personal patterns
- Correlate external factors
- Detect success patterns
- Flag concerning trends
- Seasonal variations
- Behavioral insights

### 🎯 Personalized Recommendations
- Custom fasting schedules
- Meal timing suggestions
- Activity recommendations
- Sleep optimization tips
- Hydration reminders
- Recovery suggestions

---

## 📋 Feature Prioritization Framework

When deciding what to build next, consider:

### Impact Score (1-10)
- User value
- Engagement potential
- Revenue opportunity
- Competitive advantage
- Strategic alignment

### Effort Score (1-10)
- Development time
- Technical complexity
- Testing requirements
- Integration challenges
- Maintenance burden

### Priority = Impact / Effort

**Quick Wins**: High Impact, Low Effort (Priority > 2.0)  
**Strategic Bets**: High Impact, High Effort (Priority 1.0-2.0)  
**Fill-ins**: Low Impact, Low Effort (Priority 0.5-1.0)  
**Avoid**: Low Impact, High Effort (Priority < 0.5)

---

## 🎯 Recommended Next Features

Based on codebase audit (November 4, 2025) - Features 001-027 complete:

### CSV Export
**Why**: User control, data portability, easy to implement
- Effort: Very Low (3-4 hours)
- Impact: Medium
- Priority Score: 2.5
- **Status**: NOT implemented

### Enhanced Date Picker (react-datepicker)
**Why**: Better UX than HTML5 inputs, cross-browser consistency, customizable styling
- Effort: Very Low (2-3 hours)
- Impact: Low-Medium
- Priority Score: 1.5
- **Status**: NOT implemented (currently using HTML5 inputs)

### Mobile UX Phase 2: Card-Based Entry List
**Why**: Better mobile experience, more native feel, improved information density
- Effort: Medium (6 hours)
- Impact: High
- Priority Score: 2.0
- **Status**: Phase 1 complete (Feature 022), Phase 2 NOT implemented

### Smart Goal Suggestions
**Why**: Personalization, motivation, uses existing goal system
- Effort: Medium (8-12 hours)
- Impact: High
- Priority Score: 1.5
- **Status**: Basic goal setting complete (Feature 020), intelligent suggestions NOT implemented

### Photo Food Logging
**Why**: Visual tracking, enhanced journaling, user requested
- Effort: High (16+ hours - needs image upload, storage, display)
- Impact: Medium-High
- Priority Score: 1.0
- **Status**: NOT implemented

---

## 💭 Notes

- **User Feedback**: Prioritize based on actual user requests once you have users
- **Analytics**: Monitor which existing features get most usage
- **Performance**: Consider performance impact of new features
- **Mobile First**: Ensure all features work well on mobile
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Testing**: Maintain 80% coverage minimum
- **Documentation**: Keep docs updated with each feature

---

## 📅 Version History

- **v1.0** (Oct 26, 2025): Initial backlog created after Feature 016 completion
- **v1.1** (Oct 28, 2025): Updated after Features 017-019 completion
- **v1.2** (Oct 29, 2025): Feature 022 (Mobile UX Quick Fixes) completed and deployed
- **v1.3** (November 4, 2025): Comprehensive codebase audit - Features 001-027 all complete
  - Removed completed features: User Dashboard, Streak Counter, Weight Chart, Goal Setting, Push Notifications
  - Updated sections with accurate completion status
  - Identified truly unimplemented features: CSV Export, react-datepicker, Photo Logging, Smart Goal Suggestions
  - Clarified partial implementations (notifications infrastructure exists, Mobile UX Phase 1 complete)

---

**Next Review**: After gathering user feedback or completing next 3-5 features
