const express = require('express');
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    createPatientProfileSchema,
    updatePatientProfileSchema
} = require('../../application/validators/patient.validator');
const { UserRole } = require('../../domain/enums/user-role.enum');

/**
 * Patient Routes
 * Defines all patient profile endpoints
 */

const router = express.Router();

/**
 * @route   POST /api/v1/patients/profile
 * @desc    Create patient profile
 * @access  Private (PATIENT only)
 */
router.post(
    '/profile',
    authenticate,
    authorize(UserRole.PATIENT),
    validate(createPatientProfileSchema),
    patientController.createProfile
);

/**
 * @route   GET /api/v1/patients/profile
 * @desc    Get my patient profile
 * @access  Private (PATIENT only)
 */
router.get(
    '/profile',
    authenticate,
    authorize(UserRole.PATIENT),
    patientController.getMyProfile
);

/**
 * @route   PUT /api/v1/patients/profile
 * @desc    Update my patient profile
 * @access  Private (PATIENT only)
 */
router.put(
    '/profile',
    authenticate,
    authorize(UserRole.PATIENT),
    validate(updatePatientProfileSchema),
    patientController.updateProfile
);

/**
 * @route   DELETE /api/v1/patients/profile
 * @desc    Soft delete my patient profile
 * @access  Private (PATIENT only)
 */
router.delete(
    '/profile',
    authenticate,
    authorize(UserRole.PATIENT),
    patientController.deleteProfile
);

/**
 * @route   GET /api/v1/patients/favorites
 * @desc    Get favorite doctors for logged in patient
 * @access  Private (PATIENT only)
 */
router.get(
    '/favorites',
    authenticate,
    authorize(UserRole.PATIENT),
    patientController.getFavoriteDoctors
);

/**
 * @route   POST /api/v1/patients/favorites/:doctorId
 * @desc    Add doctor to favorites
 * @access  Private (PATIENT only)
 */
router.post(
    '/favorites/:doctorId',
    authenticate,
    authorize(UserRole.PATIENT),
    patientController.addFavoriteDoctor
);

/**
 * @route   DELETE /api/v1/patients/favorites/:doctorId
 * @desc    Remove doctor from favorites
 * @access  Private (PATIENT only)
 */
router.delete(
    '/favorites/:doctorId',
    authenticate,
    authorize(UserRole.PATIENT),
    patientController.removeFavoriteDoctor
);

module.exports = router;
