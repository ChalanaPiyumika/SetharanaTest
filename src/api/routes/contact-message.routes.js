const express = require('express');
const contactMessageController = require('../controllers/contact-message.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { UserRole } = require('../../domain/enums/user-role.enum');

const router = express.Router();

/**
 * @route POST /api/v1/contact-messages
 * @desc Submit a new contact message
 * @access Public
 */
router.post('/', contactMessageController.submitMessage);

/**
 * @route GET /api/v1/contact-messages
 * @desc Get all contact messages
 * @access Private (Admin only)
 */
router.get('/', authenticate, authorize(UserRole.ADMIN), contactMessageController.getAllMessages);

/**
 * @route PATCH /api/v1/contact-messages/:id/resolve
 * @desc Mark a message as resolved or unresolved
 * @access Private (Admin only)
 */
router.patch('/:id/resolve', authenticate, authorize(UserRole.ADMIN), contactMessageController.toggleResolveMessage);

module.exports = router;
