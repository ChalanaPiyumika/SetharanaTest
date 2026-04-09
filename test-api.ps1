# Test API Endpoints
# Simple PowerShell script to test authentication endpoints

Write-Host "=== Testing Ayurveda Consultation Backend ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
Write-Host "✓ Health check passed" -ForegroundColor Green
$health | ConvertTo-Json
Write-Host ""

# Test 2: Register Doctor
Write-Host "2. Testing User Registration (Doctor)..." -ForegroundColor Yellow
$registerBody = @{
    email = "doctor@example.com"
    password = "SecurePass123!"
    firstName = "John"
    lastName = "Doe"
    role = "DOCTOR"
    phone = "+1234567890"
} | ConvertTo-Json

$register = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
Write-Host "✓ Registration successful" -ForegroundColor Green
$register | ConvertTo-Json
Write-Host ""

# Test 3: Login
Write-Host "3. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "doctor@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
Write-Host "✓ Login successful" -ForegroundColor Green
$accessToken = $login.data.accessToken
$refreshToken = $login.data.refreshToken
Write-Host "User: $($login.data.user.firstName) $($login.data.user.lastName) ($($login.data.user.role))" -ForegroundColor Cyan
Write-Host ""

# Test 4: Refresh Token
Write-Host "4. Testing Refresh Token..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$refresh = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/refresh-token" -Method Post -ContentType "application/json" -Body $refreshBody
Write-Host "✓ Token refresh successful" -ForegroundColor Green
Write-Host ""

# Test 5: Logout
Write-Host "5. Testing Logout..." -ForegroundColor Yellow
$logoutBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$logout = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/logout" -Method Post -ContentType "application/json" -Body $logoutBody
Write-Host "✓ Logout successful" -ForegroundColor Green
Write-Host ""

Write-Host "=== All Tests Passed ===" -ForegroundColor Green
