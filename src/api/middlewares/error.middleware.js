const env = require('../../shared/config/env');

/**
 * Centralized Error Handling Middleware
 * Catches and formats all errors
 */

const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error:', err);

    // Default error values
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    // Send error response
    const response = {
        success: false,
        message
    };

    // Include stack trace in development
    if (env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
