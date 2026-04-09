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
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS (port 587) instead of SSL (port 465)
        family: 4,     // Force IPv4 — Render has IPv6 connectivity issues with Gmail
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
