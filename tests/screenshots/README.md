# Visual Regression Testing - Feature 022

## Overview
This directory contains baseline screenshots and visual regression tests for Feature 022 (Mobile UX Quick Fixes).

## Directory Structure

```
tests/screenshots/
├── baselines/                    # Baseline screenshots (committed to git)
│   ├── mobile-375x667/          # Mobile viewport baselines
│   │   ├── homepage.png
│   │   ├── entry-list.png
│   │   ├── entry-form-new.png
│   │   ├── settings-form.png
│   │   ├── component-entry-table.png
│   │   └── component-entry-form.png
│   └── desktop-1024x768/        # Desktop viewport baselines
│       ├── homepage.png
│       ├── entry-list.png
│       ├── entry-form-new.png
│       ├── settings-form.png
│       ├── component-entry-table.png
│       └── component-entry-form.png
├── actual/                       # Current test run screenshots (gitignored)
└── diff/                         # Difference images (gitignored)
```

## Capturing Baseline Screenshots

### First Time Setup
1. Ensure dev server is running:
   ```bash
   npm run dev
   ```

2. Capture baseline screenshots:
   ```bash
   npx playwright test tests/visual/capture-baselines.spec.js
   ```

3. Review captured screenshots in `tests/screenshots/baselines/`

4. Commit baselines to git:
   ```bash
   git add tests/screenshots/baselines/
   git commit -m "Add visual regression baselines for Feature 022"
   ```

### Updating Baselines
If intentional visual changes are made (e.g., design updates):

1. Capture new baselines:
   ```bash
   npx playwright test tests/visual/capture-baselines.spec.js --update-snapshots
   ```

2. Review changes carefully

3. Commit updated baselines:
   ```bash
   git add tests/screenshots/baselines/
   git commit -m "Update visual baselines: [describe change]"
   ```

## Running Visual Regression Tests

### Compare Against Baselines
```bash
npx playwright test tests/visual/compare-visuals.spec.js
```

### With Different Thresholds
Adjust `maxDiffPixelRatio` in `compare-visuals.spec.js`:
- `0.001` = 0.1% difference (strict)
- `0.01` = 1% difference (moderate) **[default]**
- `0.05` = 5% difference (lenient)

### View Diff Images
If tests fail, diff images are saved to `tests/screenshots/diff/`:
```bash
open tests/screenshots/diff/
```

## Test Configuration

### Viewports
- **Mobile**: 375×667 (iPhone SE)
- **Desktop**: 1024×768 (standard laptop)

### Comparison Settings
- **Max Diff Pixel Ratio**: 1% (0.01)
- **Threshold**: 0.2 (how different pixels need to be)
- **Animations**: Disabled

## Pages Tested

### Full Page Screenshots
- `/` - Homepage
- `/entries` - Entry list (responsive table)
- `/entries/new` - New entry form
- `/settings` - Settings form

### Component Screenshots
- Entry table (3 columns mobile, 8 columns desktop)
- Entry form (vertical mobile, horizontal desktop)
- Settings form (full-width buttons mobile, auto-width desktop)

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npx playwright install --with-deps chromium
      
      - run: npm run build
      
      - run: npm start &
      
      - run: npx playwright test tests/visual/compare-visuals.spec.js
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diff-images
          path: tests/screenshots/diff/
```

## Troubleshooting

### Tests Failing Due to Small Differences
**Cause**: Font rendering differences between environments  
**Solution**: Increase `maxDiffPixelRatio` slightly or use consistent environment

### Screenshots Look Different on CI
**Cause**: Different system fonts or GPU rendering  
**Solution**: Use Docker container or Playwright's `--disable-gpu` flag

### Baseline Screenshots Missing
**Cause**: Baselines not captured yet  
**Solution**: Run `capture-baselines.spec.js` first

### Large Diff on First Run
**Cause**: Using wrong baseline or environment mismatch  
**Solution**: Verify viewport sizes match, regenerate baselines

## Best Practices

### When to Update Baselines
✅ **DO update** when:
- Intentional design changes (e.g., color updates)
- Typography adjustments
- Layout improvements
- Component redesigns

❌ **DON'T update** when:
- Fixing visual bugs
- Addressing accessibility issues
- Correcting misalignments
- Resolving regressions

### Reviewing Diffs
1. Check `tests/screenshots/diff/` for difference images
2. Red areas = pixels that changed
3. Verify changes are intentional
4. Update baselines only if approved

### Keeping Tests Fast
- Limit full-page screenshots to key pages
- Use component screenshots for specific elements
- Run visual tests separately from unit/integration tests
- Consider visual tests as part of pre-deploy checks only

## Maintenance

### Regular Tasks
- [ ] Review baselines quarterly for drift
- [ ] Update baselines after major design changes
- [ ] Archive old baselines when features removed
- [ ] Clean up `actual/` and `diff/` directories regularly

### Version Control
- ✅ Commit: `baselines/` (source of truth)
- ❌ Ignore: `actual/` (temporary test output)
- ❌ Ignore: `diff/` (comparison results)

Add to `.gitignore`:
```
tests/screenshots/actual/
tests/screenshots/diff/
```

## Related Documentation
- [Feature 022 Specification](../../specs/022-mobile-ux-improvements/spec.md)
- [WCAG Validation Checklist](../../specs/022-mobile-ux-improvements/wcag-validation-checklist.md)
- [Core Web Vitals Validation](../../specs/022-mobile-ux-improvements/core-web-vitals-validation.md)
