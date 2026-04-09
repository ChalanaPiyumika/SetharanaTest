const env = require('../config/env');

/**
 * Cookie Utility
 * Handles setting and clearing HTTP-only cookies for JWT tokens
 */

/**
 * Parse expiry time string to milliseconds
 * @param {string} expiryString - Time string like '15m', '7d', '1h'
 * @returns {number} Milliseconds
 */
const parseExpiryToMs = (expiryString) => {
    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid expiry format: ${expiryString}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
};

/**
 * Set authentication cookies (access and refresh tokens)
 * @param {object} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = env.NODE_ENV === 'production';

    // Cookie options for access token
    const accessTokenOptions = {
        httpOnly: true,
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'strict' : 'lax', // Use lax in dev for cross-port, strict in prod
        maxAge: parseExpiryToMs(env.JWT_ACCESS_EXPIRY),
        path: '/'
    };

    // Cookie options for refresh token
    const refreshTokenOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: parseExpiryToMs(env.JWT_REFRESH_EXPIRY),
        path: '/'
    };

    // Set cookies
    res.cookie('accessToken', accessToken, accessTokenOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenOptions);
};

/**
 * Clear authentication cookies
 * @param {object} res - Express response object
 */
const clearAuthCookies = (res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
};

module.exports = {
    setAuthCookies,
    clearAuthCookies
};
