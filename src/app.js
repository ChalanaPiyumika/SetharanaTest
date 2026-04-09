const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./shared/config/env');
const authRoutes = require('./api/routes/auth.routes');
const patientRoutes = require('./api/routes/patient.routes');
const doctorRoutes = require('./api/routes/doctor.routes');
const availabilityRoutes = require('./api/routes/availability.routes');
const appointmentRoutes = require('./api/routes/appointment.routes');
const paymentRoutes = require('./api/routes/payment.routes');
const consultationRoutes = require('./api/routes/consultation.routes');
const contactMessageRoutes = require('./api/routes/contact-message.routes');
const errorHandler = require('./api/middlewares/error.middleware');

/**
 * Express Application Setup
 * Configures middleware and routes
 */

const app = express();

// CORS configuration
app.use(cors({
    origin: env.CORS_ORIGIN, // Must be explicit origin (not '*') for credentials/cookies
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/contact-messages', contactMessageRoutes);

// Serve uploaded consultation documents
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
