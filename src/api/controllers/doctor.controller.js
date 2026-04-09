const doctorService = require('../../application/services/doctor.service');

/**
 * Doctor Controller
 * Handles HTTP requests for doctor profile endpoints
 */

class DoctorController {
    /**
     * Create doctor profile
     * POST /api/v1/doctors/profile
     */
    async createProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const doctor = await doctorService.createProfile(userId, userRole, req.body);

            res.status(201).json({
                success: true,
                message: 'Doctor profile created successfully',
                data: { doctor }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get my doctor profile
     * GET /api/v1/doctors/profile
     */
    async getMyProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const doctor = await doctorService.getMyProfile(userId, userRole);

            res.status(200).json({
                success: true,
                data: { doctor }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get doctor by public ID (public access)
     * GET /api/v1/doctors/:publicId
     */
    async getDoctorByPublicId(req, res, next) {
        try {
            const { publicId } = req.params;

            const doctor = await doctorService.getDoctorByPublicId(publicId);

            res.status(200).json({
                success: true,
                data: { doctor }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all verified doctors (public access)
     * GET /api/v1/doctors?category=...
     *
     * @returns {Promise<object>} Returns 200 with { success: true, message, data: { publicId, userId, doctorId, profileImageUrl, name, title, rating, specializations[], consultationFee, videoConsultationFee, emailConsultationFee } }
     *   description[], availabilityDates[], consultationPrices{video,email},
     *   category, reviews[]
     */
    async getAllVerifiedDoctors(req, res, next) {
        try {
            const { category } = req.query;
            const doctors = await doctorService.getAllVerifiedDoctors(category || null);

            /**
             * Map DB records to the shape exactly consumed by the frontend.
             * All keys must match what DoctorCard, DoctorPopup, BookSession,
             * and AvailabilityCalendar read – never change UI for backend quirks.
             */
            const mapped = doctors.map(doc => {
                const user = doc.user || {};
                const fullName = [user.firstName, user.lastName]
                    .filter(Boolean).join(' ');

                return {
                    // DoctorsSection: used as key + to find selected doctor in popup
                    doctorId: doc.publicId,

                    // DoctorCard + DoctorPopup: profile image
                    profileImageUrl: doc.user ? doc.user.profileImageUrl : null,

                    // DoctorCard + DoctorPopup: display name
                    name: `Dr. ${fullName}`.trim(),

                    // DoctorCard + DoctorPopup: sub-title
                    title: doc.title || 'Consultant Ayurvedic Doctor',

                    // DoctorCard + DoctorPopup: star rating display
                    rating: Number(doc.rating) || 4.8,

                    // DoctorPopup: specialization tags (array of strings)
                    specializations: Array.isArray(doc.specializations) && doc.specializations.length
                        ? doc.specializations.map(s => s.name)
                        : [],

                    // DoctorPopup: about paragraphs (array of strings)
                    description: doc.bio
                        ? [doc.bio]
                        : ['Experienced Ayurvedic specialist dedicated to holistic wellness.'],

                    // AvailabilityCalendar: highlighted dates (YYYY-MM-DD strings)
                    availabilityDates: Array.isArray(doc.slots) && doc.slots.length
                        ? [...new Set(doc.slots.map(s => s.slotDate))]
                        : [],

                    // BookSession: consultation pricing
                    consultationPrices: {
                        video: Number(doc.videoConsultationFee) || 1500,
                        email: Number(doc.emailConsultationFee) || 1500
                    },

                    // DoctorPopup section header filtering
                    category: doc.category,

                    // DoctorPopup reviews Swiper (array of {name, stars, description})
                    reviews: Array.isArray(doc.reviews) && doc.reviews.length
                        ? doc.reviews.map(r => ({
                            name: r.reviewerName,
                            stars: r.stars,
                            description: r.reviewText
                          }))
                        : [],

                    // Consulting Section Time Filtering 
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
     * Update doctor profile
     * PUT /api/v1/doctors/profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const doctor = await doctorService.updateProfile(userId, userRole, req.body);

            res.status(200).json({
                success: true,
                message: 'Doctor profile updated successfully',
                data: { doctor }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Soft delete doctor profile
     * DELETE /api/v1/doctors/profile
     */
    async deleteProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const result = await doctorService.deleteProfile(userId, userRole);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DoctorController();
