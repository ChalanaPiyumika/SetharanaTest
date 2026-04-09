const patientService = require('../../application/services/patient.service');

/**
 * Patient Controller
 * Handles HTTP requests for patient profile endpoints
 */

class PatientController {
    /**
     * Create patient profile
     * POST /api/v1/patients/profile
     */
    async createProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const patient = await patientService.createProfile(userId, userRole, req.body);

            res.status(201).json({
                success: true,
                message: 'Patient profile created successfully',
                data: { patient }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get my patient profile
     * GET /api/v1/patients/profile
     */
    async getMyProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const patient = await patientService.getMyProfile(userId, userRole);

            res.status(200).json({
                success: true,
                data: { patient }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update patient profile
     * PUT /api/v1/patients/profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const patient = await patientService.updateProfile(userId, userRole, req.body);

            res.status(200).json({
                success: true,
                message: 'Patient profile updated successfully',
                data: { patient }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Soft delete patient profile
     * DELETE /api/v1/patients/profile
     */
    async deleteProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const result = await patientService.deleteProfile(userId, userRole);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get favorite doctors
     * GET /api/v1/patients/favorites
     */
    async getFavoriteDoctors(req, res, next) {
        try {
            const userId = req.user.id;
            const doctors = await patientService.getFavoriteDoctors(userId);

            const mapped = doctors.map(doc => {
                const user = doc.user || {};
                const fullName = [user.firstName, user.lastName]
                    .filter(Boolean).join(' ');

                return {
                    doctorId: doc.publicId,
                    profileImageUrl: doc.user?.profileImageUrl || null,
                    name: `Dr. ${fullName}`.trim(),
                    title: doc.title || 'Consultant Ayurvedic Doctor',
                    rating: Number(doc.rating) || 4.8,
                    specializations: Array.isArray(doc.specializations) && doc.specializations.length
                        ? doc.specializations.map(s => s.name)
                        : [],
                    description: doc.bio
                        ? [doc.bio]
                        : ['Experienced Ayurvedic specialist dedicated to holistic wellness.'],
                    availabilityDates: Array.isArray(doc.slots) && doc.slots.length
                        ? [...new Set(doc.slots.map(s => s.slotDate))]
                        : [],
                    consultationPrices: {
                        video: Number(doc.videoConsultationFee) || 1500,
                        email: Number(doc.emailConsultationFee) || 1500
                    },
                    category: doc.category,
                    reviews: Array.isArray(doc.reviews) && doc.reviews.length
                        ? doc.reviews.map(r => ({
                            name: r.reviewerName,
                            stars: r.stars,
                            description: r.reviewText
                          }))
                        : [],
                    slotsData: Array.isArray(doc.slots) && doc.slots.length 
                        ? doc.slots.map(s => ({
                            slotDate: s.slotDate,
                            startTime: s.startTime,
                            endTime: s.endTime
                          }))
                        : []
                };
            });

            res.status(200).json({
                success: true,
                data: {
                    doctors: mapped,
                    count: mapped.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add favorite doctor
     * POST /api/v1/patients/favorites/:doctorId
     */
    async addFavoriteDoctor(req, res, next) {
        try {
            const userId = req.user.id;
            const { doctorId } = req.params;

            const result = await patientService.addFavoriteDoctor(userId, doctorId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove favorite doctor
     * DELETE /api/v1/patients/favorites/:doctorId
     */
    async removeFavoriteDoctor(req, res, next) {
        try {
            const userId = req.user.id;
            const { doctorId } = req.params;

            const result = await patientService.removeFavoriteDoctor(userId, doctorId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientController();
