# Cookie Authentication Test
$ErrorActionPreference = "Stop"

Write-Host "=== JWT Cookie Authentication Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login
Write-Host "[1] Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -SessionVariable session `
    -UseBasicParsing

Write-Host "  Status: $($loginResponse.StatusCode)" -ForegroundColor Green

$cookies = $session.Cookies.GetCookies("http://localhost:5000")
Write-Host "  Cookies received: $($cookies.Count)" -ForegroundColor Green

$hasAccessToken = $false
$hasRefreshToken = $false

foreach ($cookie in $cookies) {
    Write-Host "    - $($cookie.Name)" -ForegroundColor Cyan
    Write-Host "      HttpOnly: $($cookie.HttpOnly)" -ForegroundColor Cyan
    Write-Host "      Secure: $($cookie.Secure)" -ForegroundColor Cyan
    
    if ($cookie.Name -eq "accessToken") { $hasAccessToken = $true }
    if ($cookie.Name -eq "refreshToken") { $hasRefreshToken = $true }
}

if ($hasAccessToken -and $hasRefreshToken) {
    Write-Host "  PASS: Both tokens set as cookies" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Missing cookies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Access Protected Route
Write-Host "[2] Testing Protected Route Access..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/v1/patients/profile" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    Write-Host "  Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  PASS: Authenticated with cookies" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "  Status: 404 (Profile not found)" -ForegroundColor Green
        Write-Host "  PASS: Authenticated (404 means auth worked)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Status $statusCode" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Test 3: Refresh Token
Write-Host "[3] Testing Refresh Token..." -ForegroundColor Yellow
$refreshResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/v1/auth/refresh-token" `
    -Method POST `
    -WebSession $session `
    -UseBasicParsing

Write-Host "  Status: $($refreshResponse.StatusCode)" -ForegroundColor Green
Write-Host "  PASS: Token refreshed" -ForegroundColor Green

Write-Host ""

# Test 4: Logout
Write-Host "[4] Testing Logout..." -ForegroundColor Yellow
$logoutResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/v1/auth/logout" `
    -Method POST `
    -WebSession $session `
    -UseBasicParsing

Write-Host "  Status: $($logoutResponse.StatusCode)" -ForegroundColor Green
Write-Host "  PASS: Logged out" -ForegroundColor Green

Write-Host ""

# Test 5: Access After Logout
Write-Host "[5] Testing Access After Logout..." -ForegroundColor Yellow
try {
    $afterLogoutResponse = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/v1/patients/profile" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    Write-Host "  FAIL: Should not be authenticated" -ForegroundColor Red
    exit 1
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  Status: 401 (Unauthorized)" -ForegroundColor Green
        Write-Host "  PASS: Correctly blocked after logout" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Unexpected status $statusCode" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== All Tests Passed ===" -ForegroundColor Green
