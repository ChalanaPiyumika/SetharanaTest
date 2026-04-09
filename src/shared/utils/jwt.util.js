const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * JWT Utility
 * Handles JWT token generation and verification
 */

/**
 * Generate access token
 * @param {object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
        algorithm: 'HS256'
    });
};

/**
 * Generate refresh token
 * @param {object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
        algorithm: 'HS256'
    });
};

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
