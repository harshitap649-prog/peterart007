@echo off
echo ========================================
echo    🚀 DEPLOYING TO VERCEL
echo ========================================

echo.
echo 📋 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!

echo.
echo 🏗️ Step 2: Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!

echo.
echo 🚀 Step 3: Deploying to Vercel...
echo.
echo 📝 This will open your browser to Vercel...
echo 📝 Please login and authorize if prompted...
echo.

call npx vercel --prod

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
echo 🌐 Your site is now live on Vercel!
echo 📊 Check your Vercel dashboard for the live URL
echo 📱 Your PWA features are enabled
echo.
echo 🔄 Future deployments: Just run this script again!
echo.

pause
