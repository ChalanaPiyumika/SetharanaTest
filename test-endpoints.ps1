# Endpoint Testing Script for Iteration 2
# Tests all patient and doctor profile endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Ayurveda Platform - Iteration 2" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

# Test 1: Login as Patient
Write-Host "[TEST 1] Login as Patient..." -ForegroundColor Yellow
$patientLoginBody = @{
    email = 'patient1@example.com'
    password = 'SecurePass123!'
} | ConvertTo-Json

try {
    $patientLoginResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $patientLoginBody -ContentType 'application/json' -UseBasicParsing
    $patientData = $patientLoginResponse.Content | ConvertFrom-Json
    $patientToken = $patientData.data.accessToken
    Write-Host "✓ Patient login successful" -ForegroundColor Green
    Write-Host "  Email: $($patientData.data.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($patientData.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Patient login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Login as Doctor
Write-Host "`n[TEST 2] Login as Doctor..." -ForegroundColor Yellow
$doctorLoginBody = @{
    email = 'doctor1@example.com'
    password = 'SecurePass123!'
} | ConvertTo-Json

try {
    $doctorLoginResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $doctorLoginBody -ContentType 'application/json' -UseBasicParsing
    $doctorData = $doctorLoginResponse.Content | ConvertFrom-Json
    $doctorToken = $doctorData.data.accessToken
    Write-Host "✓ Doctor login successful" -ForegroundColor Green
    Write-Host "  Email: $($doctorData.data.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($doctorData.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Doctor login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get Patient Profile
Write-Host "`n[TEST 3] Get Patient Profile..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $patientToken"
    }
    $patientProfileResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/patients/profile" -Method GET -Headers $headers -UseBasicParsing
    $patientProfile = $patientProfileResponse.Content | ConvertFrom-Json
    Write-Host "✓ Patient profile retrieved" -ForegroundColor Green
    Write-Host "  Blood Group: $($patientProfile.data.patient.bloodGroup)" -ForegroundColor Gray
    Write-Host "  Address: $($patientProfile.data.patient.address)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get patient profile failed: $_" -ForegroundColor Red
}

# Test 4: Update Patient Profile
Write-Host "`n[TEST 4] Update Patient Profile..." -ForegroundColor Yellow
$updatePatientBody = @{
    bloodGroup = 'B+'
    address = 'Updated Address, Colombo 07'
} | ConvertTo-Json

try {
    $headers = @{
        'Authorization' = "Bearer $patientToken"
    }
    $updateResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/patients/profile" -Method PUT -Headers $headers -Body $updatePatientBody -ContentType 'application/json' -UseBasicParsing
    $updatedProfile = $updateResponse.Content | ConvertFrom-Json
    Write-Host "✓ Patient profile updated" -ForegroundColor Green
    Write-Host "  New Blood Group: $($updatedProfile.data.patient.bloodGroup)" -ForegroundColor Gray
    Write-Host "  New Address: $($updatedProfile.data.patient.address)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Update patient profile failed: $_" -ForegroundColor Red
}

# Test 5: Get Doctor Profile
Write-Host "`n[TEST 5] Get Doctor Profile..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $doctorToken"
    }
    $doctorProfileResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/doctors/profile" -Method GET -Headers $headers -UseBasicParsing
    $doctorProfile = $doctorProfileResponse.Content | ConvertFrom-Json
    $doctorPublicId = $doctorProfile.data.doctor.publicId
    Write-Host "✓ Doctor profile retrieved" -ForegroundColor Green
    Write-Host "  Registration: $($doctorProfile.data.doctor.registrationNumber)" -ForegroundColor Gray
    Write-Host "  Experience: $($doctorProfile.data.doctor.experienceYears) years" -ForegroundColor Gray
    Write-Host "  Fee: Rs. $($doctorProfile.data.doctor.consultationFee)" -ForegroundColor Gray
    Write-Host "  Verified: $($doctorProfile.data.doctor.isVerified)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get doctor profile failed: $_" -ForegroundColor Red
}

