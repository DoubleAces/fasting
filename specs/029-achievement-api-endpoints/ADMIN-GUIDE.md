# Admin Achievement Management Guide

## 🔐 Admin Endpoints

Two new endpoints for managing achievements (admin access required):

---

## 1. Manual Achievement Unlock

**Endpoint**: `POST /api/achievements/unlock`  
**Purpose**: Manually unlock an achievement for any user  
**Auth**: Admin only

### Request Body
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "achievementId": "week-warrior"
}
```

### Response (201 Created)
```json
{
  "message": "Achievement unlocked successfully",
  "achievement": {
    "achievementId": "week-warrior",
    "name": "Week Warrior",
    "points": 25,
    "unlockedAt": "2025-11-04T15:30:00.000Z"
  },
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "achievementPoints": 55
  },
  "unlockedBy": {
    "adminId": "507f1f77bcf86cd799439012",
    "adminEmail": "admin@example.com",
    "method": "manual"
  }
}
```

### Use Cases
- **Testing**: Unlock achievements to test the UI
- **Corrections**: Fix issues where achievements didn't unlock
- **Special Awards**: Grant special achievements manually
- **Customer Support**: Help users who missed achievements due to bugs

### Error Responses

**409 Conflict** - Already unlocked:
```json
{
  "error": "Achievement 'week-warrior' is already unlocked for this user",
  "unlockedAt": "2025-11-01T10:00:00.000Z"
}
```

**404 Not Found** - Invalid achievement or user:
```json
{
  "error": "Achievement 'invalid-id' not found or inactive"
}
```

**403 Forbidden** - Not admin:
```json
{
  "error": "Admin access required to manually unlock achievements"
}
```

---

## 2. Create New Achievement

**Endpoint**: `POST /api/admin/achievements`  
**Purpose**: Add new achievements to the system  
**Auth**: Admin only

### Request Body (Minimal)
```json
{
  "achievementId": "marathon-master",
  "translations": {
    "en": {
      "name": "Marathon Master",
      "description": "Complete 10 fasts over 24 hours",
      "shortDescription": "10x 24hr fasts"
    }
  },
  "category": "duration",
  "criteria": {
    "type": "duration-milestone",
    "params": { "hours": 24, "count": 10 }
  },
  "points": 75,
  "rarity": "epic"
}
```

### Request Body (Full Example)
```json
{
  "achievementId": "marathon-master",
  "translations": {
    "en": {
      "name": "Marathon Master",
      "description": "Complete 10 fasts over 24 hours",
      "shortDescription": "10x 24hr fasts"
    },
    "es": {
      "name": "Maestro del Maratón",
      "description": "Completa 10 ayunos de más de 24 horas",
      "shortDescription": "10x ayunos 24h"
    }
  },
  "badgeImage": {
    "locked": "/badges/marathon-locked.png",
    "unlocked": "/badges/marathon-unlocked.png"
  },
  "icon": "🏃",
  "iconColor": "#F59E0B",
  "category": "duration",
  "criteria": {
    "type": "duration-milestone",
    "params": { "hours": 24, "count": 10 }
  },
  "points": 75,
  "rarity": "epic",
  "order": 45,
  "isActive": true,
  "isSecret": false,
  "releaseDate": "2025-12-01T00:00:00Z"
}
```

### Response (201 Created)
```json
{
  "message": "Achievement created successfully",
  "achievement": {
    "_id": "507f1f77bcf86cd799439013",
    "achievementId": "marathon-master",
    "name": "Marathon Master",
    "category": "duration",
    "points": 75,
    "rarity": "epic",
    "isActive": true,
    "isSecret": false,
    "createdAt": "2025-11-04T15:30:00.000Z"
  },
  "createdBy": {
    "adminId": "507f1f77bcf86cd799439012",
    "adminEmail": "admin@example.com"
  }
}
```

### Field Reference

#### Required Fields
- **achievementId**: Unique slug (lowercase, numbers, hyphens only)
- **translations.en**: English translation object
  - `name`: Display name
  - `description`: Full description
  - `shortDescription`: Brief description
- **category**: One of: `getting-started`, `duration`, `streak`, `goal`, `weight`, `consistency`, `special`, `knowledge`
- **criteria**: Unlock criteria object
  - `type`: One of: `duration-milestone`, `streak`, `entry-count`, `weight-loss`, `custom`
  - `params`: Object with criteria-specific parameters
- **points**: Number between 1-1000
- **rarity**: One of: `common`, `rare`, `epic`, `legendary`

#### Optional Fields
- **translations.[lang]**: Additional language translations (es, fr, de, pt)
- **badgeImage**: Image URLs for locked/unlocked states
- **icon**: Emoji or unicode character
- **iconColor**: Hex color code (e.g., "#10B981")
- **order**: Display order (default: 999)
- **isActive**: Enable/disable achievement (default: true)
- **isSecret**: Hide until unlocked (default: false)
- **releaseDate**: Date when achievement becomes available

### Criteria Types

#### duration-milestone
Checks for entries with minimum duration:
```json
{
  "type": "duration-milestone",
  "params": { "hours": 16 }
}
```

#### streak
Checks for consecutive day streaks:
```json
{
  "type": "streak",
  "params": { "days": 7 }
}
```

#### entry-count
Checks total number of entries:
```json
{
  "type": "entry-count",
  "params": { "count": 100 }
}
```

#### custom
For future expansion:
```json
{
  "type": "custom",
  "params": { "requirement": "custom-logic" }
}
```

### Error Responses

**409 Conflict** - Duplicate ID:
```json
{
  "error": "Achievement with ID 'marathon-master' already exists",
  "existingAchievementId": "507f1f77bcf86cd799439013"
}
```

**400 Bad Request** - Validation errors:
```json
{
  "error": "Validation failed",
  "errors": [
    "achievementId is required",
    "translations.en.name is required",
    "category must be one of: getting-started, duration, streak, ..."
  ]
}
```

---

## 🧪 Testing the Endpoints

### Using Browser (Postman/Insomnia)

1. **Sign in** as admin at http://localhost:3000
2. **Get session cookie**:
   - Open DevTools → Application → Cookies
   - Copy `authjs.session-token` value
3. **Make request** with cookie header:
   ```
   Cookie: authjs.session-token=YOUR_TOKEN_HERE
   ```

### Using cURL (PowerShell)

```powershell
# Manual unlock
$headers = @{
    "Content-Type" = "application/json"
    "Cookie" = "authjs.session-token=YOUR_TOKEN"
}

