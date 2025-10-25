# API Contract Changes: Remove Copy to Today

**Feature**: 012-remove-copy-today  
**Date**: October 25, 2025

## Overview

This document describes the API contract changes resulting from removing the Copy to Today functionality. The primary change is removing templateSource from validation while maintaining backward compatibility.

---

## Affected Endpoints

### POST /api/entries (Modified)

**Purpose**: Create a new fasting entry

#### Request Body Changes

**Before** (Copy functionality present):
```json
{
  "date": "2025-10-26T12:00:00.000Z",
  "firstMealTime": "13:00",
  "lastMealTime": "21:00",
  "morningWeight": 75.5,
  "sleepHours": 7.5,
  "energyLevel": "High Energy",
  "hungerLevel": "Not Hungry",
  "wellBeing": "Good",
  "foodIntakeNotes": "Felt great today",
  "templateSource": "507f1f77bcf86cd799439011"  // ⚠️ Was validated
}
```

**After** (Copy functionality removed):
```json
{
  "date": "2025-10-26T12:00:00.000Z",
  "firstMealTime": "13:00",
  "lastMealTime": "21:00",
  "morningWeight": 75.5,
  "sleepHours": 7.5,
  "energyLevel": "High Energy",
  "hungerLevel": "Not Hungry",
  "wellBeing": "Good",
  "foodIntakeNotes": "Felt great today"
  // templateSource removed from validation
  // If provided, will be ignored (stripUnknown: true)
}
```

#### Validation Schema Changes

**Field Removed**: `templateSource`

**Previous Validation**:
```javascript
templateSource: Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .optional()
  .messages({
    'string.pattern.base': 'templateSource must be a valid MongoDB ObjectId',
  })
```

**New Validation**: Field completely removed from schema

**Backward Compatibility**: ✅ Maintained
- If client sends templateSource, it's silently ignored (not rejected)
- Joi `stripUnknown: true` option removes unknown fields
- No breaking changes for old clients

#### Response Changes

**Before**:
```json
{
  "success": true,
  "entry": {
    "_id": "67123abc...",
    "userId": "507f1f77...",
    "date": "2025-10-26T12:00:00.000Z",
    "firstMealTime": "13:00",
    "lastMealTime": "21:00",
    "templateSource": "507f1f77bcf86cd799439011",  // Could be present
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T10:30:00.000Z"
  }
}
```

**After**:
```json
{
  "success": true,
  "entry": {
    "_id": "67123abc...",
    "userId": "507f1f77...",
    "date": "2025-10-26T12:00:00.000Z",
    "firstMealTime": "13:00",
    "lastMealTime": "21:00",
    "templateSource": null,  // Always null for new entries
    "createdAt": "2025-10-26T10:30:00.000Z",
    "updatedAt": "2025-10-26T10:30:00.000Z"
  }
}
```

**Note**: templateSource still serialized in response for backward compatibility with clients expecting all Entry fields. Value will be null for new entries.

---

### GET /api/entries (No Changes)

**Purpose**: List user's entries

#### Response (Unchanged)

Entries may have templateSource field (legacy data):

```json
{
  "success": true,
  "entries": [
    {
      "_id": "67123abc...",
      "date": "2025-10-25T12:00:00.000Z",
      "templateSource": null,  // New entry
      // ... other fields
    },
    {
      "_id": "67123def...",
      "date": "2025-10-24T12:00:00.000Z",
      "templateSource": "507f1f77bcf86cd799439011",  // Legacy entry
      // ... other fields
    }
  ]
}
```

**Backward Compatibility**: ✅ Maintained
- Legacy entries with templateSource returned as-is
- New entries have templateSource: null
- Clients can safely ignore this field

---

### GET /api/entries/[id] (No Changes)

**Purpose**: Get single entry details

#### Response (Unchanged)

Entry may have templateSource field (legacy data):

```json
{
  "success": true,
  "entry": {
    "_id": "67123abc...",
    "userId": "507f1f77...",
    "date": "2025-10-25T12:00:00.000Z",
    "firstMealTime": "13:00",
    "lastMealTime": "21:00",
    "templateSource": null,  // or ObjectId for legacy entries
    "createdAt": "2025-10-25T10:30:00.000Z",
    "updatedAt": "2025-10-25T10:30:00.000Z"
  }
}
```

---

### PUT /api/entries/[id] (No Changes)

**Purpose**: Update existing entry

#### Request Body (Unchanged)

templateSource was never allowed in update requests (not an editable field), so no changes needed.

---

### DELETE /api/entries/[id] (No Changes)

**Purpose**: Delete entry

No changes - deletion works regardless of templateSource value.

---

## Error Handling (No Changes)

All error responses remain unchanged:

- 400 Bad Request: Validation errors
- 401 Unauthorized: Not authenticated
- 404 Not Found: Entry doesn't exist
- 500 Internal Server Error: Server errors

---

## Migration Path

### For API Clients

**No action required**:
- Old clients sending templateSource → Field ignored, entry created successfully
- New clients not sending templateSource → Works as before
- All clients reading entries → Legacy templateSource values present but can be ignored

### For Frontend Components

