const availabilityService = require('../../application/services/availability.service');
const doctorRepository = require('../../infrastructure/repositories/doctor.repository');

/**
 * Availability Controller
 * HTTP request handlers for doctor availability
 */

class AvailabilityController {
    /**
     * Create slots for a date
     * POST /api/v1/availability/slots
     */
    async createSlots(req, res, next) {
        try {
            const userId = req.user.id;

            // Get doctor profile
            const doctor = await doctorRepository.findByUserId(userId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            const slots = await availabilityService.createSlots(
                doctor.id,
                req.body
            );

            res.status(201).json({
                success: true,
                message: 'Time slots created successfully',
                data: slots
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get my bookable slots
     * GET /api/v1/availability/my
     */
    async getMySlots(req, res, next) {
        try {
            const userId = req.user.id;

            // Get doctor profile
            const doctor = await doctorRepository.findByUserId(userId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            const slots = await availabilityService.getDoctorSlots(doctor.id);

            res.status(200).json({
                success: true,
                data: slots
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a specific slot
     * DELETE /api/v1/availability/slots/:id
     */
    async deleteSlot(req, res, next) {
        try {
            const userId = req.user.id;
            const slotId = parseInt(req.params.id);

            // Get doctor profile
            const doctor = await doctorRepository.findByUserId(userId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            await availabilityService.deleteSlot(slotId, doctor.id);

            res.status(200).json({
                success: true,
                message: 'Slot deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AvailabilityController();
