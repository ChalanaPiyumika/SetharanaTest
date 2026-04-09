# Ayurveda Consultation Platform - Backend

Node.js backend API for the Ayurveda Consultation Platform with JWT authentication, MySQL database, and clean architecture.

## 🚀 Features

- **JWT Authentication** (Access & Refresh Tokens)
- **Role-based Authorization** (PATIENT, DOCTOR, ADMIN)
- **User Profiles** (Patient & Doctor)
- **Auto-Profile Creation** - Empty profiles automatically created upon registration
- **Soft Delete** for profiles
- **Public Doctor Listings** (verified doctors only)
- **Password Hashing** with bcrypt
- **Input Validation** with Joi
- **MySQL Database** with Sequelize ORM
- **Clean Architecture** (Domain, Infrastructure, Application, API layers)
- **Centralized Error Handling**
- **Database Seeding** with sample data

## 📋 Prerequisites

- Node.js (LTS version)
- MySQL or MariaDB
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - Database credentials (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
   - JWT secrets (JWT_SECRET, REFRESH_SECRET)
   - Server port (PORT)

4. **Create MySQL database**
   ```sql
   CREATE DATABASE ayurveda_consultation;
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   
   This creates 5 sample patients and 5 sample doctors with the password `SecurePass123!`

## 📦 Sample Credentials

After running `npm run seed`, you can use these test accounts:

**Patients:**
- `patient1@example.com` / `SecurePass123!`
- `patient2@example.com` / `SecurePass123!`
- (... patient3, patient4, patient5)

**Doctors:**
- `doctor1@example.com` / `SecurePass123!`
- `doctor2@example.com` / `SecurePass123!`
- (... doctor3, doctor4, doctor5)

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                    # HTTP layer
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Route definitions
│   │   └── middlewares/        # Express middlewares
│   ├── application/            # Business logic layer
│   │   ├── services/           # Business services
│   │   └── validators/         # Input validation schemas
│   ├── domain/                 # Domain layer
│   │   ├── models/             # Database models
│   │   └── enums/              # Enumerations
│   ├── infrastructure/         # External services
│   │   ├── database/           # Database configuration
│   │   └── repositories/       # Data access layer
│   ├── shared/                 # Shared utilities
│   │   ├── config/             # Configuration
│   │   └── utils/              # Utility functions
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
├── .env                        # Environment variables
├── .env.example                # Environment template
└── package.json                # Dependencies
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |

### Patient Profiles

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/patients/profile` | Create patient profile | Yes | PATIENT |
| GET | `/api/v1/patients/profile` | Get my patient profile | Yes | PATIENT |
| PUT | `/api/v1/patients/profile` | Update my patient profile | Yes | PATIENT |
| DELETE | `/api/v1/patients/profile` | Delete my patient profile (soft) | Yes | PATIENT |

### Doctor Profiles

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/doctors/profile` | Create doctor profile | Yes | DOCTOR |
| GET | `/api/v1/doctors/profile` | Get my doctor profile | Yes | DOCTOR |
| PUT | `/api/v1/doctors/profile` | Update my doctor profile | Yes | DOCTOR |
| DELETE | `/api/v1/doctors/profile` | Delete my doctor profile (soft) | Yes | DOCTOR |
| GET | `/api/v1/doctors` | List all verified doctors | No | - |
| GET | `/api/v1/doctors/:publicId` | Get doctor by public ID | No | - |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## 📝 API Usage Examples

### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "DOCTOR"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### Refresh Token

```bash
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔒 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

## 🎭 User Roles

- **PATIENT**: Default role for regular users
- **DOCTOR**: Healthcare providers
- **ADMIN**: System administrators

## 🔐 JWT Configuration

- **Access Token**: Expires in 20 minutes
- **Refresh Token**: Expires in 7 days
- **Algorithm**: HS256

## 🧪 Testing

Test the API using:
- Postman
- curl
- Any HTTP client

Example health check:
```bash
curl http://localhost:5000/health
```

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## 📦 Dependencies

- **express**: Web framework
- **sequelize**: ORM for MySQL
- **mysql2**: MySQL driver
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **joi**: Input validation
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **uuid**: UUID generation

## 🚧 Future Iterations

- ~~Doctor and patient profiles~~ ✅ **Completed in Iteration 2**
- Appointment scheduling
- Payment integration
- Video consultation
- Email notifications
- Password reset functionality
- Admin panel for doctor verification

## 📄 License

ISC
