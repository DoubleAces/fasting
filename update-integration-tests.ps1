# Script to update all integration test files to use test database utilities
# This implements tasks T037-T050 efficiently

$testFiles = @(
    "settings.test.js",
    "admin-access-denied.test.js",
    "admin-privilege-management.test.js",
    "password-reset.test.js",
    "protected-routes.test.js",
    "session-expiration.test.js",
    "user-model-terms.test.js",
    "footer-privacy-link.test.js",
    "register-form-privacy-link.test.js",
    "register-form-terms.test.js",
    "admin-access-logging.test.js",
    "auth-config.test.js"
)

$basePath = "C:\Code projects\fasting\tests\integration"

foreach ($file in $testFiles) {
    $filePath = Join-Path $basePath $file
    
    if (Test-Path $filePath) {
        Write-Host "Updating $file..." -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw
        
        # Pattern 1: Remove dotenv imports
        $content = $content -replace "(?m)^import \{ config \} from 'dotenv';?`r?`n", ""
        $content = $content -replace "(?m)^import \{ resolve \} from 'path';?`r?`n", ""
        $content = $content -replace "(?m)^config\(\{ path: resolve\(process\.cwd\(\), '\.env\.local'\) \}\);?`r?`n", ""
        
        # Pattern 2: Replace direct db imports with test utilities
        $content = $content -replace "import \{ connectDB, disconnectDB([^\}]*)\} from '@/lib/db';", "import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';"
        
        # Pattern 3: Replace mongoose direct imports (if not needed otherwise)
        if ($content -notmatch "mongoose\.") {
            $content = $content -replace "(?m)^import mongoose from 'mongoose';?`r?`n", ""
        }
        
        # Pattern 4: Update beforeAll to use setupTestDatabase
        $content = $content -replace "(?ms)beforeAll\(async \(\) => \{.*?await connectDB\(\);.*?\}\)", "beforeAll(async () => {`n    await setupTestDatabase();`n  })"
        
        # Pattern 5: Update afterAll to use teardownTestDatabase
        $content = $content -replace "(?ms)afterAll\(async \(\) => \{.*?await disconnectDB\(\);.*?\}\)", "afterAll(async () => {`n    await teardownTestDatabase();`n  })"
        
        # Pattern 6: Update beforeEach to use cleanTestDatabase
        $content = $content -replace "(?ms)beforeEach\(async \(\) => \{.*?await \w+\.deleteMany\(.*?\);.*?\}\)", "beforeEach(async () => {`n    await cleanTestDatabase();`n  })"
        
        # Save updated content
        Set-Content -Path $filePath -Value $content -NoNewline
        
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✓ All integration test files updated!" -ForegroundColor Green
Write-Host "Updated patterns:" -ForegroundColor Yellow
Write-Host "  - Removed dotenv imports (now handled by jest.env.setup.js)" -ForegroundColor Gray
Write-Host "  - Replaced connectDB/disconnectDB with test utilities" -ForegroundColor Gray
Write-Host "  - Updated beforeAll to use setupTestDatabase()" -ForegroundColor Gray
Write-Host "  - Updated afterAll to use teardownTestDatabase()" -ForegroundColor Gray
Write-Host "  - Updated beforeEach to use cleanTestDatabase()" -ForegroundColor Gray
