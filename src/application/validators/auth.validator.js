const Joi = require('joi');
const { validRoles } = require('../../domain/enums/user-role.enum');

/**
 * Authentication Validators
 * Joi schemas for validating authentication requests
 */

/**
 * Register validation schema
 */
const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .max(256)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
            'any.required': 'Password is required'
        }),

    firstName: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'First name is required'
        }),

    lastName: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'Last name is required'
        }),

    phone: Joi.string()
        .max(20)
        .optional()
        .allow(''),

    role: Joi.string()
        .valid(...validRoles)
        .default('PATIENT')
        .messages({
            'any.only': 'Role must be one of: PATIENT, DOCTOR, ADMIN'
        })
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

/**
 * Refresh token validation schema
 * Note: refreshToken is now read from HTTP-only cookie, not request body
 */
const refreshTokenSchema = Joi.object({}).allow(null);

/**
 * Logout validation schema
 * Note: refreshToken is now read from HTTP-only cookie, not request body
 */
const logoutSchema = Joi.object({}).allow(null);

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

/**
 * Verify OTP validation schema
 */
const verifyOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    otp: Joi.string().length(6).required()
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
            'any.required': 'New password is required'
        })
});

/**
 * Change password validation schema (authenticated users)
 */
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
            'any.required': 'New password is required'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
};
