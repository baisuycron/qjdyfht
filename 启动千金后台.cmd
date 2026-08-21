@echo off
setlocal

set "ADMIN_URL=http://127.0.0.1:4173/"
set "PROJECT_DIR=%~dp0"

if not exist "%PROJECT_DIR%package.json" set "PROJECT_DIR=D:\Thunderobot\GitHub\qjdyfht\"

if not exist "%PROJECT_DIR%package.json" (
  echo Project files were not found.
  pause
  exit /b 1
)

if not exist "%PROJECT_DIR%node_modules\vite\bin\vite.js" (
  echo Preview dependencies are not installed yet.
  pause
  exit /b 1
)

powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing '%ADMIN_URL%' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if %errorlevel%==0 goto open_admin

echo Starting Qianjin admin preview...
powershell -NoProfile -Command "$node = 'C:\Users\Thunderobot\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'; if (-not (Test-Path $node)) { Write-Error 'Preview runtime not found.'; exit 1 }; Start-Process -FilePath $node -ArgumentList 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4173' -WorkingDirectory '%PROJECT_DIR%' -WindowStyle Minimized"
if %errorlevel% neq 0 pause

timeout /t 3 /nobreak >nul

:open_admin
start "" "%ADMIN_URL%"
endlocal
