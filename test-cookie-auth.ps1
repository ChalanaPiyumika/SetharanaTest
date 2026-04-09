# Test Cookie-Based Authentication
# This script tests the JWT cookie implementation

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "JWT Cookie Authentication Tests" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api/v1"

# Test 1: Registration (should NOT set cookies)
Write-Host "Test 1: Registration (should NOT set cookies)" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "cookieuser_$(Get-Random)@example.com"
        password = "Test123!"
        firstName = "Cookie"
        lastName = "User"
        role = "PATIENT"
    } | ConvertTo-Json

    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -SessionVariable registerSession

    Write-Host "✓ Status: $($registerResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Cookies set: $($registerSession.Cookies.GetCookies($baseUrl).Count)" -ForegroundColor Green
    
    if ($registerSession.Cookies.GetCookies($baseUrl).Count -eq 0) {
        Write-Host "✓ PASS: No cookies set on registration" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Cookies were set on registration" -ForegroundColor Red
    }
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    $testEmail = ($registerBody | ConvertFrom-Json).email
    Write-Host "✓ Registered user: $testEmail" -ForegroundColor Green
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $testEmail = "cookietest@example.com"  # Fallback to existing user
}
Write-Host ""

# Test 2: Login (should set cookies)
Write-Host "Test 2: Login (should set cookies)" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $testEmail
        password = "Test123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable loginSession

    Write-Host "✓ Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    $cookies = $loginSession.Cookies.GetCookies($baseUrl)
    Write-Host "✓ Cookies set: $($cookies.Count)" -ForegroundColor Green
    
    $hasAccessToken = $false
    $hasRefreshToken = $false
    
    foreach ($cookie in $cookies) {
        Write-Host "  - $($cookie.Name): HttpOnly=$($cookie.HttpOnly), Secure=$($cookie.Secure), SameSite=$($cookie.SameSite)" -ForegroundColor Cyan
        if ($cookie.Name -eq "accessToken") { $hasAccessToken = $true }
        if ($cookie.Name -eq "refreshToken") { $hasRefreshToken = $true }
    }
    
    if ($hasAccessToken -and $hasRefreshToken) {
        Write-Host "✓ PASS: Both accessToken and refreshToken cookies set" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Missing required cookies" -ForegroundColor Red
    }
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "✓ Response contains user data: $($loginData.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Access protected route with cookies
Write-Host "Test 3: Access protected route with cookies" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/patients/profile" `
        -Method GET `
        -WebSession $loginSession

    Write-Host "✓ Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✓ PASS: Protected route accessible with cookies" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Status: 404 (Profile not created yet - this is expected)" -ForegroundColor Green
        Write-Host "✓ PASS: Authentication worked (got 404, not 401)" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Refresh token (should update access token cookie)
Write-Host "Test 4: Refresh token" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow
try {
    $refreshResponse = Invoke-WebRequest -Uri "$baseUrl/auth/refresh-token" `
        -Method POST `
        -WebSession $loginSession

    Write-Host "✓ Status: $($refreshResponse.StatusCode)" -ForegroundColor Green
    
    $refreshData = $refreshResponse.Content | ConvertFrom-Json
    Write-Host "✓ Message: $($refreshData.message)" -ForegroundColor Green
    Write-Host "✓ PASS: Token refreshed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Logout (should clear cookies)
Write-Host "Test 5: Logout (should clear cookies)" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-WebRequest -Uri "$baseUrl/auth/logout" `
        -Method POST `
        -WebSession $loginSession

    Write-Host "✓ Status: $($logoutResponse.StatusCode)" -ForegroundColor Green
    
    $logoutData = $logoutResponse.Content | ConvertFrom-Json
    Write-Host "✓ Message: $($logoutData.message)" -ForegroundColor Green
    Write-Host "✓ PASS: Logout successful" -ForegroundColor Green
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Try to access protected route after logout (should fail)
Write-Host "Test 6: Access protected route after logout (should fail)" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
try {
    $afterLogoutResponse = Invoke-WebRequest -Uri "$baseUrl/patients/profile" `
        -Method GET `
        -WebSession $loginSession

    Write-Host "✗ FAIL: Should not be able to access protected route after logout" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Status: 401 Unauthorized" -ForegroundColor Green
        Write-Host "✓ PASS: Protected route correctly blocked after logout" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
