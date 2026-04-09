const doctorRepository = require('../../infrastructure/repositories/doctor.repository');
const { UserRole } = require('../../domain/enums/user-role.enum');

/**
 * Doctor Service
 * Business logic for doctor profile operations
 */

class DoctorService {
    /**
     * Create doctor profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @param {object} profileData - Profile data
     * @returns {Promise<object>} Created profile
     */
    async createProfile(userId, userRole, profileData) {
        // Authorization: Only DOCTOR role can create doctor profile
        if (userRole !== UserRole.DOCTOR) {
            const error = new Error('Only doctors can create a doctor profile');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile already exists
        const existingProfile = await doctorRepository.existsByUserId(userId);
        if (existingProfile) {
            const error = new Error('Doctor profile already exists');
            error.statusCode = 409;
            throw error;
        }

        // Create profile (unverified by default)
        const doctor = await doctorRepository.create({
            userId,
            isVerified: false,
            ...profileData
        });

        return doctor;
    }

    /**
     * Get my doctor profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @returns {Promise<object>} Doctor profile
     */
    async getMyProfile(userId, userRole) {
        // Authorization: Only DOCTOR role can access own profile
        if (userRole !== UserRole.DOCTOR) {
            const error = new Error('Only doctors can access doctor profiles');
            error.statusCode = 403;
            throw error;
        }

        const doctor = await doctorRepository.findByUserId(userId);
        if (!doctor) {
            const error = new Error('Doctor profile not found');
            error.statusCode = 404;
            throw error;
        }

        return doctor;
    }

    /**
     * Get doctor by public ID (public access)
     * @param {string} publicId - Doctor public ID
     * @returns {Promise<object>} Doctor profile
     */
    async getDoctorByPublicId(publicId) {
        const doctor = await doctorRepository.findByPublicId(publicId);
        if (!doctor) {
            const error = new Error('Doctor not found');
            error.statusCode = 404;
            throw error;
        }

        return doctor;
    }

    /**
     * Get all verified doctors (public access)
     * @param {string} [category] - Optional category filter
     * @returns {Promise<Array>} List of verified doctors
     */
    async getAllVerifiedDoctors(category) {
        return await doctorRepository.findAllVerified(category);
    }

    /**
     * Update doctor profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated profile
     */
    async updateProfile(userId, userRole, updateData) {
        // Authorization: Only DOCTOR role can update doctor profile
        if (userRole !== UserRole.DOCTOR) {
            const error = new Error('Only doctors can update doctor profiles');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile exists
        const existingProfile = await doctorRepository.findByUserId(userId);
        if (!existingProfile) {
            const error = new Error('Doctor profile not found');
            error.statusCode = 404;
            throw error;
        }

        // Update profile
        const doctor = await doctorRepository.update(userId, updateData);
        return doctor;
    }

    /**
     * Soft delete doctor profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @returns {Promise<object>} Success message
     */
    async deleteProfile(userId, userRole) {
        // Authorization: Only DOCTOR role can delete doctor profile
        if (userRole !== UserRole.DOCTOR) {
            const error = new Error('Only doctors can delete doctor profiles');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile exists
        const existingProfile = await doctorRepository.findByUserId(userId);
        if (!existingProfile) {
            const error = new Error('Doctor profile not found');
            error.statusCode = 404;
            throw error;
        }

        // Soft delete
        await doctorRepository.softDelete(userId);
        return { message: 'Doctor profile deleted successfully' };
    }
}

module.exports = new DoctorService();
