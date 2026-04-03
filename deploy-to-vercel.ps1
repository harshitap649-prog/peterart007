# 🚀 Peter Art - Deploy to Vercel Script
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 DEPLOYING TO VERCEL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📋 Step 1: Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host ""

# Step 2: Build project
Write-Host "🏗️ Step 2: Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host ""

# Step 3: Deploy to Vercel
Write-Host "🚀 Step 3: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "📝 This will open your browser to Vercel..." -ForegroundColor Cyan
Write-Host "📝 Please login and authorize if prompted..." -ForegroundColor Cyan
Write-Host ""

try {
    npx vercel --prod
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Your site is now live on Vercel!" -ForegroundColor Green
    Write-Host "📊 Check your Vercel dashboard for the live URL" -ForegroundColor Cyan
    Write-Host "📱 Your PWA features are enabled" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Future deployments: Just run this script again!" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit..."
