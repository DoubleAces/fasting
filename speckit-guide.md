# SpecKit Usage Guide

Since custom slash commands aren't available in your VS Code version, you can trigger SpecKit workflows by **mentioning this file** in your chat along with your request.

## Available Workflows

### 1. **Create Feature Specification**
**Usage:** `@speckit-guide specify: [your feature description]`

Example:
```
@speckit-guide specify: add user authentication with email and password
```

This will:
- Generate a concise short name for the feature
- Create a new git branch
- Generate a comprehensive specification document
- Create a quality validation checklist

---

### 2. **Create Implementation Plan**
**Usage:** `@speckit-guide plan`

Use this after creating a specification to generate a detailed implementation plan.

---

### 3. **Break Down into Tasks**
**Usage:** `@speckit-guide tasks`

Use this after creating a plan to break it down into actionable development tasks.

---

### 4. **Implement Feature**
**Usage:** `@speckit-guide implement`

Use this to execute the implementation following your tasks.

---

### 5. **Generate Checklist**
**Usage:** `@speckit-guide checklist [type]`

Types: requirements, implementation, testing, deployment

---

### 6. **Clarify Requirements**
**Usage:** `@speckit-guide clarify`

Get help resolving [NEEDS CLARIFICATION] markers in your spec.

---

### 7. **Analyze Code**
**Usage:** `@speckit-guide analyze [what to analyze]`

Example:
```
@speckit-guide analyze the authentication flow
```

---

### 8. **View Constitution**
**Usage:** `@speckit-guide constitution`

View or update your project's core development principles.

---

## Quick Start

To begin your first feature:

```
@speckit-guide specify: [describe your feature here]
```

Example:
```
@speckit-guide specify: create a fasting timer with start/stop functionality and progress tracking
```

The AI will then follow the complete SpecKit workflow to generate your specification!
