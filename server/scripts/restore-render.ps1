param(
  [Parameter(Mandatory = $false)]
  [string]$SqlFile = "$PSScriptRoot\report-db-fixed-notx.sql",

  [Parameter(Mandatory = $false)]
  [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found on PATH: $Name"
  }
}

Assert-Command "psql"

if (-not (Test-Path -LiteralPath $SqlFile)) {
  throw "SQL file not found: $SqlFile"
}

if (-not $DatabaseUrl) {
  $DatabaseUrl = $env:DATABASE_URL
}

if (-not $DatabaseUrl) {
  throw "DATABASE_URL not provided. Pass -DatabaseUrl or set $env:DATABASE_URL."
}

# Ensure sslmode=require for Render
if ($DatabaseUrl -notmatch "sslmode=") {
  if ($DatabaseUrl -match "\?") {
    $DatabaseUrl = "$DatabaseUrl&sslmode=require"
  } else {
    $DatabaseUrl = "$DatabaseUrl?sslmode=require"
  }
}

$env:PGCLIENTENCODING = "UTF8"

Write-Host "Restoring SQL into Render Postgres via DATABASE_URL..." -ForegroundColor Cyan
Write-Host "(sslmode=require enforced)" -ForegroundColor DarkGray

& psql "$DatabaseUrl" -v ON_ERROR_STOP=1 -f $SqlFile | Out-Host

Write-Host "Verifying row counts..." -ForegroundColor Cyan
$verifySql = @'
CREATE OR REPLACE FUNCTION _verify_counts()
RETURNS TABLE(table_name text, rows bigint)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY EXECUTE format('SELECT %L::text, COUNT(*)::bigint FROM %I', 'Users', 'Users');
  RETURN QUERY EXECUTE format('SELECT %L::text, COUNT(*)::bigint FROM %I', 'Reports', 'Reports');
  RETURN QUERY EXECUTE format('SELECT %L::text, COUNT(*)::bigint FROM %I', 'Attachments', 'Attachments');
  RETURN QUERY EXECUTE format('SELECT %L::text, COUNT(*)::bigint FROM %I', 'ReportFormTemplates', 'ReportFormTemplates');
END $$;

SELECT * FROM _verify_counts();
DROP FUNCTION _verify_counts();
'@
& psql "$DatabaseUrl" -v ON_ERROR_STOP=1 -c $verifySql | Out-Host

Write-Host "Done." -ForegroundColor Green
