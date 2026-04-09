require('dotenv').config();

/**
 * Environment Configuration
 * Centralized access to environment variables
 */

const env = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 3306,
    DB_NAME: process.env.DB_NAME || 'ayurveda_consultation',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_SSL: process.env.DB_SSL === 'true',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    REFRESH_SECRET: process.env.REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '20m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // PayHere Configuration
    PAYHERE_MERCHANT_ID: process.env.PAYHERE_MERCHANT_ID || '',
    PAYHERE_MERCHANT_SECRET: process.env.PAYHERE_MERCHANT_SECRET || '',
    PAYHERE_SANDBOX: process.env.PAYHERE_SANDBOX === 'true',
    PAYHERE_NOTIFY_URL: process.env.PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/v1/payments/webhook',
    PAYHERE_RETURN_URL: process.env.PAYHERE_RETURN_URL || 'http://localhost:3000/payment-success',
    PAYHERE_CANCEL_URL: process.env.PAYHERE_CANCEL_URL || 'http://localhost:3000/payment-cancel',

    // PayHere Refund API (OAuth credentials from Settings > API Keys)
    PAYHERE_APP_ID: process.env.PAYHERE_APP_ID || '',
    PAYHERE_APP_SECRET: process.env.PAYHERE_APP_SECRET || '',

    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'Ayurveda Consultation <noreply@ayurveda.com>',

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

    // JaaS (Jitsi as a Service) Configuration
    JAAS_APP_ID: process.env.JAAS_APP_ID || '',
    JAAS_API_KEY_ID: process.env.JAAS_API_KEY_ID || '',
    JAAS_PRIVATE_KEY: process.env.JAAS_PRIVATE_KEY || '',
};

module.exports = env;
