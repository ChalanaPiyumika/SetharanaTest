const Joi = require('joi');

/**
 * Doctor Profile Validators
 * Joi schemas for validating doctor profile requests
 */

/**
 * Create doctor profile validation schema
 */
const createDoctorProfileSchema = Joi.object({
    registrationNumber: Joi.string()
        .max(100)
        .required()
        .messages({
            'any.required': 'Registration number is required',
            'string.empty': 'Registration number cannot be empty'
        }),

    experienceYears: Joi.number()
        .integer()
        .min(0)
        .max(70)
        .optional()
        .messages({
            'number.min': 'Experience years cannot be negative',
            'number.max': 'Experience years seems unrealistic'
        }),

    consultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Consultation fee cannot be negative'
        }),

    videoConsultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Video consultation fee cannot be negative'
        }),

    emailConsultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Email consultation fee cannot be negative'
        }),

    bio: Joi.string()
        .max(2000)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Bio cannot exceed 2000 characters'
        }),

    title: Joi.string()
        .max(255)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Title cannot exceed 255 characters'
        }),

    category: Joi.string()
        .valid('Ayurvedha Specialists', 'Panchakarma Specialists', 'Wellness Experts')
        .required()
        .messages({
            'any.only': 'Invalid category. Must be one of: Ayurvedha Specialists, Panchakarma Specialists, Wellness Experts',
            'any.required': 'Category is required'
        }),

    specializations: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Specializations must be an array of strings'
        })
});

/**
 * Update doctor profile validation schema
 * All fields optional except registrationNumber cannot be changed
 */
const updateDoctorProfileSchema = Joi.object({
    experienceYears: Joi.number()
        .integer()
        .min(0)
        .max(70)
        .optional()
        .messages({
            'number.min': 'Experience years cannot be negative',
            'number.max': 'Experience years seems unrealistic'
        }),

    consultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Consultation fee cannot be negative'
        }),

    videoConsultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Video consultation fee cannot be negative'
        }),

    emailConsultationFee: Joi.number()
        .precision(2)
        .min(0)
        .optional()
        .messages({
            'number.min': 'Email consultation fee cannot be negative'
        }),

    bio: Joi.string()
        .max(2000)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Bio cannot exceed 2000 characters'
        }),

    title: Joi.string()
        .max(255)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Title cannot exceed 255 characters'
        }),

    category: Joi.string()
        .valid('Ayurvedha Specialists', 'Panchakarma Specialists', 'Wellness Experts')
        .optional()
        .messages({
            'any.only': 'Invalid category. Must be one of: Ayurvedha Specialists, Panchakarma Specialists, Wellness Experts'
        }),

    specializations: Joi.array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Specializations must be an array of strings'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

module.exports = {
    createDoctorProfileSchema,
    updateDoctorProfileSchema
};
