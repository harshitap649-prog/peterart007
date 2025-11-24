@echo off
echo 🚀 Auto-deploying to GitHub...
echo.

echo 📦 Adding all changes...
git add .
echo.

echo 💾 Committing changes...
git commit -m "Deploy: Updated artwork upload/edit functionality, improved UI, and deployment configuration"
echo.

echo 📤 Pushing to GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo 📝 Next steps:
    echo 1. Go to https://render.com
    echo 2. Create a new Web Service (or use Blueprint)
    echo 3. Connect your GitHub repository
    echo 4. Add environment variables (see DEPLOY_NOW.md)
    echo 5. Deploy!
) else (
    echo ❌ Failed to push. Please check the error above.
    echo.
    echo If you don't have a remote, run:
    echo git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
)

pause

