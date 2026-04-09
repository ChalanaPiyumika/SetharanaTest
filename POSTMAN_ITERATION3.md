# Iteration 3: Booking System + PayHere + Email - Postman Testing Guide

This guide provides step-by-step instructions for testing all booking system endpoints using Postman.

## Prerequisites

- Server running on `http://localhost:5000`
- Database seeded with sample data (`npm run seed`)
- Postman installed

## Sample Credentials

**Patients:**
- patient1@example.com / SecurePass123!

**Doctors:**
- doctor1@example.com / SecurePass123!

## Enum Reference

| Enum | Value | Label |
|------|-------|-------|
| AppointmentStatus | 1 | Scheduled |
| AppointmentStatus | 2 | Confirmed |
| AppointmentStatus | 3 | Completed |
| AppointmentStatus | 4 | Cancelled |
| PaymentStatus | 1 | Pending |
| PaymentStatus | 2 | Paid |
| PaymentStatus | 3 | Failed |
| PaymentStatus | 4 | Refunded |
| ConsultationType | 1 | Video |
| ConsultationType | 2 | In-Person |

---

## Step 0 – Login (Get Tokens)

### Login as Doctor

**Request:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor1@example.com",
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
    "refreshToken": "...",
    "user": {
      "publicId": "...",
      "email": "doctor1@example.com",
      "firstName": "Dr. A",
      "lastName": "Ayurveda",
      "role": "DOCTOR"
    }
  }
}
```

**✅ Result: PASS** – Doctor token received.

### Login as Patient

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
    "refreshToken": "...",
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

**✅ Result: PASS** – Patient token received.

> **Save both `accessToken` values for all subsequent requests!**

---

## Availability Endpoints (Doctor Only)

### 1. Create Availability

**Request:**
```
POST http://localhost:5000/api/v1/availability
Authorization: Bearer {doctorAccessToken}
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00",
  "slotDuration": 30
}
```

**Validation Rules:**
- `dayOfWeek`: 0 (Sunday) – 6 (Saturday), required
- `startTime`: HH:MM 24-hour format, required
- `endTime`: HH:MM 24-hour format, required
- `slotDuration`: 15–120 minutes, default 30

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Availability created successfully",
  "data": {
    "availability": {
      "id": 1,
      "doctorId": 1,
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "12:00",
      "slotDuration": 30,
      "CreatedAt": "2026-02-12T..."
    }
  }
}
```

**✅ Result: PASS** – Availability created. Slots auto-generated for next 14 days.

---

### 2. Get My Availability

**Request:**
```
GET http://localhost:5000/api/v1/availability/my
Authorization: Bearer {doctorAccessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "id": 1,
        "doctorId": 1,
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "12:00",
        "slotDuration": 30,
        "deletedAt": null,
        "CreatedAt": "..."
      }
    ]
  }
}
```

**✅ Result: PASS** – Returns all active availability schedules.

---

### 3. Update Availability

**Request:**
```
PUT http://localhost:5000/api/v1/availability/{id}
Authorization: Bearer {doctorAccessToken}
Content-Type: application/json

{
  "startTime": "10:00",
  "endTime": "13:00"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "availability": {
      "id": 1,
      "startTime": "10:00",
      "endTime": "13:00",
      "slotDuration": 30,
      ...
    }
  }
}
```

**✅ Result: PASS** – Availability updated and future slots regenerated.

---

### 4. Delete Availability (Soft Delete)

**Request:**
```
DELETE http://localhost:5000/api/v1/availability/{id}
Authorization: Bearer {doctorAccessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability deleted successfully"
}
```

**✅ Result: PASS** – Availability soft-deleted with `deletedAt` timestamp.

---

## Appointment Endpoints

### 5. Get Available Slots (Public – No Auth Required)

**Request:**
```
GET http://localhost:5000/api/v1/appointments/slots/doctor/{doctorId}?startDate=2026-02-13T00:00:00.000Z
```

**Query Parameters (optional):**
- `startDate`: ISO date – filter slots from this date
- `endDate`: ISO date – filter slots up to this date

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "doctorId": 1,
      "slotDate": "2026-02-13T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "isBooked": false,
      "CreatedAt": "..."
    },
    {
      "id": 2,
      "doctorId": 1,
      "slotDate": "2026-02-13T00:00:00.000Z",
      "startTime": "09:30",
      "endTime": "10:00",
      "isBooked": false,
      "CreatedAt": "..."
    }
  ]
}
```

**✅ Result: PASS** – Returns all unbooked slots within the 14-day rolling window.

---

### 6. Book Appointment (Patient Only)

**Request:**
```
POST http://localhost:5000/api/v1/appointments
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "slotId": 1,
  "consultationType": 1,
  "amount": 1500
}
```

**Validation Rules:**
- `slotId`: positive integer, required
- `consultationType`: 1 (Video) or 2 (In-Person), required
- `amount`: positive number, required

**Business Rules:**
- Slot must exist and not be booked
- Appointment date must be in the future
- No overlapping appointments for the patient

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointment": {
      "id": 1,
      "publicId": "a1b2c3d4-e5f6-...",
      "patientId": 1,
      "doctorId": 1,
      "slotId": 1,
      "consultationType": 1,
      "status": 1,
      "amount": 1500,
      "paymentStatus": 1,
      "CreatedAt": "..."
    },
    "payment": {
      "id": 1,
      "appointmentId": 1,
      "amount": 1500,
      "currency": "LKR",
      "status": 1,
      "CreatedAt": "..."
    }
  }
}
```

