@echo off
setlocal

cd /d "%~dp0"

if "%~1"=="" (
  echo Usage: update-github.bat "your commit message"
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a git repository.
  exit /b 1
)

for /f "tokens=*" %%i in ('git remote') do set HAS_REMOTE=1
if not defined HAS_REMOTE (
  echo No git remote found. Add remote first:
  echo git remote add origin https://github.com/USERNAME/REPO.git
  exit /b 1
)

git add .
if errorlevel 1 (
  echo git add failed.
  exit /b 1
)

git commit -m "%~1"
if errorlevel 1 (
  echo No changes to commit or commit failed.
)

git push origin main
if errorlevel 1 (
  echo Push failed. Check auth and remote settings.
  exit /b 1
)

echo GitHub updated successfully.
