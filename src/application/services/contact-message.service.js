const contactMessageRepository = require('../../infrastructure/repositories/contact-message.repository');

/**
 * Contact Message Service
 * Business logic for contact form messages
 */

class ContactMessageService {

    /**
     * Submit a new contact message
     * @param {object} data - { name, email, message }
     * @returns {Promise<object>} Created message
     */
    async submitMessage(data) {
        if (!data.name || !data.email || !data.message) {
            const err = new Error('Name, email, and message are required');
            err.statusCode = 400;
            throw err;
        }

        // Email regex valid check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            const err = new Error('Invalid email format');
            err.statusCode = 400;
            throw err;
        }

        return await contactMessageRepository.create({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            message: data.message.trim()
        });
    }

    /**
     * Get all contact messages for Admin
     * @returns {Promise<Array>} List of messages
     */
    async getAllMessages() {
        return await contactMessageRepository.findAll();
    }

    /**
     * Mark a message as resolved / unresolved
     * @param {number} messageId 
     * @param {boolean} isResolved 
     * @returns {Promise<object>} Updated message
     */
    async toggleResolveMessage(messageId, isResolved) {
        const message = await contactMessageRepository.findById(messageId);
        
        if (!message) {
            const err = new Error('Message not found');
            err.statusCode = 404;
            throw err;
        }

        return await contactMessageRepository.update(messageId, {
            isResolved,
            resolvedAt: isResolved ? new Date() : null
        });
    }

}

module.exports = new ContactMessageService();
