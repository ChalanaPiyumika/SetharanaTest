const Joi = require('joi');

/**
 * Appointment Validators
 * Request validation schemas for appointment endpoints
 */

const bookAppointmentSchema = Joi.object({
    slotId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Slot ID must be a number',
            'number.positive': 'Slot ID must be positive',
            'any.required': 'Slot ID is required'
        }),
    consultationType: Joi.number()
        .integer()
        .valid(1, 2, 3)
        .required()
        .messages({
            'number.base': 'Consultation type must be a number',
            'any.only': 'Consultation type must be 1 (Video), 2 (In-Person), or 3 (Email)',
            'any.required': 'Consultation type is required'
        }),
    amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'any.required': 'Amount is required'
        })
});

const rescheduleAppointmentSchema = Joi.object({
    newSlotId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'New slot ID must be a number',
            'number.positive': 'New slot ID must be positive',
            'any.required': 'New slot ID is required'
        })
});

const cancelAppointmentSchema = Joi.object({
    cancellationReason: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.max': 'Cancellation reason cannot exceed 500 characters'
        })
});

const getAvailableSlotsSchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'Start date must be in ISO format'
        }),
    endDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'End date must be in ISO format'
        })
});

module.exports = {
    bookAppointmentSchema,
    rescheduleAppointmentSchema,
    cancelAppointmentSchema,
    getAvailableSlotsSchema
};
