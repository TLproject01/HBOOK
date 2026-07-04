param(
  [string]$RemoteUrl = "https://github.com/TLproject01/HBOOK.git",
  [string]$Branch = "Webport",
  [string]$Message = "Initial product complete release"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not available in PATH. Install Git for Windows, restart PowerShell, then run this script again."
}

git init
git branch -M $Branch

$remoteNames = git remote
if ($remoteNames -contains "origin") {
  git remote set-url origin $RemoteUrl
} else {
  git remote add origin $RemoteUrl
}

git add .

$hasChanges = git status --porcelain
if (-not $hasChanges) {
  Write-Host "No local changes to commit."
} else {
  git commit -m $Message
}

git push -u origin $Branch
