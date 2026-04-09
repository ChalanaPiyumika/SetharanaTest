const { ContactMessage } = require('../database');

/**
 * Contact Message Repository
 * Handles database operations for contact messages
 */

class ContactMessageRepository {
    /**
     * Create a new contact message
     * @param {object} messageData 
     * @returns {Promise<object>} Created message
     */
    async create(messageData) {
        return await ContactMessage.create(messageData);
    }

    /**
     * Find all contact messages
     * @param {object} query Options (e.g. order by created/resolved)
     * @returns {Promise<Array>} List of messages
     */
    async findAll(query = {}) {
        return await ContactMessage.findAll({
            order: [
                ['IsResolved', 'ASC'],
                ['CreatedAt', 'DESC']
            ],
            ...query
        });
    }

    /**
     * Find message by ID
     * @param {number} id 
     * @returns {Promise<object|null>} Message
     */
    async findById(id) {
        return await ContactMessage.findByPk(id);
    }

    /**
     * Update message by ID
     * @param {number} id 
     * @param {object} updateData 
     * @returns {Promise<object>} Updated message
     */
    async update(id, updateData) {
        const message = await ContactMessage.findByPk(id);
        if (!message) return null;
        
        return await message.update(updateData);
    }
}

module.exports = new ContactMessageRepository();
