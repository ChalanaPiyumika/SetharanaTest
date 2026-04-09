const appointmentRepository = require('../../infrastructure/repositories/appointment.repository');
const { generateSlotsForDate } = require('../../shared/utils/slot-generator.util');

/**
 * Availability Service
 * Business logic for doctor appointment slot management
 */

class AvailabilityService {
    /**
     * Create slots for a specific date
     * @param {number} doctorId - Doctor ID
     * @param {object} slotData - { date, startTime, endTime, slotDuration }
     * @returns {Promise<Array>} Created slots
     */
    async createSlots(doctorId, slotData) {
        const { date, startTime, endTime, slotDuration } = slotData;

        // Validate time range
        if (startTime >= endTime) {
            const error = new Error('Start time must be before end time');
            error.statusCode = 400;
            throw error;
        }

        // Generate slots for the given date
        const slotsToCreate = generateSlotsForDate(doctorId, date, startTime, endTime, slotDuration || 30);

        // Bulk create slots
        return await appointmentRepository.bulkCreateSlots(slotsToCreate);
    }

    /**
     * Get doctor's bookable slots (active and future)
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<Array>} Slot records
     */
    async getDoctorSlots(doctorId) {
        return await appointmentRepository.findSlotsByDoctorId(doctorId);
    }

    /**
     * Delete a specific slot
     * @param {number} slotId - Slot ID
     * @param {number} doctorId - Doctor ID (for authorization)
     * @returns {Promise<boolean>} Success status
     */
    async deleteSlot(slotId, doctorId) {
        const slot = await appointmentRepository.findSlotById(slotId);

        if (!slot) {
            const error = new Error('Slot not found');
            error.statusCode = 404;
            throw error;
        }

        if (slot.doctorId !== doctorId) {
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        if (slot.isBooked) {
            const error = new Error('Cannot delete a booked slot');
            error.statusCode = 400;
            throw error;
        }

        await appointmentRepository.deleteSlot(slotId);
        return true;
    }
}

module.exports = new AvailabilityService();
