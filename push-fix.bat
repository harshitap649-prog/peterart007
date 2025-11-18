@echo off
cd /d C:\Users\Keshav\Desktop\peterart007
git add components/CouponInput.tsx
git commit -m "Fix TypeScript error: handle undefined discount value in CouponInput"
git push origin main
echo.
echo Done! Check Render dashboard for deployment.
pause