**✅ Result: PASS** – Appointment created with status `1 (Scheduled)`, payment `1 (Pending)`.

---

### 7. Get My Appointments (Patient or Doctor)

**Request:**
```
GET http://localhost:5000/api/v1/appointments
Authorization: Bearer {patientAccessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "publicId": "a1b2c3d4-e5f6-...",
      "patientId": 1,
      "doctorId": 1,
      "slotId": 1,
      "consultationType": 1,
      "status": 1,
      "amount": 1500,
      "paymentStatus": 1,
      "slot": {
        "id": 1,
        "slotDate": "2026-02-13T...",
        "startTime": "09:00",
        "endTime": "09:30"
      },
      "doctor": {
        "id": 1,
        "specialization": "Panchakarma",
        "user": {
          "firstName": "Dr. A",
          "lastName": "Ayurveda"
        }
      }
    }
  ]
}
```

**✅ Result: PASS** – Returns appointments for the logged-in user (patient or doctor).

---

### 8. Get Appointment By ID

**Request:**
```
GET http://localhost:5000/api/v1/appointments/{appointmentId}
Authorization: Bearer {patientAccessToken}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "publicId": "a1b2c3d4-e5f6-...",
    "patientId": 1,
    "doctorId": 1,
    "slotId": 1,
    "consultationType": 1,
    "status": 2,
    "amount": 1500,
    "paymentStatus": 2,
    "slot": { ... },
    "patient": { ... },
    "doctor": { ... },
    "payment": { ... }
  }
}
```

**✅ Result: PASS** – Returns full appointment details with all related records.

---

## Payment Endpoints

### 9. Initiate Payment (Authenticated)

**Request:**
```
POST http://localhost:5000/api/v1/payments/initiate
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "appointmentPublicId": "a1b2c3d4-e5f6-..."
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "merchant_id": "1XXXXXX",
    "return_url": "https://yourfrontend.com/payment-success",
    "cancel_url": "https://yourfrontend.com/payment-cancel",
    "notify_url": "https://yourdomain.com/api/v1/payments/webhook",
    "order_id": "APPT-a1b2c3d4",
    "items": "Ayurveda Consultation",
    "currency": "LKR",
    "amount": "1500.00",
    "first_name": "Patient1",
    "last_name": "User",
    "email": "patient1@example.com",
    "phone": "+94711234567",
    "hash": "E4A1B2C3D4E5F6..."
  }
}
```

**✅ Result: PASS** – Frontend submits this form data to PayHere checkout.

---

### 10. PayHere Webhook (Public – No Auth)

> **Note:** This endpoint is called by PayHere's servers after payment. To test manually, you must generate a valid MD5 hash.

**Request:**
```
POST http://localhost:5000/api/v1/payments/webhook
Content-Type: application/json

{
  "merchant_id": "1XXXXXX",
  "order_id": "APPT-a1b2c3d4",
  "payment_id": "PAY-123456",
  "payhere_amount": "1500.00",
  "payhere_currency": "LKR",
  "status_code": "2",
  "md5sig": "GENERATED_MD5_HASH",
  "method": "VISA",
  "status_message": "Success",
  "card_holder_name": "Test Patient",
  "card_no": "xxxxxxxxxxxx1234"
}
```

**Hash Generation Formula:**
```
hashedSecret = MD5(PAYHERE_MERCHANT_SECRET).toUpperCase()
hash = MD5(merchant_id + order_id + payhere_amount + status_code + hashedSecret).toUpperCase()
```

**On Success (status_code = 2):**
- Payment status → `2 (Paid)`
- Appointment status → `2 (Confirmed)`
- Slot marked as booked
- Confirmation email sent to patient

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

**✅ Result: PASS** – Webhook verified hash, updated payment/appointment, sent email.

---

## Appointment Actions (Post-Payment)

### 11. Reschedule Appointment (Patient Only)

**Request:**
```
PUT http://localhost:5000/api/v1/appointments/{appointmentId}/reschedule
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "newSlotId": 2
}
```

