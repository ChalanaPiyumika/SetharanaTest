const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { UserRole } = require('../../domain/enums/user-role.enum');
const {
    createSlotsSchema
} = require('../../application/validators/availability.validator');

/**
 * Availability Routes
 * All routes require authentication and DOCTOR or ADMIN role
 */

// Create time slots for a date
router.post(
    '/slots',
    authenticate,
    authorize(UserRole.DOCTOR, UserRole.ADMIN),
    validate(createSlotsSchema),
    availabilityController.createSlots
);

// Get bookable slots
router.get(
    '/my',
    authenticate,
    authorize(UserRole.DOCTOR, UserRole.ADMIN),
    availabilityController.getMySlots
);

// Delete a specific slot
router.delete(
    '/slots/:id',
    authenticate,
    authorize(UserRole.DOCTOR, UserRole.ADMIN),
    availabilityController.deleteSlot
);

module.exports = router;
