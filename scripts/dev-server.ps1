param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root "tmp"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

Set-Location -LiteralPath $root

corepack.cmd pnpm dev --hostname 127.0.0.1 --port $Port *> (Join-Path $logDir "dev-server.log")
