const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middlewares/auth.middleware');

/**
 * Payment Routes
 */

// Initiate payment (Authenticated)
router.post(
    '/initiate',
    authenticate,
    paymentController.initiatePayment
);

// PayHere webhook (Public - no auth)
router.post(
    '/webhook',
    paymentController.handleWebhook
);

// Simulate payment success (DEVELOPMENT ONLY)
router.post(
    '/simulate-success/:publicId',
    authenticate,
    paymentController.simulateSuccess
);

// Download payment receipt (Authenticated)
router.get(
    '/:appointmentId/receipt',
    authenticate,
    paymentController.downloadReceipt
);

module.exports = router;
