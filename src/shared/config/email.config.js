const nodemailer = require('nodemailer');
const dns = require('dns');
const env = require('./env');

/**
 * Email Configuration
 * Nodemailer transporter setup
 */

let transporter = null;

// Only create transporter if email credentials are configured
if (env.EMAIL_USER && env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT == 465, // Use SSL for port 465, STARTTLS for 587
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
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
