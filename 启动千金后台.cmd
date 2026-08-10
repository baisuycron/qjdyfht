@echo off
setlocal

set "ADMIN_URL=http://127.0.0.1:4173/"

powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing '%ADMIN_URL%' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if %errorlevel%==0 goto open_admin

echo Starting Qianjin admin service...
powershell -NoProfile -Command "$project = Get-ChildItem -LiteralPath 'D:\' -Directory | ForEach-Object { Join-Path $_.FullName 'qianjin-admin-prototype' } | Where-Object { Test-Path (Join-Path $_ 'package.json') } | Select-Object -First 1; if (-not $project) { Write-Error 'Project folder not found.'; exit 1 }; Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm.cmd run dev -- --host 127.0.0.1 --port 4173' -WorkingDirectory $project -WindowStyle Minimized"
if %errorlevel% neq 0 pause

timeout /t 3 /nobreak >nul

:open_admin
start "" "%ADMIN_URL%"
endlocal
