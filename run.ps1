Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -q

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

$hostAddr = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$port = if ($env:PORT) { $env:PORT } else { "8000" }

# Dung process cu chiem port (neu co)
$onPort = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $onPort) {
  if ($procId -and $procId -ne $PID) {
    Write-Host "Dung process cu tren port $port (PID $procId)..." -ForegroundColor Yellow
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "`nMo trinh duyet: http://localhost:$port`n" -ForegroundColor Cyan
uvicorn app:app --reload --host $hostAddr --port $port
