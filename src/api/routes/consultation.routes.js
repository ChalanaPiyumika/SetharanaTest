const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { saveRecordingSchema } = require('../../application/validators/consultation.validator');

/**
 * Consultation Routes
 * All routes require authentication
 */

// ─── Token-Based Flow (Pre-Join & Meeting Room) ───────────────────────────────

// Get consultation details by token
router.get(
    '/token/:token',
    authenticate,
    consultationController.getByToken
);

// Join consultation by token
router.post(
    '/token/:token/join',
    authenticate,
    consultationController.joinByToken
);

// End consultation by token (Doctor only)
router.post(
    '/token/:token/end',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
        }
        next();
    },
    consultationController.endByToken
);

// Save doctor notes by token (Doctor only)
router.put(
    '/token/:token/notes',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
        }
        next();
    },
    consultationController.saveNotes
);

// Get chat messages by token
router.get(
    '/token/:token/messages',
    authenticate,
    consultationController.getMessages
);

// Send message by token
router.post(
    '/token/:token/messages',
    authenticate,
    consultationController.sendMessage
);

// ─── Join (Legacy) ───────────────────────────────────────────────────────────

// Get Jitsi join info for an appointment (patient OR doctor)
router.get(
    '/join/:appointmentPublicId',
    authenticate,
    consultationController.joinConsultation
);

// ─── Lookup ───────────────────────────────────────────────────────────────────

// Get consultation by appointment ID
router.get(
    '/by-appointment/:appointmentId',
    authenticate,
    consultationController.getConsultation
);

// ─── Lifecycle (doctor only — enforced in service layer) ─────────────────────

// Start consultation
router.post(
    '/:id/start',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
        }
        next();
    },
    consultationController.startConsultation
);

// End consultation
router.post(
    '/:id/end',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
        }
        next();
    },
    consultationController.endConsultation
);

// ─── Recording (doctor only) ──────────────────────────────────────────────────

router.post(
    '/:id/recording',
    authenticate,
    (req, res, next) => {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
        }
        next();
    },
    validate(saveRecordingSchema),
    consultationController.saveRecording
);

// ─── Documents (patient or doctor) ────────────────────────────────────────────

// Upload document
router.post(
    '/:id/documents',
    authenticate,
    upload.single('document'),
    consultationController.uploadDocument
);

// Get all documents
router.get(
    '/:id/documents',
    authenticate,
    consultationController.getDocuments
);

module.exports = router;
