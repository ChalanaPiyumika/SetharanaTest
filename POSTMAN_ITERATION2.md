# Iteration 2: User Profiles - Postman Testing Guide

This guide provides step-by-step instructions for testing all patient and doctor profile endpoints using Postman.

## Prerequisites

- Server running on `http://localhost:5000`
- Database seeded with sample data (`npm run seed`)
- Postman installed

## Sample Credentials

After running `npm run seed`, you'll have these test accounts:

**Patients:**
- patient1@example.com / SecurePass123!
- patient2@example.com / SecurePass123!
- patient3@example.com / SecurePass123!
- patient4@example.com / SecurePass123!
- patient5@example.com / SecurePass123!

**Doctors:**
- doctor1@example.com / SecurePass123!
- doctor2@example.com / SecurePass123!
- doctor3@example.com / SecurePass123!
- doctor4@example.com / SecurePass123! (unverified)
- doctor5@example.com / SecurePass123!

---

## Patient Profile Endpoints

### 1. Login as Patient

**Request:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "patient1@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "publicId": "...",
      "email": "patient1@example.com",
      "firstName": "Patient1",
      "lastName": "User",
      "role": "PATIENT"
    }
  }
}
```

**Save the `accessToken` for subsequent requests!**

---

### 2. Get My Patient Profile

**Request:**
```
GET http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {accessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": 1,
      "publicId": "...",
      "userId": 1,
      "dateOfBirth": "1990-05-15",
      "gender": 1,
      "bloodGroup": "O+",
      "address": "Colombo 03, Sri Lanka",
      "emergencyContactName": "Nimal Perera",
      "emergencyContactPhone": "+94771234567",
      "deletedAt": null,
      "CreatedAt": "...",
      "UpdatedAt": "...",
      "user": {
        "id": 1,
        "publicId": "...",
        "email": "patient1@example.com",
        "firstName": "Patient1",
        "lastName": "User",
        "phone": "+94711234567",
        "role": "PATIENT"
      }
    }
  }
}
```

---

### 3. Update Patient Profile

**Request:**
```
PUT http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bloodGroup": "A+",
  "address": "123 New Address, Colombo 05",
  "emergencyContactPhone": "+94779999999"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient profile updated successfully",
  "data": {
    "patient": {
      "id": 1,
      "publicId": "...",
      "bloodGroup": "A+",
      "address": "123 New Address, Colombo 05",
      "emergencyContactPhone": "+94779999999",
      ...
    }
  }
}
```

---

### 4. Delete Patient Profile (Soft Delete)

**Request:**
```
DELETE 3http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {accessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient profile deleted successfully"
}
```

**Note:** After deletion, trying to get the profile will return 404.

---

## Doctor Profile Endpoints

### 1. Login as Doctor

**Request:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor1@example.com",
  "password": "SecurePass123!"
}
```

**Save the `accessToken` for doctor requests!**

---

### 2. Get My Doctor Profile

**Request:**
```
GET http://localhost:5000/api/v1/doctors/profile
Authorization: Bearer {accessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": 1,
      "publicId": "...",
      "userId": 6,
      "registrationNumber": "SLMC-AYU-20001",
      "experienceYears": 10,
      "consultationFee": "3500.00",
      "bio": "Specialist in Panchakarma therapy...",
      "isVerified": true,
      "deletedAt": null,
      "CreatedAt": "...",
      "UpdatedAt": "...",
      "user": {
        "id": 6,
        "publicId": "...",
        "email": "doctor1@example.com",
        "firstName": "Dr. A",
        "lastName": "Ayurveda",
        "phone": "+94811234567",
        "role": "DOCTOR"
      }
    }
  }
}
```

---

### 3. Get All Verified Doctors (Public - No Auth Required)

**Request:**
```
GET http://localhost:5000/api/v1/doctors
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": 1,
        "publicId": "...",
        "registrationNumber": "SLMC-AYU-20001",
        "experienceYears": 10,
        "consultationFee": "3500.00",
        "bio": "Specialist in Panchakarma therapy...",
        "isVerified": true,
        "user": {
          "id": 6,
          "publicId": "...",
          "email": "doctor1@example.com",
          "firstName": "Dr. A",
          "lastName": "Ayurveda",
          "phone": "+94811234567"
        }
      },
      ...
    ],
    "count": 4
  }
}
```

**Note:** Only 4 doctors returned (doctor4 is unverified)

---

### 4. Get Doctor by Public ID (Public - No Auth Required)

**Request:**
```
GET http://localhost:5000/api/v1/doctors/{publicId}
```

Replace `{publicId}` with a doctor's publicId from the previous response.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": 1,
      "publicId": "...",
      "registrationNumber": "SLMC-AYU-20001",
      "experienceYears": 10,
      "consultationFee": "3500.00",
      "bio": "Specialist in Panchakarma therapy...",
      "isVerified": true,
      "user": {
        ...
      }
    }
  }
}
```

---

### 5. Update Doctor Profile

**Request:**
```
PUT http://localhost:5000/api/v1/doctors/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "experienceYears": 12,
  "consultationFee": 4000,
  "bio": "Updated bio with more experience..."
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "doctor": {
      "id": 1,
      "experienceYears": 12,
      "consultationFee": "4000.00",
      "bio": "Updated bio with more experience...",
      ...
    }
  }
}
```

---

### 6. Delete Doctor Profile (Soft Delete)

**Request:**
```
DELETE http://localhost:5000/api/v1/doctors/profile
Authorization: Bearer {accessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Doctor profile deleted successfully"
}
```

---

## Authorization Tests

### Test 1: Patient Cannot Access Doctor Endpoints

**Request:**
```
GET http://localhost:5000/api/v1/doctors/profile
Authorization: Bearer {patient_accessToken}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only doctors can access doctor profiles"
}
```

---

### Test 2: Doctor Cannot Access Patient Endpoints

**Request:**
```
GET http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {doctor_accessToken}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only patients can access patient profiles"
}
```

---

### Test 3: Unauthenticated Access to Protected Endpoints

**Request:**
```
GET http://localhost:5000/api/v1/patients/profile
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

## Validation Tests

### Test 1: Invalid Gender Value

**Request:**
```
PUT http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {patient_accessToken}
Content-Type: application/json

{
  "gender": 5
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Gender must be 1 (Male), 2 (Female), or 3 (Other)"
  ]
}
```

---

### Test 2: Invalid Phone Number Format

**Request:**
```
PUT http://localhost:5000/api/v1/patients/profile
Authorization: Bearer {patient_accessToken}
Content-Type: application/json

{
  "emergencyContactPhone": "invalid-phone"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Emergency contact phone must be a valid phone number"
  ]
}
```

---

## Summary

✅ **Patient Endpoints:** 4 endpoints (Create, Read, Update, Delete)
✅ **Doctor Endpoints:** 6 endpoints (Create, Read Own, Read Public, List All, Update, Delete)
✅ **Authorization:** Role-based access control working
✅ **Validation:** Input validation with Joi schemas
✅ **Soft Delete:** DeletedAt field used instead of physical deletion
✅ **Public Access:** Doctor listings and individual profiles accessible without auth

All endpoints are working as expected!
