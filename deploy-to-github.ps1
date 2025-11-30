# PowerShell script to deploy to GitHub
Write-Host "🚀 Deploying to GitHub..." -ForegroundColor Green

# Add all changes
Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy: Ready for Render deployment - All latest changes"

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Create new Web Service" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Add environment variables (see DEPLOY_NOW.md)" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
