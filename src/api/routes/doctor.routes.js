const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    createDoctorProfileSchema,
    updateDoctorProfileSchema
} = require('../../application/validators/doctor.validator');
const { UserRole } = require('../../domain/enums/user-role.enum');

/**
 * Doctor Routes
 * Defines all doctor profile endpoints
 */

const router = express.Router();

/**
 * @route   POST /api/v1/doctors/profile
 * @desc    Create doctor profile
 * @access  Private (DOCTOR only)
 */
router.post(
    '/profile',
    authenticate,
    authorize(UserRole.DOCTOR),
    validate(createDoctorProfileSchema),
    doctorController.createProfile
);

/**
 * @route   GET /api/v1/doctors/profile
 * @desc    Get my doctor profile
 * @access  Private (DOCTOR only)
 */
router.get(
    '/profile',
    authenticate,
    authorize(UserRole.DOCTOR),
    doctorController.getMyProfile
);

/**
 * @route   GET /api/v1/doctors/:publicId
 * @desc    Get doctor public profile
 * @access  Public
 */
router.get(
    '/:publicId',
    doctorController.getDoctorByPublicId
);

/**
 * @route   GET /api/v1/doctors
 * @desc    Get all verified doctors
 * @access  Public
 */
router.get(
    '/',
    doctorController.getAllVerifiedDoctors
);

/**
 * @route   PUT /api/v1/doctors/profile
 * @desc    Update my doctor profile
 * @access  Private (DOCTOR only)
 */
router.put(
    '/profile',
    authenticate,
    authorize(UserRole.DOCTOR),
    validate(updateDoctorProfileSchema),
    doctorController.updateProfile
);

/**
 * @route   DELETE /api/v1/doctors/profile
 * @desc    Soft delete my doctor profile
 * @access  Private (DOCTOR only)
 */
router.delete(
    '/profile',
    authenticate,
    authorize(UserRole.DOCTOR),
    doctorController.deleteProfile
);

module.exports = router;
