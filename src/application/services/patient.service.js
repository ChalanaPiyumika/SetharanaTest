const patientRepository = require('../../infrastructure/repositories/patient.repository');
const doctorRepository = require('../../infrastructure/repositories/doctor.repository');
const { UserRole } = require('../../domain/enums/user-role.enum');

/**
 * Patient Service
 * Business logic for patient profile operations
 */

class PatientService {
    /**
     * Create patient profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @param {object} profileData - Profile data
     * @returns {Promise<object>} Created profile
     */
    async createProfile(userId, userRole, profileData) {
        // Authorization: Only PATIENT role can create patient profile
        if (userRole !== UserRole.PATIENT) {
            const error = new Error('Only patients can create a patient profile');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile already exists
        const existingProfile = await patientRepository.existsByUserId(userId);
        if (existingProfile) {
            const error = new Error('Patient profile already exists');
            error.statusCode = 409;
            throw error;
        }

        // Create profile
        const patient = await patientRepository.create({
            userId,
            ...profileData
        });

        return patient;
    }

    /**
     * Get my patient profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @returns {Promise<object>} Patient profile
     */
    async getMyProfile(userId, userRole) {
        // Authorization: Only PATIENT role can access patient profile
        if (userRole !== UserRole.PATIENT) {
            const error = new Error('Only patients can access patient profiles');
            error.statusCode = 403;
            throw error;
        }

        const patient = await patientRepository.findByUserId(userId);
        if (!patient) {
            const error = new Error('Patient profile not found');
            error.statusCode = 404;
            throw error;
        }

        return patient;
    }

    /**
     * Update patient profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated profile
     */
    async updateProfile(userId, userRole, updateData) {
        // Authorization: Only PATIENT role can update patient profile
        if (userRole !== UserRole.PATIENT) {
            const error = new Error('Only patients can update patient profiles');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile exists
        const existingProfile = await patientRepository.findByUserId(userId);
        if (!existingProfile) {
            const error = new Error('Patient profile not found');
            error.statusCode = 404;
            throw error;
        }

        // Update profile
        const patient = await patientRepository.update(userId, updateData);
        return patient;
    }

    /**
     * Soft delete patient profile
     * @param {number} userId - Authenticated user ID
     * @param {string} userRole - User role
     * @returns {Promise<object>} Success message
     */
    async deleteProfile(userId, userRole) {
        // Authorization: Only PATIENT role can delete patient profile
        if (userRole !== UserRole.PATIENT) {
            const error = new Error('Only patients can delete patient profiles');
            error.statusCode = 403;
            throw error;
        }

        // Check if profile exists
        const existingProfile = await patientRepository.findByUserId(userId);
        if (!existingProfile) {
            const error = new Error('Patient profile not found');
            error.statusCode = 404;
            throw error;
        }

        // Soft delete
        await patientRepository.softDelete(userId);
        return { message: 'Patient profile deleted successfully' };
    }
    /**
     * Get favorite doctors for a patient
     * @param {number} userId - Authenticated user ID
     */
    async getFavoriteDoctors(userId) {
        return await patientRepository.getFavoriteDoctors(userId);
    }

    /**
     * Add doctor to favorites
     * @param {number} userId - Authenticated user ID (Patient's user ID)
     * @param {string} doctorPublicId - Doctor Public ID (UUID)
     */
    async addFavoriteDoctor(userId, doctorIdParam) {
        // Find doctor by publicId or id
        let doctor = null;
        if (!isNaN(parseInt(doctorIdParam)) && !doctorIdParam.includes('-')) {
            // It's likely an integer ID (used by frontend static mock data)
            doctor = await doctorRepository.findById(parseInt(doctorIdParam));
        } else {
            doctor = await doctorRepository.findByPublicId(doctorIdParam);
        }

        if (!doctor) {
            const error = new Error('Doctor not found');
            error.statusCode = 404;
            throw error;
        }

        await patientRepository.addFavoriteDoctor(userId, doctor.id);
        return { message: 'Doctor added to favorites' };
    }

    /**
     * Remove doctor from favorites
     * @param {number} userId - Authenticated user ID
     * @param {string} doctorPublicId - Doctor Public ID
     */
    async removeFavoriteDoctor(userId, doctorIdParam) {
        // Find by integer ID or publicUUID
        let doctor = null;
        if (!isNaN(parseInt(doctorIdParam)) && !doctorIdParam.includes('-')) {
            doctor = await doctorRepository.findById(parseInt(doctorIdParam));
        } else {
            doctor = await doctorRepository.findByPublicId(doctorIdParam);
        }

        if (!doctor) {
            const error = new Error('Doctor not found');
            error.statusCode = 404;
            throw error;
        }

        await patientRepository.removeFavoriteDoctor(userId, doctor.id);
        return { message: 'Doctor removed from favorites' };
    }
}

module.exports = new PatientService();
