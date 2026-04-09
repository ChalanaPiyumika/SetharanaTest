/**
 * Validation Middleware
 * Validates request data against Joi schema
 */

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        // Determine which part of the request to validate
        let dataToValidate;
        switch (source) {
            case 'query':
                dataToValidate = req.query;
                break;
            case 'params':
                dataToValidate = req.params;
                break;
            case 'body':
            default:
                dataToValidate = req.body;
                break;
        }

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace the validated part with sanitized value
        if (source === 'query') {
            req.query = value;
        } else if (source === 'params') {
            req.params = value;
        } else {
            req.body = value;
        }

        next();
    };
};

module.exports = validate;
