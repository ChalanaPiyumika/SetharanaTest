const { Consultation, ConsultationDocument, Appointment, Doctor, Patient, User, AppointmentSlot } = require('../database');

/**
 * Consultation Repository
 * Data access layer for consultations and consultation documents
 */

class ConsultationRepository {

    /**
     * Create a new consultation
     * @param {object} data - { appointmentId, roomName }
     * @returns {Promise<object>} Created consultation
     */
    async create(data) {
        return await Consultation.create(data);
    }

    /**
     * Find consultation by ID with full associations
     * @param {number} id - ConsultationId
     * @returns {Promise<object|null>}
     */
    async findById(id) {
        return await Consultation.findByPk(id, {
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    include: [
                        {
                            model: Patient,
                            as: 'patient',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
                        },
                        {
                            model: Doctor,
                            as: 'doctor',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
                        },
                        { model: AppointmentSlot, as: 'slot' }
                    ]
                },
                { model: ConsultationDocument, as: 'documents' }
            ]
        });
    }

    /**
     * Find consultation by appointment ID
     * @param {number} appointmentId
     * @returns {Promise<object|null>}
     */
    async findByAppointmentId(appointmentId) {
        return await Consultation.findOne({
            where: { appointmentId },
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    include: [
                        {
                            model: Patient,
                            as: 'patient',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
                        },
                        {
                            model: Doctor,
                            as: 'doctor',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'] }]
                        },
                        { model: AppointmentSlot, as: 'slot' }
                    ]
                },
                { model: ConsultationDocument, as: 'documents' }
            ]
        });
    }

    /**
     * Find consultation by meetingToken (for pre-join / room pages)
     * @param {string} token - UUID meeting token
     * @returns {Promise<object|null>}
     */
    async findByToken(token) {
        return await Consultation.findOne({
            where: { meetingToken: token },
            include: [
                {
                    model: Appointment,
                    as: 'appointment',
                    include: [
                        {
                            model: Patient,
                            as: 'patient',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'] }]
                        },
                        {
                            model: Doctor,
                            as: 'doctor',
                            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'] }]
                        },
                        { model: AppointmentSlot, as: 'slot' }
                    ]
                },
                { model: ConsultationDocument, as: 'documents' }
            ]
        });
    }

    /**
     * Update consultation fields
     * @param {number} id - ConsultationId
     * @param {object} updates - Fields to update
     * @returns {Promise<object>} Updated consultation
     */
    async update(id, updates) {
        const consultation = await Consultation.findByPk(id);
        if (!consultation) {
            const err = new Error('Consultation not found');
            err.statusCode = 404;
            throw err;
        }
        return await consultation.update(updates);
    }

    /**
     * Save a document record for a consultation
     * @param {object} data - { consultationId, fileName, filePath, mimeType, uploadedBy }
     * @returns {Promise<object>} Created document record
     */
    async addDocument(data) {
        return await ConsultationDocument.create(data);
    }

    /**
     * Get all documents for a consultation
     * @param {number} consultationId
     * @returns {Promise<Array>}
     */
    async getDocuments(consultationId) {
        return await ConsultationDocument.findAll({
            where: { consultationId },
            order: [['CreatedAt', 'ASC']]
        });
    }
}

module.exports = new ConsultationRepository();
