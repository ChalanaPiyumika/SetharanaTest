# Simple Cookie Authentication Test
Write-Host "JWT Cookie Authentication Test" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api/v1"

# Test Login
Write-Host "Test: Login with cookies" -ForegroundColor Yellow
$loginBody = @{
    email = "cookietest@example.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -SessionVariable session
    Write-Host "Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    $cookies = $session.Cookies.GetCookies($baseUrl)
    Write-Host "Cookies Count: $($cookies.Count)" -ForegroundColor Green
    
    foreach ($cookie in $cookies) {
        Write-Host "  Cookie: $($cookie.Name) (HttpOnly: $($cookie.HttpOnly))" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Test: Access protected route" -ForegroundColor Yellow
    try {
        $profileResponse = Invoke-WebRequest -Uri "$baseUrl/patients/profile" -Method GET -WebSession $session
        Write-Host "Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "Status: 404 (Auth worked, profile not found)" -ForegroundColor Green
        } else {
            Write-Host "Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Test: Logout" -ForegroundColor Yellow
    $logoutResponse = Invoke-WebRequest -Uri "$baseUrl/auth/logout" -Method POST -WebSession $session
    Write-Host "Status: $($logoutResponse.StatusCode)" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
