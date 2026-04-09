const contactMessageService = require('../../application/services/contact-message.service');

/**
 * Contact Message Controller
 * Handles HTTP requests for contact form
 */

class ContactMessageController {
    
    /**
     * @route POST /api/v1/contact-messages
     * @access Public
     */
    async submitMessage(req, res, next) {
        try {
            const data = {
                name: req.body.name,
                email: req.body.email,
                message: req.body.message
            };
            const message = await contactMessageService.submitMessage(data);
            
            res.status(201).json({
                success: true,
                message: 'Your message has been submitted successfully.',
                data: message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/v1/contact-messages
     * @access Private/Admin
     */
    async getAllMessages(req, res, next) {
        try {
            const messages = await contactMessageService.getAllMessages();

            res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route PATCH /api/v1/contact-messages/:id/resolve
     * @access Private/Admin
     */
    async toggleResolveMessage(req, res, next) {
        try {
            const messageId = parseInt(req.params.id);
            const { isResolved } = req.body;

            if (typeof isResolved !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isResolved must be a boolean'
                });
            }

            const message = await contactMessageService.toggleResolveMessage(messageId, isResolved);

            res.status(200).json({
                success: true,
                message: `Message marked as ${isResolved ? 'resolved' : 'unresolved'}`,
                data: message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ContactMessageController();
