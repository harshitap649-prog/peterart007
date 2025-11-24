@echo off
cls
echo ========================================
echo   AUTO-DEPLOY TO GITHUB
echo ========================================
echo.

echo Step 1: Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added
echo.

echo Step 2: Committing changes...
git commit -m "Deploy: Updated artwork upload/edit functionality, improved UI, and deployment configuration"
if %errorlevel% neq 0 (
    echo WARNING: Commit may have failed or nothing to commit
)
echo ✓ Changes committed
echo.

echo Step 3: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to push to GitHub
    echo.
    echo Possible reasons:
    echo - No remote repository configured
    echo - Authentication required
    echo - Network issue
    echo.
    echo To add remote repository, run:
    echo   git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo   ✓ SUCCESS! Pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://render.com
echo 2. Sign up/Login with GitHub
echo 3. Click "New +" ^> "Blueprint"
echo 4. Select your peterart007 repository
echo 5. Add environment variables (see DEPLOY_NOW.md)
echo 6. Deploy!
echo.
pause

