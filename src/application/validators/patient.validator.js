const Joi = require('joi');
const { validGenders } = require('../../domain/enums/gender.enum');

/**
 * Patient Profile Validators
 * Joi schemas for validating patient profile requests
 */

/**
 * Create patient profile validation schema
 */
const createPatientProfileSchema = Joi.object({
    dateOfBirth: Joi.date()
        .iso()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        }),

    gender: Joi.number()
        .valid(...validGenders)
        .optional()
        .messages({
            'any.only': 'Gender must be 1 (Male), 2 (Female), or 3 (Other)'
        }),

    bloodGroup: Joi.string()
        .max(10)
        .optional()
        .allow(''),

    address: Joi.string()
        .max(500)
        .optional()
        .allow(''),

    emergencyContactName: Joi.string()
        .max(100)
        .optional()
        .allow(''),

    emergencyContactPhone: Joi.string()
        .max(20)
        .pattern(/^[+]?[\d\s-()]+$/)
        .optional()
        .allow('')
        .messages({
            'string.pattern.base': 'Emergency contact phone must be a valid phone number'
        })
});

/**
 * Update patient profile validation schema
 * All fields are optional for updates
 */
const updatePatientProfileSchema = Joi.object({
    dateOfBirth: Joi.date()
        .iso()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        }),

    gender: Joi.number()
        .valid(...validGenders)
        .optional()
        .messages({
            'any.only': 'Gender must be 1 (Male), 2 (Female), or 3 (Other)'
        }),

    bloodGroup: Joi.string()
        .max(10)
        .optional()
        .allow(''),

    address: Joi.string()
        .max(500)
        .optional()
        .allow(''),

    emergencyContactName: Joi.string()
        .max(100)
        .optional()
        .allow(''),

    emergencyContactPhone: Joi.string()
        .max(20)
        .pattern(/^[+]?[\d\s-()]+$/)
        .optional()
        .allow('')
        .messages({
            'string.pattern.base': 'Emergency contact phone must be a valid phone number'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

module.exports = {
    createPatientProfileSchema,
    updatePatientProfileSchema
};
