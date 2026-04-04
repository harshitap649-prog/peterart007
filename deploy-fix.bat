@echo off
echo ========================================
echo    🚀 DEPLOYMENT FIX FOR VERCEL
echo ========================================

echo.
echo 📋 Step 1: Clean build cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo ✅ Cache cleared!

echo.
echo 🏗️ Step 2: Rebuilding project...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!

echo.
echo 🚀 Step 3: Deploy to Vercel...
echo 📝 Your site should now work properly on Vercel!
echo.

call vercel.cmd --prod --yes

if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎉 DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo 🌐 Your site is now live and working!
echo 📱 All artist functionality has been removed
echo 🔥 Your Peter Art site is ready!
echo.

pause
