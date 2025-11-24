# PowerShell script to deploy to GitHub
Write-Host "🚀 Deploying to GitHub..." -ForegroundColor Green
Write-Host ""

# Add all changes
Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
git add .

# Check status
Write-Host ""
Write-Host "📋 Current status:" -ForegroundColor Yellow
git status --short

# Commit changes
Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Deploy: Updated artwork upload/edit functionality, improved UI, and deployment configuration"
git commit -m $commitMessage

# Check if remote exists
Write-Host ""
Write-Host "🔍 Checking remote repository..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No remote repository found!" -ForegroundColor Red
    Write-Host "Please add your GitHub repository first:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/peterart007.git" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Remote found: $remote" -ForegroundColor Green

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://render.com" -ForegroundColor Cyan
    Write-Host "2. Create a new Web Service (or use Blueprint)" -ForegroundColor Cyan
    Write-Host "3. Connect your GitHub repository" -ForegroundColor Cyan
    Write-Host "4. Add environment variables (see DEPLOY_NOW.md)" -ForegroundColor Cyan
    Write-Host "5. Deploy!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to push to GitHub. Please check the error above." -ForegroundColor Red
}

