const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const profileUpload = require('../middlewares/upload.profile.middleware');
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
} = require('../../application/validators/auth.validator');
const { UserRole } = require('../../domain/enums/user-role.enum');

/**
 * Authentication Routes
 * Defines all authentication endpoints
 */

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/social-login
 * @desc    Login/Register user via Google or Apple
 * @access  Public
 */
router.post('/social-login', authController.socialLogin);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', validate(logoutSchema), authController.logout);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset token
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile (name, phone, country, city, timezone)
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   POST /api/v1/auth/profile/image
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/profile/image', authenticate, profileUpload.single('profileImage'), authController.uploadProfileImage);

/**
 * @route   DELETE /api/v1/auth/profile/image
 * @desc    Remove profile picture
 * @access  Private
 */
router.delete('/profile/image', authenticate, authController.removeProfileImage);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
