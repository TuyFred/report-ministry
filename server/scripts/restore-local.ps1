param(
  [Parameter(Mandatory = $false)]
  [string]$SqlFile = "$PSScriptRoot\report-db-fixed-notx.sql",

  [Parameter(Mandatory = $false)]
  [string]$DbName = "ministry_db",

  [Parameter(Mandatory = $false)]
  [string]$DbUser = "postgres",

  [Parameter(Mandatory = $false)]
  [string]$DbHost = "localhost",

  [Parameter(Mandatory = $false)]
  [int]$DbPort = 5432,

  [Parameter(Mandatory = $false)]
  [string]$DbPassword
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

if (-not $DbPassword) {
  $secure = Read-Host "Postgres password for user '$DbUser' (local)" -AsSecureString
  $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

# Provide password + encoding to psql without echoing it in args
$env:PGPASSWORD = $DbPassword
$env:PGCLIENTENCODING = "UTF8"

Write-Host "Ensuring database exists: $DbName" -ForegroundColor Cyan

# Connect to default 'postgres' DB to create target DB if needed
$checkDbSql = "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
$exists = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -tA -c $checkDbSql

if (-not $exists) {
  Write-Host "Creating database: $DbName" -ForegroundColor Cyan
  & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -v ON_ERROR_STOP=1 -c ("CREATE DATABASE ""{0}"";" -f $DbName) | Out-Host
} else {
  Write-Host "Database already exists." -ForegroundColor DarkGray
}

Write-Host "Restoring SQL into local database '$DbName'..." -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -v ON_ERROR_STOP=1 -f $SqlFile | Out-Host

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
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -v ON_ERROR_STOP=1 -c $verifySql | Out-Host

Write-Host "Done." -ForegroundColor Green
