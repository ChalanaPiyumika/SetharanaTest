# POSTMAN_PHASE4.md — Consultation Features Test Guide

## Prerequisites

- Backend server running: `npm run dev` inside `backend/`
- MySQL connected with all previous phases seeded
- A doctor and patient account already exist (from Phase 1–3)
- Base URL: `http://localhost:5000`

---

## Environment Variables (Postman)

| Variable | Value |
|---|---|
| `BASE_URL` | `http://localhost:5000/api/v1` |
| `TOKEN_DOCTOR` | JWT cookie from doctor login |
| `TOKEN_PATIENT` | JWT cookie from patient login |
| `appointmentId` | Set after Step 2 |
| `consultationId` | Set after Step 3 |
| `appointmentPublicId` | Set after Step 2 (e.g. `APT-2603-00001`) |

---

## Test Flow

---

### STEP 1 — Login as Patient

**POST** `{{BASE_URL}}/auth/login`

```json
{
  "email": "patient@example.com",
  "password": "Password123!"
}
```

✅ Expected: `200 OK` — JWT cookie set in browser / copy `accessToken` for header use.

---

### STEP 2 — Book Appointment (VIDEO type)

**POST** `{{BASE_URL}}/appointments`

**Headers:** `Authorization: Bearer {{TOKEN_PATIENT}}`

```json
{
  "slotId": 1,
  "consultationType": 1,
  "amount": 2500
}
```

✅ Expected: `201 Created`
```json
{
  "success": true,
  "message": "Appointment booked successfully. Please complete payment.",
  "data": {
    "appointment": { "id": 1, "publicId": "APT-2603-00001", ... },
    "payment": { ... }
  }
}
```

📝 **Save:** `appointment.id` → `{{appointmentId}}`, `appointment.publicId` → `{{appointmentPublicId}}`

---

### STEP 3 — Confirm Appointment (Doctor) ← triggers consultation creation

**PUT** `{{BASE_URL}}/appointments/{{appointmentId}}/confirm`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

✅ Expected: `200 OK`
```json
{
  "success": true,
  "message": "Appointment confirmed and video consultation created",
  "data": {
    "appointment": { "status": 2, ... },
    "consultation": {
      "id": 1,
      "roomName": "consult_APT-2603-00001",
      "status": "SCHEDULED"
    }
  }
}
```

📝 **Save:** `consultation.id` → `{{consultationId}}`

> ✉️ Both patient and doctor receive email invites with the join link.

---

### STEP 4 — Get Consultation by Appointment

**GET** `{{BASE_URL}}/consultations/by-appointment/{{appointmentId}}`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

✅ Expected: `200 OK` — Full consultation object with `status: "SCHEDULED"` and empty `documents: []`

---

### STEP 5 — Get Join Info

**GET** `{{BASE_URL}}/consultations/join/{{appointmentPublicId}}`

**Headers:** `Authorization: Bearer {{TOKEN_PATIENT}}` or `{{TOKEN_DOCTOR}}`

✅ Expected: `200 OK`
```json
{
  "success": true,
  "data": {
    "domain": "meet.jit.si",
    "roomName": "consult_APT-2603-00001",
    "joinUrl": "https://meet.jit.si/consult_APT-2603-00001",
    "displayName": "John Doe"
  }
}
```

> 🛡️ Only the appointment's patient and doctor can call this. Any other user gets `403`.

---

### STEP 6 — Start Consultation (Doctor only)

**POST** `{{BASE_URL}}/consultations/{{consultationId}}/start`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

✅ Expected: `200 OK`
```json
{
  "success": true,
  "message": "Consultation started",
  "data": { "status": "ACTIVE", "startedAt": "2026-03-23T17:53:00.000Z", ... }
}
```

❌ Patient: `403 Access denied. Doctor role required.`
❌ Wrong doctor: `403 Only the assigned doctor can start this consultation`

---

### STEP 7 — Upload Document

**POST** `{{BASE_URL}}/consultations/{{consultationId}}/documents`

**Headers:** `Authorization: Bearer {{TOKEN_PATIENT}}`

**Body:** `form-data`