$body = @{
    userId = "507f1f77bcf86cd799439011"
    achievementId = "week-warrior"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/achievements/unlock" `
    -Method POST -Headers $headers -Body $body

# Create achievement
$body = @{
    achievementId = "test-achievement"
    translations = @{
        en = @{
            name = "Test"
            description = "Test achievement"
            shortDescription = "Test"
        }
    }
    category = "special"
    criteria = @{
        type = "custom"
        params = @{ test = $true }
    }
    points = 5
    rarity = "common"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/achievements" `
    -Method POST -Headers $headers -Body $body
```

### Using Test Script

1. Edit `scripts/test-admin-endpoints.js`
2. Add your session token and user ID
3. Run: `node scripts/test-admin-endpoints.js`

---

## 💡 Common Workflows

### Workflow 1: Add Seasonal Achievement
```
1. Create achievement with releaseDate
2. Set isSecret: false (announce it!)
3. Achievement appears on release date
4. Users can unlock it automatically
```

### Workflow 2: Fix Missing Unlock
```
1. User reports achievement didn't unlock
2. Verify they meet criteria
3. Use manual unlock endpoint
4. Achievement appears immediately
```

### Workflow 3: Test New Achievement
```
1. Create achievement with isActive: false
2. Test with manual unlock on test user
3. Verify it appears correctly in UI
4. Set isActive: true when ready
```

### Workflow 4: Limited-Time Event
```
1. Create achievement with specific criteria
2. Set releaseDate and endDate
3. After event: set isActive: false
4. Achievement becomes unavailable but stays unlocked for those who got it
```

---

## 🔒 Security Notes

- Both endpoints require **admin authentication**
- User data isolation is enforced
- All actions are logged with admin info
- Duplicate prevention is automatic
- Invalid data is rejected with clear errors

---

## 📚 Related Documentation

- **Achievement Models**: `src/lib/models/Achievement.js`
- **API Endpoints**: 
  - `src/app/api/achievements/unlock/route.js`
  - `src/app/api/admin/achievements/route.js`
- **Evaluation Service**: `src/lib/services/achievementEvaluator.js`
- **User Guide**: `specs/029-achievement-api-endpoints/VIEWING-ACHIEVEMENTS-GUIDE.md`

---

**Last Updated**: November 4, 2025  
**Feature**: 029-achievement-api-endpoints  
**Status**: Admin endpoints complete ✅
