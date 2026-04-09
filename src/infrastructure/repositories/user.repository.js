const { User } = require('../database');

/**
 * User Repository
 * Data access layer for User operations
 */

class UserRepository {
    /**
     * Create a new user
     * @param {object} userData - User data
     * @returns {Promise<object>} Created user
     */
    async create(userData) {
        return await User.create(userData);
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<object|null>} User or null
     */
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<object|null>} User or null
     */
    async findById(id) {
        return await User.findByPk(id);
    }

    /**
     * Find user by public ID
     * @param {string} publicId - User public ID (UUID)
     * @returns {Promise<object|null>} User or null
     */
    async findByPublicId(publicId) {
        return await User.findOne({ where: { publicId } });
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated user
     */
    async update(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }
        return await user.update(updateData);
    }

    /**
     * Find all users (for admin purposes)
     * @param {object} options - Query options
     * @returns {Promise<Array>} List of users
     */
    async findAll(options = {}) {
        return await User.findAll(options);
    }
}

module.exports = new UserRepository();