**Action required**:
- Remove copy button UI
- Remove handleCopyToToday logic
- Remove isCopying state
- No changes needed to API call patterns (edit/delete unchanged)

---

## Testing Contracts

### Test Cases for POST /api/entries

```javascript
describe('POST /api/entries - templateSource removed', () => {
  it('should create entry without templateSource field', async () => {
    const newEntry = {
      date: '2025-10-26T12:00:00.000Z',
      firstMealTime: '13:00',
      lastMealTime: '21:00',
    };
    
    const response = await request(app)
      .post('/api/entries')
      .send(newEntry);
    
    expect(response.status).toBe(201);
    expect(response.body.entry.templateSource).toBe(null);
  });
  
  it('should ignore templateSource if provided (backward compat)', async () => {
    const newEntry = {
      date: '2025-10-26T12:00:00.000Z',
      firstMealTime: '13:00',
      lastMealTime: '21:00',
      templateSource: '507f1f77bcf86cd799439011',  // Should be ignored
    };
    
    const response = await request(app)
      .post('/api/entries')
      .send(newEntry);
    
    expect(response.status).toBe(201);
    expect(response.body.entry.templateSource).toBe(null);
    // Not rejected - backward compatible
  });
  
  it('should NOT validate templateSource format', async () => {
    const newEntry = {
      date: '2025-10-26T12:00:00.000Z',
      firstMealTime: '13:00',
      lastMealTime: '21:00',
      templateSource: 'invalid-id',  // Invalid format, but ignored
    };
    
    const response = await request(app)
      .post('/api/entries')
      .send(newEntry);
    
    expect(response.status).toBe(201);  // Not 400
    expect(response.body.entry.templateSource).toBe(null);
  });
});
```

### Test Cases for GET /api/entries

```javascript
describe('GET /api/entries - templateSource handling', () => {
  it('should return legacy entries with templateSource', async () => {
    // Assume DB has entry with templateSource
    const response = await request(app).get('/api/entries');
    
    expect(response.status).toBe(200);
    const legacyEntry = response.body.entries.find(e => e.templateSource);
    if (legacyEntry) {
      expect(legacyEntry.templateSource).toMatch(/^[0-9a-fA-F]{24}$/);
    }
  });
  
  it('should return new entries with null templateSource', async () => {
    // Create new entry
    await createTestEntry();
    
    const response = await request(app).get('/api/entries');
    
    expect(response.status).toBe(200);
    const newEntry = response.body.entries[0];
    expect(newEntry.templateSource).toBe(null);
  });
});
```

---

## OpenAPI Specification (Updated)

```yaml
paths:
  /api/entries:
    post:
      summary: Create a new fasting entry
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - date
                - firstMealTime
                - lastMealTime
              properties:
                date:
                  type: string
                  format: date-time
                  example: "2025-10-26T12:00:00.000Z"
                firstMealTime:
                  type: string
                  pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                  example: "13:00"
                lastMealTime:
                  type: string
                  pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                  example: "21:00"
                morningWeight:
                  type: number
                  minimum: 0
                sleepHours:
                  type: number
                  minimum: 0
                  maximum: 24
                energyLevel:
                  type: string
                  enum: ["Low Energy", "Medium Energy", "High Energy"]
                hungerLevel:
                  type: string
                  enum: ["Not Hungry", "Slightly Hungry", "Very Hungry"]
                wellBeing:
                  type: string
                  enum: ["Poor", "Fair", "Good"]
                foodIntakeNotes:
                  type: string
                  maxLength: 2000
                # templateSource REMOVED from schema
      responses:
        201:
          description: Entry created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  entry:
                    $ref: '#/components/schemas/Entry'
        400:
          description: Validation error
        401:
          description: Unauthorized

components:
  schemas:
    Entry:
      type: object
      properties:
        _id:
          type: string
          example: "67123abc..."
        userId:
          type: string
          example: "507f1f77..."
        date:
          type: string
          format: date-time
        firstMealTime:
          type: string
        lastMealTime:
          type: string
        morningWeight:
          type: number
          nullable: true
        sleepHours:
          type: number
          nullable: true
        energyLevel:
          type: string
          nullable: true
        hungerLevel:
          type: string
          nullable: true
        wellBeing:
          type: string
          nullable: true
        foodIntakeNotes:
          type: string
          nullable: true
        templateSource:
          type: string
          nullable: true
          deprecated: true
          description: "Deprecated field. Always null for new entries. Legacy entries may have ObjectId value."
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

---

## Summary

### Changes

- ✅ Removed templateSource validation from POST /api/entries
- ✅ Field ignored if provided (backward compatible)
- ✅ New entries always have templateSource: null
- ✅ Legacy entries preserve existing values

### No Changes

- ✅ GET endpoints unchanged (return templateSource as-is)
- ✅ PUT endpoint unchanged (templateSource never editable)
- ✅ DELETE endpoint unchanged
- ✅ Error handling unchanged

### Backward Compatibility

- ✅ Old clients sending templateSource → Works (field ignored)
- ✅ Old clients reading entries → Works (field still present)
- ✅ New clients → No breaking changes

All API contracts maintain backward compatibility while removing unused validation and logic.