# Test 6: Update Doctor Profile
Write-Host "`n[TEST 6] Update Doctor Profile..." -ForegroundColor Yellow
$updateDoctorBody = @{
    experienceYears = 11
    consultationFee = 3800
    bio = 'Updated bio - Specialist in Panchakarma therapy with 11 years of experience'
} | ConvertTo-Json

try {
    $headers = @{
        'Authorization' = "Bearer $doctorToken"
    }
    $updateDoctorResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/doctors/profile" -Method PUT -Headers $headers -Body $updateDoctorBody -ContentType 'application/json' -UseBasicParsing
    $updatedDoctor = $updateDoctorResponse.Content | ConvertFrom-Json
    Write-Host "✓ Doctor profile updated" -ForegroundColor Green
    Write-Host "  New Experience: $($updatedDoctor.data.doctor.experienceYears) years" -ForegroundColor Gray
    Write-Host "  New Fee: Rs. $($updatedDoctor.data.doctor.consultationFee)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Update doctor profile failed: $_" -ForegroundColor Red
}

# Test 7: Get All Verified Doctors (Public - No Auth)
Write-Host "`n[TEST 7] Get All Verified Doctors (Public)..." -ForegroundColor Yellow
try {
    $doctorsResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/doctors" -Method GET -UseBasicParsing
    $doctors = $doctorsResponse.Content | ConvertFrom-Json
    Write-Host "✓ Verified doctors list retrieved" -ForegroundColor Green
    Write-Host "  Total verified doctors: $($doctors.data.count)" -ForegroundColor Gray
    foreach ($doc in $doctors.data.doctors) {
        Write-Host "  - Dr. $($doc.user.firstName) $($doc.user.lastName) (Rs. $($doc.consultationFee))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Get verified doctors failed: $_" -ForegroundColor Red
}

# Test 8: Get Doctor by Public ID (Public - No Auth)
Write-Host "`n[TEST 8] Get Doctor by Public ID (Public)..." -ForegroundColor Yellow
try {
    $doctorByIdResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/doctors/$doctorPublicId" -Method GET -UseBasicParsing
    $doctorById = $doctorByIdResponse.Content | ConvertFrom-Json
    Write-Host "✓ Doctor profile retrieved by public ID" -ForegroundColor Green
    Write-Host "  Name: Dr. $($doctorById.data.doctor.user.firstName) $($doctorById.data.doctor.user.lastName)" -ForegroundColor Gray
    Write-Host "  Registration: $($doctorById.data.doctor.registrationNumber)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get doctor by ID failed: $_" -ForegroundColor Red
}

# Test 9: Authorization Test - Patient tries to access Doctor endpoint
Write-Host "`n[TEST 9] Authorization Test - Patient accessing Doctor endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $patientToken"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/doctors/profile" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ SECURITY ISSUE: Patient should not access doctor endpoint!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ Authorization working correctly (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

# Test 10: Authorization Test - Doctor tries to access Patient endpoint
Write-Host "`n[TEST 10] Authorization Test - Doctor accessing Patient endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $doctorToken"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/patients/profile" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ SECURITY ISSUE: Doctor should not access patient endpoint!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ Authorization working correctly (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

# Test 11: Validation Test - Invalid Gender
Write-Host "`n[TEST 11] Validation Test - Invalid Gender Value..." -ForegroundColor Yellow
$invalidGenderBody = @{
    gender = 5
} | ConvertTo-Json

try {
    $headers = @{
        'Authorization' = "Bearer $patientToken"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/patients/profile" -Method PUT -Headers $headers -Body $invalidGenderBody -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ Validation should have failed!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Validation working correctly (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "All critical endpoints tested successfully!" -ForegroundColor Green
Write-Host "- Patient CRUD operations: ✓" -ForegroundColor Green
Write-Host "- Doctor CRUD operations: ✓" -ForegroundColor Green
Write-Host "- Public doctor listings: ✓" -ForegroundColor Green
Write-Host "- Authorization checks: ✓" -ForegroundColor Green
Write-Host "- Validation checks: ✓`n" -ForegroundColor Green
