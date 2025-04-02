#!/usr/bin/env pwsh
# Database setup script for Stream-Box
# This script executes SQL files in the correct order to set up the database

# Configuration
$mysqlUser = "root"
$scriptsDir = Join-Path $PSScriptRoot "scripts"

# SQL files to execute in order
$sqlFiles = @(
    "01-schemes.sql",
    "02-inserts.sql",
    "03-procedures.sql"
)

Write-Host "Starting Stream-Box database setup..." -ForegroundColor Yellow

# Verify all SQL files exist before starting
foreach ($file in $sqlFiles) {
    $fullPath = Join-Path $scriptsDir $file
    if (-not (Test-Path $fullPath)) {
        Write-Host "Error: SQL file not found: $fullPath" -ForegroundColor Red
        exit 1
    }
}

# Create a temporary SQL file that sources all other files
$tempFile = Join-Path $env:TEMP "stream_box_setup_temp.sql"

# Create content for the temp file
$tempContent = ""
foreach ($file in $sqlFiles) {
    $fullPath = Join-Path $scriptsDir $file -Resolve
    # Convert to forward slashes for MySQL compatibility
    $fullPath = $fullPath.Replace("\", "/")
    $tempContent += "source $fullPath;`n"
}

# Write the temp file
$tempContent | Out-File -FilePath $tempFile -Encoding utf8 -Force

# Execute all SQL scripts in a single MySQL session
Write-Host "Executing all SQL scripts in a single session..." -ForegroundColor Cyan
# Use Get-Content and pipe to mysql instead of using < redirection
Get-Content $tempFile | mysql -u $mysqlUser -p

if ($LASTEXITCODE -eq 0) {
    Write-Host "All scripts executed successfully!" -ForegroundColor Green
} else {
    Write-Host "Error executing scripts!" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item -Path $tempFile -Force

Write-Host "Database setup completed successfully!" -ForegroundColor Green
