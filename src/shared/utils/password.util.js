const bcrypt = require('bcryptjs');

/**
 * Password Utility
 * Handles password hashing and comparison
 */

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword
};
