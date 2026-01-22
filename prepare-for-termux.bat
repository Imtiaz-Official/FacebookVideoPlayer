@echo off
echo ====================================
echo Facebook Video Player - Termux Prep
echo ====================================
echo.
echo This will prepare your project for Termux
echo.
pause

echo.
echo [1/3] Cleaning up unnecessary files...
if exist "node_modules" (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
)
if exist "dist" (
    echo Removing dist folder...
    rmdir /s /q dist
)
if exist ".vite" (
    echo Removing .vite cache...
    rmdir /s /q .vite
)
echo Done!

echo.
echo [2/3] Files ready for transfer:
echo.
echo Required files:
echo   - setup-termux.sh  (Setup script)
echo   - run.sh           (Quick launcher)
echo   - TERMUX.md        (Instructions)
echo   - package.json     (Dependencies)
echo   - src/             (Source code)
echo   - server.js        (Backend)
echo   - vite.config.js   (Config)
echo   - All other config files
echo.

echo [3/3] Next steps:
echo.
echo 1. ZIP this entire folder
echo 2. Transfer to your Android phone
echo 3. Extract on phone
echo 4. Open Termux and run:
echo    cd /sdcard/Download/facebook-video-player
echo    bash run.sh
echo.
echo That's it!
echo.
pause
