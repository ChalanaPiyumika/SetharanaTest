const Joi = require('joi');

/**
 * Consultation Validators
 * Joi schemas for consultation-related request bodies
 */

const saveRecordingSchema = Joi.object({
    recordingUrl: Joi.string().uri().required().messages({
        'string.uri':  '"recordingUrl" must be a valid URL',
        'any.required': '"recordingUrl" is required'
    })
});

module.exports = { saveRecordingSchema };
