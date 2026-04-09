const consultationService = require('../../application/services/consultation.service');

/**
 * Consultation Controller
 * Thin HTTP handlers — all logic delegated to ConsultationService
 */

class ConsultationController {

    /**
     * GET /api/v1/consultations/join/:appointmentPublicId
     * Returns Jitsi join info for the authenticated user
     */
    async joinConsultation(req, res, next) {
        try {
            const userId = req.user.id;
            const { appointmentPublicId } = req.params;

            const joinInfo = await consultationService.getJoinInfo(appointmentPublicId, userId);

            res.status(200).json({
                success: true,
                data: joinInfo
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/consultations/by-appointment/:appointmentId
     * Returns consultation details including documents
     */
    async getConsultation(req, res, next) {
        try {
            const appointmentId = parseInt(req.params.appointmentId);
            const consultation = await consultationService.getConsultationByAppointment(appointmentId);

            res.status(200).json({
                success: true,
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/:id/start
     * Doctor starts the session — sets status to ACTIVE
     */
    async startConsultation(req, res, next) {
        try {
            const userId = req.user.id;
            const consultationId = parseInt(req.params.id);

            const updated = await consultationService.startConsultation(consultationId, userId);

            res.status(200).json({
                success: true,
                message: 'Consultation started',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/:id/end
     * Doctor ends the session — sets status to ENDED
     */
    async endConsultation(req, res, next) {
        try {
            const userId = req.user.id;
            const consultationId = parseInt(req.params.id);

            const updated = await consultationService.endConsultation(consultationId, userId);

            res.status(200).json({
                success: true,
                message: 'Consultation ended',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/:id/recording
     * Doctor saves a recording URL
     */
    async saveRecording(req, res, next) {
        try {
            const userId = req.user.id;
            const consultationId = parseInt(req.params.id);
            const { recordingUrl } = req.body;

            const updated = await consultationService.saveRecordingUrl(consultationId, userId, recordingUrl);

            res.status(200).json({
                success: true,
                message: 'Recording URL saved',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/:id/documents
     * Upload a document for this consultation (patient or doctor)
     */
    async uploadDocument(req, res, next) {
        try {
            const userId = req.user.id;
            const consultationId = parseInt(req.params.id);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const doc = await consultationService.uploadDocument(consultationId, userId, req.file);

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: doc
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/consultations/:id/documents
     * List all documents for a consultation
     */
    async getDocuments(req, res, next) {
        try {
            const userId = req.user.id;
            const consultationId = parseInt(req.params.id);

            const docs = await consultationService.getDocuments(consultationId, userId);

            res.status(200).json({
                success: true,
                data: docs
            });
        } catch (error) {
            next(error);
        }
    }

    /* =====================================================================
       Token-based endpoints (Pre-Join & Meeting Room flow)
       ===================================================================== */

    /**
     * GET /api/v1/consultations/token/:token
     * Get consultation details for the pre-join page
     */
    async getByToken(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;

            const consultation = await consultationService.getConsultationByToken(token, userId);

            res.status(200).json({
                success: true,
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/token/:token/join
     * Join the consultation (marks ACTIVE if early) + returns Jitsi info
     */
    async joinByToken(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;

            const result = await consultationService.joinConsultationByToken(token, userId);

            res.status(200).json({
                success: true,
                message: 'Joined consultation',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/token/:token/end
     * Doctor ends the session
     */
    async endByToken(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;

            const updated = await consultationService.endConsultationByToken(token, userId);

            res.status(200).json({
                success: true,
                message: 'Consultation ended',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/consultations/token/:token/notes
     * Doctor saves consultation notes
     */
    async saveNotes(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;
            const { notes } = req.body;

            const updated = await consultationService.saveNotesByToken(token, userId, notes);

            res.status(200).json({
                success: true,
                message: 'Notes saved',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/consultations/token/:token/messages
     * Get chat messages for the consultation
     */
    async getMessages(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;

            const messages = await consultationService.getMessagesByToken(token, userId);

            res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/consultations/token/:token/messages
     * Send a new message to the consultation thread
     */
    async sendMessage(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = req.params;
            const { message } = req.body;

            const newMessage = await consultationService.sendMessageByToken(token, userId, message);

            res.status(201).json({
                success: true,
                message: 'Message sent',
                data: newMessage
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConsultationController();