| Key | Value |
|---|---|
| `document` | *(select a PDF or image file)* |

✅ Expected: `201 Created`
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": 1,
    "fileName": "prescription.pdf",
    "filePath": "uploads/consultations/1/1711234567890-prescription.pdf",
    "mimeType": "application/pdf"
  }
}
```

---

### STEP 8 — Get Documents

**GET** `{{BASE_URL}}/consultations/{{consultationId}}/documents`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

✅ Expected: `200 OK` — array of uploaded document records.

---

### STEP 9 — Save Recording URL (Doctor only)

**POST** `{{BASE_URL}}/consultations/{{consultationId}}/recording`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

```json
{
  "recordingUrl": "https://storage.example.com/recordings/consult_APT-2603-00001.mp4"
}
```

✅ Expected: `200 OK`
```json
{
  "success": true,
  "message": "Recording URL saved",
  "data": { "recordingUrl": "https://storage.example.com/...", ... }
}
```

---

### STEP 10 — End Consultation (Doctor only)

**POST** `{{BASE_URL}}/consultations/{{consultationId}}/end`

**Headers:** `Authorization: Bearer {{TOKEN_DOCTOR}}`

✅ Expected: `200 OK`
```json
{
  "success": true,
  "message": "Consultation ended",
  "data": { "status": "ENDED", "endedAt": "2026-03-23T18:30:00.000Z", ... }
}
```

---

## Error Reference

| Scenario | Status | Message |
|---|---|---|
| Non-doctor calls `/start` or `/end` | `403` | `Access denied. Doctor role required.` |
| Wrong doctor tries to start | `403` | `Only the assigned doctor can start this consultation` |
| Non-participant calls `/join` | `403` | `You are not a participant in this consultation` |
| Consultation not found | `404` | `Consultation not found` |
| No file uploaded for document | `400` | `No file uploaded` |
| Invalid recording URL | `400` | `A valid recording URL is required` |
| Confirm already-confirmed appointment | `400` | `Appointment is already confirmed` |
| Patient tries to confirm | `403` | `Access denied. Doctor role required.` |

---

## Complete Endpoint Summary

| # | Method | Endpoint | Auth | Role |
|---|---|---|---|---|
| 1 | `PUT` | `/appointments/:id/confirm` | ✅ | Doctor |
| 2 | `GET` | `/consultations/by-appointment/:appointmentId` | ✅ | Any participant |
| 3 | `GET` | `/consultations/join/:appointmentPublicId` | ✅ | Patient or Doctor |
| 4 | `POST` | `/consultations/:id/start` | ✅ | Doctor |
| 5 | `POST` | `/consultations/:id/end` | ✅ | Doctor |
| 6 | `POST` | `/consultations/:id/recording` | ✅ | Doctor |
| 7 | `POST` | `/consultations/:id/documents` | ✅ | Patient or Doctor |
| 8 | `GET` | `/consultations/:id/documents` | ✅ | Patient or Doctor |

---

## Phase 5: Contact Messages

### STEP 1 — Submit Contact Message (Public)

**POST** `{{BASE_URL}}/contact-messages`

```json
{
  "name": "Alex Patient",
  "email": "alex@example.com",
  "message": "I would like to inquire about Ayurveda."
}
```

✅ Expected: `201 Created`
```json
{
  "success": true,
  "message": "Your message has been submitted successfully.",
  "data": { "id": 1, "isResolved": false, ... }
}
```

---

### STEP 2 — Get All Messages (Admin only)

**GET** `{{BASE_URL}}/contact-messages`

**Headers:** `Authorization: Bearer {{TOKEN_ADMIN}}`

✅ Expected: `200 OK` — Array of all messages.

---

### STEP 3 — Mark Message as Resolved (Admin only)

**PATCH** `{{BASE_URL}}/contact-messages/1/resolve`

**Headers:** `Authorization: Bearer {{TOKEN_ADMIN}}`

```json
{
  "isResolved": true
}
```

✅ Expected: `200 OK`
```json
{
  "success": true,
  "message": "Message marked as resolved",
  "data": { "isResolved": true, ... }
}
```
