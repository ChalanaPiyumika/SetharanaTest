const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    bookAppointmentSchema,
    rescheduleAppointmentSchema,
    cancelAppointmentSchema,
    getAvailableSlotsSchema
} = require('../../application/validators/appointment.validator');

/**
 * Appointment Routes
 */


// Get available slots for a doctor (Public - no auth required)
router.get(
    '/slots/doctor/:doctorId',
    validate(getAvailableSlotsSchema, 'query'),
    appointmentController.getAvailableSlots
);

// Book appointment (Patient only)
router.post(
    '/',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'PATIENT') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Patient role required.'
            });
        }
        next();
    },
    validate(bookAppointmentSchema),
    appointmentController.bookAppointment
);



// Get my appointments (Patient or Doctor)
router.get(
    '/',
    authenticate,
    appointmentController.getMyAppointments
);

// Get appointment details by public ID (for payment success check)
router.get(
    '/public/:publicId',
    authenticate,
    appointmentController.getAppointmentByPublicId
);

// Get appointment details by ID
router.get(
    '/:id',
    authenticate,
    appointmentController.getAppointmentById
);

// Reschedule appointment (Patient only)
router.put(
    '/:id/reschedule',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'PATIENT') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Patient role required.'
            });
        }
        next();
    },
    validate(rescheduleAppointmentSchema),
    appointmentController.rescheduleAppointment
);

// Cancel appointment (Patient or Doctor)
router.patch(
    '/:id/cancel',
    authenticate,
    validate(cancelAppointmentSchema),
    appointmentController.cancelAppointment
);

module.exports = router;
