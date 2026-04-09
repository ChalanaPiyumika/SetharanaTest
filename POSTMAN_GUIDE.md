# Postman Testing Guide - Ayurveda Consultation Backend

## Base URL
```
http://localhost:5000
```

---

## 1. Health Check

**Method:** `GET`  
**URL:** `http://localhost:5000/health`  
**Headers:** None  
**Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-06T16:21:04.000Z"
}
```

---

## 2. Register User (Doctor)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "DOCTOR"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "publicId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "doctor@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "DOCTOR",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-02-06T16:21:04.000Z",
      "updatedAt": "2026-02-06T16:21:04.000Z"
    }
  }
}
```

---

## 3. Register User (Patient)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "patient@example.com",
  "password": "SecurePass456!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "PATIENT"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "publicId": "660e8400-e29b-41d4-a716-446655440001",
      "email": "patient@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": null,
      "role": "PATIENT",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-02-06T16:21:04.000Z",
      "updatedAt": "2026-02-06T16:21:04.000Z"
    }
  }
}
```

---

## 4. Login

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkb2N0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiRE9DVE9SIiwiaWF0IjoxNzM4ODU0MDY0LCJleHAiOjE3Mzg4NTUyNjR9.abc123...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkb2N0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiRE9DVE9SIiwiaWF0IjoxNzM4ODU0MDY0LCJleHAiOjE3Mzk0NTg4NjR9.xyz789...",
    "user": {
      "publicId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "doctor@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "DOCTOR"
    }
  }
}
```

**⚠️ Important:** Copy the `accessToken` and `refreshToken` from the response for the next requests!

---

## 5. Refresh Access Token

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/refresh-token`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "PASTE_REFRESH_TOKEN_FROM_LOGIN_RESPONSE_HERE"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_ACCESS_TOKEN..."
  }
}
```

---

## 6. Logout

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/logout`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "PASTE_REFRESH_TOKEN_FROM_LOGIN_RESPONSE_HERE"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 7. Forgot Password

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/forgot-password`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

---

## Error Testing

### Test 1: Weak Password (Validation Error)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "weak",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

### Test 2: Invalid Email

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "invalid-email",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### Test 3: Duplicate Email

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "Another",
  "lastName": "Doctor"
}
```

**Expected Response (409):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### Test 4: Invalid Login Credentials

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 5: Invalid/Expired Token

**Method:** `POST`  
**URL:** `http://localhost:5000/api/v1/auth/refresh-token`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "invalid.token.here"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

## Testing Workflow

### Recommended Testing Order:

1. **Health Check** - Verify server is running
2. **Register Doctor** - Create a doctor account
3. **Register Patient** - Create a patient account
4. **Login** - Get JWT tokens
5. **Refresh Token** - Test token refresh
6. **Logout** - Invalidate refresh token
7. **Error Tests** - Test validation and error handling

### Tips:

- **Save tokens**: After login, save the `accessToken` and `refreshToken` in Postman environment variables
- **Token expiry**: Access tokens expire in 20 minutes, refresh tokens in 7 days
- **Test errors**: Try all error scenarios to ensure proper validation
- **Check database**: Verify users are created in MySQL `Users` table

---

## Postman Collection Import

You can create a Postman collection by:

1. Open Postman
2. Click "Import" → "Raw text"
3. Paste the JSON collection (see next section)
4. Click "Import"

Or manually create requests using the URLs and payloads above.

---

## Quick Copy-Paste Payloads

### Register Doctor
```json
{"email":"doctor@example.com","password":"SecurePass123!","firstName":"John","lastName":"Doe","phone":"+1234567890","role":"DOCTOR"}
```

### Register Patient
```json
{"email":"patient@example.com","password":"SecurePass456!","firstName":"Jane","lastName":"Smith","role":"PATIENT"}
```

### Login
```json
{"email":"doctor@example.com","password":"SecurePass123!"}
```

### Refresh Token
```json
{"refreshToken":"PASTE_YOUR_REFRESH_TOKEN_HERE"}
```

### Logout
```json
{"refreshToken":"PASTE_YOUR_REFRESH_TOKEN_HERE"}
```

### Forgot Password
```json
{"email":"doctor@example.com"}
```

---

## Password Requirements

✅ Minimum 8 characters  
✅ At least 1 uppercase letter  
✅ At least 1 lowercase letter  
✅ At least 1 number  
✅ At least 1 special character (@$!%*?&)

**Valid examples:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Doctor#2024`

**Invalid examples:**
- `password` (no uppercase, number, special char)
- `Pass123` (too short, no special char)
- `PASSWORD123!` (no lowercase)