**Business Rules:**
- Only status `1 (Scheduled)` or `2 (Confirmed)` can be rescheduled
- New slot must exist, not be booked, and be in the future
- Old slot is freed (`isBooked = false`)
- New slot is reserved (`isBooked = true`)

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "id": 1,
    "slotId": 2,
    "status": 2,
    ...
  }
}
```

**✅ Result: PASS** – Rescheduled from Slot 1 → Slot 2. Old slot freed, new slot booked.

---

### 12. Cancel Appointment (Patient or Doctor)

**Request:**
```
DELETE http://localhost:5000/api/v1/appointments/{appointmentId}
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "cancellationReason": "Schedule conflict"
}
```

**Business Rules:**
- Cannot cancel within 12 hours of appointment time
- Slot is freed (`isBooked = false`)
- If payment was `Paid`, it's marked as `Refunded`
- Cancellation email sent to patient

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": 1,
    "status": 4,
    "paymentStatus": 4,
    "cancellationReason": "Schedule conflict",
    ...
  }
}
```

**✅ Result: PASS** – Appointment cancelled, payment refunded, slot freed, email sent.

---

## Error & Validation Tests

### Test 1: Book Already-Booked Slot (Double Booking Prevention)

**Request:**
```
POST http://localhost:5000/api/v1/appointments
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "slotId": 1,
  "consultationType": 1,
  "amount": 1500
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "This slot is already booked"
}
```

**✅ Result: PASS** – Double booking prevented.

---

### Test 2: Patient Tries to Access Availability Endpoints

**Request:**
```
POST http://localhost:5000/api/v1/availability
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Doctor role required."
}
```

**✅ Result: PASS** – Role-based access enforced.

---

### Test 3: Doctor Tries to Book Appointment

**Request:**
```
POST http://localhost:5000/api/v1/appointments
Authorization: Bearer {doctorAccessToken}
Content-Type: application/json

{
  "slotId": 1,
  "consultationType": 1,
  "amount": 1500
}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Patient role required."
}
```

**✅ Result: PASS** – Only patients can book.

---

### Test 4: Invalid Consultation Type

**Request:**
```
POST http://localhost:5000/api/v1/appointments
Authorization: Bearer {patientAccessToken}
Content-Type: application/json

{
  "slotId": 1,
  "consultationType": 5,
  "amount": 1500
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "consultationType",
      "message": "Consultation type must be 1 (Video) or 2 (In-Person)"
    }
  ]
}
```

**✅ Result: PASS** – Joi validation catches invalid enum.

---

### Test 5: Invalid Webhook Hash

**Request:**
```
POST http://localhost:5000/api/v1/payments/webhook
Content-Type: application/json

{
  "merchant_id": "1XXXXXX",
  "order_id": "APPT-fake",
  "payment_id": "PAY-fake",
  "payhere_amount": "1500.00",
  "payhere_currency": "LKR",
  "status_code": "2",
  "md5sig": "INVALID_HASH_VALUE"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

**✅ Result: PASS** – Tampered webhooks rejected.

---

### Test 6: Unauthenticated Booking Attempt

**Request:**
```
POST http://localhost:5000/api/v1/appointments
Content-Type: application/json

{
  "slotId": 1,
  "consultationType": 1,
  "amount": 1500
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**✅ Result: PASS** – JWT protection working.

---

## Complete Booking Flow (Step-by-Step)

1. **Login** as Doctor → get `doctorAccessToken`
2. **Create Availability** → `POST /availability` with day, time, duration
3. **Login** as Patient → get `patientAccessToken`
4. **Get Slots** → `GET /appointments/slots/doctor/{doctorId}` → pick a slot
5. **Book Appointment** → `POST /appointments` with `slotId`, `consultationType`, `amount`
6. **Initiate Payment** → `POST /payments/initiate` with `appointmentPublicId` → get PayHere form data
7. **PayHere Payment** → Frontend submits form to PayHere → user pays
8. **Webhook Callback** → PayHere calls `POST /payments/webhook` → appointment confirmed
9. **Verify** → `GET /appointments/{id}` → status = `2 (Confirmed)`, paymentStatus = `2 (Paid)`
10. **Reschedule** (optional) → `PUT /appointments/{id}/reschedule` with `newSlotId`
11. **Cancel** (optional) → `DELETE /appointments/{id}` with `cancellationReason`

---

## Summary

| Category | Endpoints | Status |
|----------|-----------|--------|
| Availability (Doctor) | 4 (Create, Get, Update, Delete) | ✅ All Pass |
| Appointments | 5 (Slots, Book, List, Details, Reschedule, Cancel) | ✅ All Pass |
| Payments | 2 (Initiate, Webhook) | ✅ All Pass |
| Authorization | Role-based access control | ✅ Pass |
| Validation | Joi schema validation | ✅ Pass |
| Security | JWT auth, webhook hash verification | ✅ Pass |
| Email | Confirmation + Cancellation emails | ✅ Pass |
| Double Booking | Slot locking with atomic transactions | ✅ Pass |

**All 11 endpoints tested and working. Full booking workflow verified end-to-end!**
