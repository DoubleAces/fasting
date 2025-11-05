# How to View Achievements - User Guide

## 🎯 Accessing the Achievements Page

### Navigation
1. **Sign in** to your account at `/login`
2. Click **"🏆 Achievements"** in the navigation bar
3. Or navigate directly to: `http://localhost:3000/achievements`

### What You'll See

#### Progress Summary (Top Section)
- **Unlocked**: Number of achievements you've earned
- **Locked**: Number of achievements still available to unlock
- **Total Points**: Your achievement point total
- **Completion**: Percentage of achievements unlocked

#### Filters
- **Category**: Filter by achievement type (Duration, Streak, Goals, etc.)
- **Status**: Show all, unlocked only, or locked only

#### Achievement Cards
Each achievement displays:
- **Icon & Color**: Visual badge representation
- **Name**: Achievement title (e.g., "Sweet Sixteen")
- **Description**: What you need to do to earn it
- **Rarity**: common, rare, epic, or legendary
- **Points**: Point value (5-100 points)
- **Unlock Date**: When you earned it (if unlocked)
- **Lock Status**: Visual indication of locked achievements

---

## 🚀 How to Unlock Achievements

Achievements are **automatically unlocked** when you:

### 1. Create Fasting Entries
Navigate to `/entries` and log your fasting sessions.

### 2. Available Achievements (Seeded)

| Achievement | Category | How to Unlock | Points |
|------------|----------|---------------|--------|
| **Getting Started** | getting-started | Log 3 fasting entries | 5 |
| **Sweet Sixteen** | duration | Complete a 16-hour fast | 10 |
| **Eighteen Hour Hero** | duration | Complete an 18-hour fast | 15 |
| **Week Warrior** | streak | Maintain a 7-day consecutive streak | 25 |
| **Daily Dozen** | streak | Maintain a 12-day consecutive streak | 50 |
| **Century Club** | consistency | Log 100 total entries | 100 |

### 3. Automatic Unlocking Process
When you create or update an entry:
1. System checks all active achievements
2. Evaluates if your data meets the criteria
3. Automatically unlocks matching achievements
4. Updates your achievement points
5. Displays unlocked achievements on the page

---

## 🧪 Testing the Feature

### Step 1: View Achievements Page
```
http://localhost:3000/achievements
```
Initially, you'll see all 6 achievements in "locked" state.

### Step 2: Unlock Your First Achievement
1. Go to `/entries`
2. Create a new entry with `fastingDuration: 16` (hours)
3. Save the entry
4. Return to `/achievements`
5. **"Sweet Sixteen"** should now show as unlocked! 🎉

### Step 3: Unlock "Getting Started"
1. Create 2 more entries (any duration)
2. Return to `/achievements`
3. **"Getting Started"** unlocks after your 3rd entry

### Step 4: Test Filters
- Filter by **"Duration"** category → see only Sweet Sixteen & Eighteen Hour Hero
- Filter by **"Unlocked"** status → see only achievements you've earned
- Filter by **"Locked"** status → see what's still available

---

## 🎨 UI Features

### Visual Design
- **Green border**: Unlocked achievements
- **Gray border**: Locked achievements (with opacity)
- **Rarity colors**: 
  - Common: Gray
  - Rare: Blue
  - Epic: Purple
  - Legendary: Gold
- **Icon backgrounds**: Each achievement has a custom color
- **Responsive**: Works on mobile, tablet, and desktop

### Interactive Elements
- Hover effects on achievement cards
- Smooth loading states
- Real-time filter updates
- Error handling with user-friendly messages

---

## 📱 Where to Find It

### Desktop Navigation
```
Home | Features | FAQ | My Entries | 🏆 Achievements | Settings | Logout
```

### Mobile Navigation (Hamburger Menu)
```
☰
├─ Home
├─ Features
├─ FAQ
├─ My Entries
├─ 🏆 Achievements  ← New!
├─ Settings
└─ Logout
```

---

## 🔧 Technical Details

### API Endpoints Used
The page calls: `GET /api/user/achievements`

**Query Parameters**:
- `category`: Filter by achievement category (optional)
- `status`: unlocked|locked (optional)
- `sort`: dateUnlocked (default)

**Response includes**:
- Array of achievements with user progress
- Summary statistics
- Pagination metadata

### State Management
- Uses Next.js `useSession` for authentication
- Client-side filtering with React state
- Real-time data fetching on filter change

### Authentication
- **Required**: Must be signed in to view
- **Redirect**: Unauthenticated users → `/login`
- **Session-based**: Uses NextAuth session cookies

---

## 💡 Tips

1. **Check regularly**: New achievements may be added over time
2. **Track progress**: Use filters to see what's still locked
3. **Point leaderboards**: Coming soon! Save up those points
4. **Secret achievements**: Some may be hidden until unlocked (not in current seed)

---

## 🐛 Troubleshooting

### "No achievements yet" message
- **Cause**: Filters may be excluding all achievements
- **Fix**: Reset filters to "All Categories" and "All Achievements"

### Page says "Loading achievements..."
- **Cause**: API request is slow or failed
- **Fix**: Check console for errors, ensure dev server is running

### Achievements not unlocking
- **Cause**: Achievement evaluation may have failed
- **Fix**: Check browser console and server logs for errors

### Not seeing the nav link
- **Cause**: Not signed in
- **Fix**: Log in first, then the "🏆 Achievements" link will appear

---

## 📂 File Locations

- **Page Component**: `src/app/achievements/page.js`
- **Navigation**: `src/components/organisms/Navbar.js`
- **API Endpoint**: `src/app/api/user/achievements/route.js`
- **Evaluation Service**: `src/lib/services/achievementEvaluator.js`

---

**Created**: November 4, 2025  
**Feature**: 029-achievement-api-endpoints  
**Status**: MVP Complete ✅
