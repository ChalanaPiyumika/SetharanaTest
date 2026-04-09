const { Doctor, User, Specialization, DoctorReview, AppointmentSlot } = require('../database');

/**
 * Doctor Repository
 * Data access layer for Doctor operations
 */

class DoctorRepository {
    /**
     * Create a new doctor profile
     * @param {object} doctorData - Doctor data
     * @returns {Promise<object>} Created doctor with user data
     */
    async create(doctorData) {
        const doctor = await Doctor.create(doctorData);
        return await this.findByUserId(doctor.userId);
    }

    /**
     * Find doctor by ID
     * @param {number} id - Doctor primary key
     * @returns {Promise<object|null>} Doctor record
     */
    async findById(id) {
        return await Doctor.findByPk(id);
    }

    /**
     * Find doctor by user ID
     * @param {number} userId - User ID
     * @returns {Promise<object|null>} Doctor with user data or null
     */
    async findByUserId(userId) {
        return await Doctor.findOne({
            where: { userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'publicId', 'email', 'firstName', 'lastName', 'phone', 'role', 'profileImageUrl']
            }]
        });
    }

    /**
     * Find doctor by public ID
     * @param {string} publicId - Doctor public ID (UUID)
     * @returns {Promise<object|null>} Doctor with user data or null
     */
    async findByPublicId(publicId) {
        return await Doctor.findOne({
            where: { publicId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'publicId', 'email', 'firstName', 'lastName', 'phone', 'role', 'profileImageUrl']
            }]
        });
    }

    /**
     * Find all verified doctors
     * @param {string} [category] - Optional category filter
     * @returns {Promise<Array>} List of verified doctors with user data
     */
    async findAllVerified(category) {
        const where = { isVerified: true };
        if (category) where.category = category;

        return await Doctor.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'publicId', 'email', 'firstName', 'lastName', 'phone', 'profileImageUrl']
                },
                {
                    model: Specialization,
                    as: 'specializations',
                    attributes: ['name'],
                    through: { attributes: [] }
                },
                {
                    model: DoctorReview,
                    as: 'reviews',
                    attributes: ['reviewerName', 'stars', 'reviewText']
                },
                {
                    model: AppointmentSlot,
                    as: 'slots',
                    where: { isBooked: false },
                    attributes: ['slotDate', 'startTime', 'endTime'],
                    required: false // Left join, so doctors without slots still show up
                }
            ],
            order: [['CreatedAt', 'DESC']]
        });
    }

    /**
     * Update doctor profile
     * @param {number} userId - User ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated doctor
     */
    async update(userId, updateData) {
        const doctor = await Doctor.findOne({ where: { userId } });
        if (!doctor) {
            throw new Error('Doctor profile not found');
        }
        await doctor.update(updateData);
        return await this.findByUserId(userId);
    }

    /**
     * Soft delete doctor profile
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async softDelete(userId) {
        const doctor = await Doctor.findOne({ where: { userId } });
        if (!doctor) {
            throw new Error('Doctor profile not found');
        }
        await doctor.update({ deletedAt: new Date() });
        return true;
    }

    /**
     * Check if doctor profile exists for user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} True if exists
     */
    async existsByUserId(userId) {
        const count = await Doctor.count({ where: { userId } });
        return count > 0;
    }
}

module.exports = new DoctorRepository();
