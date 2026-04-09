const Joi = require('joi');

/**
 * Availability Validators
 * Request validation schemas for availability endpoints
 */

/**
 * Availability Validators
 * Request validation schemas for availability endpoints
 */

const createSlotsSchema = Joi.object({
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
            'any.required': 'Date is required'
        }),
    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
            'any.required': 'Start time is required'
        }),
    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.pattern.base': 'End time must be in HH:MM format (24-hour)',
            'any.required': 'End time is required'
        }),
    slotDuration: Joi.number()
        .integer()
        .min(15)
        .max(120)
        .default(30)
        .messages({
            'number.base': 'Slot duration must be a number',
            'number.min': 'Slot duration must be at least 15 minutes',
            'number.max': 'Slot duration cannot exceed 120 minutes'
        }),
    doctorId: Joi.number()
        .integer()
        .optional()
        .messages({
            'number.base': 'Doctor ID must be a number'
        })
});

module.exports = {
    createSlotsSchema
};
