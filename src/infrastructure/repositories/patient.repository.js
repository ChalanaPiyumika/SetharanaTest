const { Patient, User, Doctor, DoctorReview, Specialization, AppointmentSlot } = require('../database');

/**
 * Patient Repository
 * Data access layer for Patient operations
 */

class PatientRepository {
    /**
     * Create a new patient profile
     * @param {object} patientData - Patient data
     * @returns {Promise<object>} Created patient with user data
     */
    async create(patientData) {
        const patient = await Patient.create(patientData);
        return await this.findByUserId(patient.userId);
    }

    /**
     * Find patient by user ID
     * @param {number} userId - User ID
     * @returns {Promise<object|null>} Patient with user data or null
     */
    async findByUserId(userId) {
        return await Patient.findOne({
            where: { userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'publicId', 'email', 'firstName', 'lastName', 'phone', 'role', 'profileImageUrl']
            }]
        });
    }

    /**
     * Find patient by public ID
     * @param {string} publicId - Patient public ID (UUID)
     * @returns {Promise<object|null>} Patient with user data or null
     */
    async findByPublicId(publicId) {
        return await Patient.findOne({
            where: { publicId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'publicId', 'email', 'firstName', 'lastName', 'phone', 'role', 'profileImageUrl']
            }]
        });
    }

    /**
     * Update patient profile
     * @param {number} userId - User ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated patient
     */
    async update(userId, updateData) {
        const patient = await Patient.findOne({ where: { userId } });
        if (!patient) {
            throw new Error('Patient profile not found');
        }
        await patient.update(updateData);
        return await this.findByUserId(userId);
    }

    /**
     * Soft delete patient profile
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async softDelete(userId) {
        const patient = await Patient.findOne({ where: { userId } });
        if (!patient) {
            throw new Error('Patient profile not found');
        }
        await patient.update({ deletedAt: new Date() });
        return true;
    }

    /**
     * Check if patient profile exists for user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} True if exists
     */
    async existsByUserId(userId) {
        const count = await Patient.count({ where: { userId } });
        return count > 0;
    }

    /**
     * Get favorite doctors for a patient
     * @param {number} userId - User ID
     * @returns {Promise<Array>} List of favorite doctors
     */
    async getFavoriteDoctors(userId) {
        const patient = await Patient.findOne({ where: { userId } });
        if (!patient) return [];
        
        return await patient.getFavoriteDoctors({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'userId', 'profileImageUrl']
                },
                {
                    model: DoctorReview,
                    as: 'reviews',
                    attributes: ['reviewerName', 'stars', 'reviewText']
                },
                {
                    model: Specialization,
                    as: 'specializations',
                    attributes: ['name']
                },
                {
                    model: AppointmentSlot,
                    as: 'slots',
                    where: { isBooked: false },
                    attributes: ['slotDate', 'startTime', 'endTime'],
                    required: false
                }
            ]
        });
    }

    /**
     * Add a doctor to favorites
     * @param {number} userId - User ID
     * @param {number} doctorId - Doctor's primary key ID
     * @returns {Promise<void>}
     */
    async addFavoriteDoctor(userId, doctorId) {
        const patient = await Patient.findOne({ where: { userId } });
        if (patient) {
            await patient.addFavoriteDoctor(doctorId);
        }
    }

    /**
     * Remove a doctor from favorites
     * @param {number} userId - User ID
     * @param {number} doctorId - Doctor's primary key ID
     * @returns {Promise<void>}
     */
    async removeFavoriteDoctor(userId, doctorId) {
        const patient = await Patient.findOne({ where: { userId } });
        if (patient) {
            await patient.removeFavoriteDoctor(doctorId);
        }
    }
}

module.exports = new PatientRepository();
