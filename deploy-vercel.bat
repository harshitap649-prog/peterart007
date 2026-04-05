@echo off
echo 🚀 Deploying to Vercel...

REM Clean build
echo 📦 Cleaning previous build...
if exist .next rmdir /s /q .next

REM Install dependencies
echo 📥 Installing dependencies...
npm ci

REM Use Vercel-specific config for deployment
echo 🔧 Using Vercel-optimized config...
copy /y next.config.vercel.js next.config.js

REM Build with verbose output
echo 🔨 Building with verbose output...
set NODE_ENV=production
npm run build

REM Check build status
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 🚀 Deploying to Vercel...
    npx vercel --prod
) else (
    echo ❌ Build failed!
    echo 🔧 Trying fallback without PWA...
    
    REM Fallback: Try with original config
    git checkout next.config.js
    set NODE_ENV=production
    npm run build
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Fallback build successful!
        echo 🚀 Deploying to Vercel...
        npx vercel --prod
    ) else (
        echo ❌ Both builds failed!
        exit /b 1
    )
)

REM Restore original config after build
echo 🔄 Restoring original config...
git checkout next.config.js

echo.
echo ✅ Deployment process completed!
