const nodemailer = require('nodemailer');
const env = require('./env');

/**
 * Email Configuration
 * Nodemailer transporter setup
 */

let transporter = null;

// Only create transporter if email credentials are configured
if (env.EMAIL_USER && env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        }
    });

    // Verify transporter configuration (non-blocking)
    transporter.verify((error, success) => {
        if (error) {
            console.error('✗ Email configuration error:', error.message);
        } else {
            console.log('✓ Email service is ready');
        }
    });
} else {
    console.log('⚠ Email service not configured (EMAIL_USER and EMAIL_PASS not set)');
}

module.exports = transporter;
