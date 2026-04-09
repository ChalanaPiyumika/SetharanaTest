const { AppointmentSlot, Appointment, Doctor, Patient, User, Consultation } = require('../database');
const { Op } = require('sequelize');

/**
 * Appointment Repository
 * Data access layer for appointments and slots
 */

class AppointmentRepository {
    /**
     * Create appointment slot
     * @param {object} slotData - Slot data
     * @returns {Promise<object>} Created slot
     */
    async createSlot(slotData, transaction = null) {
        return await AppointmentSlot.create(slotData, { transaction });
    }

    /**
     * Bulk create slots
     * @param {Array} slotsData - Array of slot data
     * @returns {Promise<Array>} Created slots
     */
    async bulkCreateSlots(slotsData, transaction = null) {
        return await AppointmentSlot.bulkCreate(slotsData, {
            ignoreDuplicates: true,
            transaction
        });
    }

    /**
     * Find slot by ID
     * @param {number} slotId - Slot ID
     * @returns {Promise<object|null>} Slot record
     */
    async findSlotById(slotId, transaction = null) {
        return await AppointmentSlot.findByPk(slotId, {
            include: [{
                model: Doctor,
                as: 'doctor',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'email']
                }]
            }],
            transaction
        });
    }

    /**
     * Find available slots for a doctor
     * @param {number} doctorId - Doctor ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} Available slots
     */
    async findAvailableSlots(doctorId, startDate, endDate) {
        return await AppointmentSlot.findAll({
            where: {
                doctorId,
                slotDate: {
                    [Op.between]: [startDate, endDate]
                },
                isBooked: false
            },
            include: [{
                model: Doctor,
                as: 'doctor',
                attributes: ['id', 'consultationFee']
            }],
            order: [['slotDate', 'ASC'], ['startTime', 'ASC']],
            raw: false
        });
    }

    /**
     * Mark slot as booked
     * @param {number} slotId - Slot ID
     * @returns {Promise<object>} Updated slot
     */
    async markSlotBooked(slotId, transaction = null) {
        const slot = await AppointmentSlot.findByPk(slotId, { transaction });
        if (!slot) {
            throw new Error('Slot not found');
        }
        return await slot.update({ isBooked: true }, { transaction });
    }

    /**
     * Mark slot as available
     * @param {number} slotId - Slot ID
     * @returns {Promise<object>} Updated slot
     */
    async markSlotAvailable(slotId, transaction = null) {
        const slot = await AppointmentSlot.findByPk(slotId, { transaction });
        if (!slot) {
            throw new Error('Slot not found');
        }
        return await slot.update({ isBooked: false }, { transaction });
    }

    /**
     * Create appointment
     * @param {object} appointmentData - Appointment data
     * @returns {Promise<object>} Created appointment
     */
    async createAppointment(appointmentData, transaction = null) {
        return await Appointment.create(appointmentData, { transaction });
    }

    /**
     * Find appointment by ID
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise<object|null>} Appointment record
     */
    async findAppointmentById(appointmentId, transaction = null) {
        return await Appointment.findByPk(appointmentId, {
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'email', 'phone']
                    }]
                },
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'email']
                    }]
                },
                {
                    model: AppointmentSlot,
                    as: 'slot'
                }
            ],
            transaction
        });
    }

    /**
     * Find appointment by public ID
     * @param {string} publicId - Public ID
     * @returns {Promise<object|null>} Appointment record
     */
    async findAppointmentByPublicId(publicId) {
        return await Appointment.findOne({
            where: { publicId },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'email', 'phone']
                    }]
                },
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'email']
                    }]
                },
                {
                    model: AppointmentSlot,
                    as: 'slot'
                }

            ]
        });
    }

    /**
     * Find appointments by patient ID
     * @param {number} patientId - Patient ID
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} Appointments
     */
    async findByPatientId(patientId, filters = {}) {
        const where = { patientId };
        if (filters.status) {
            where.status = filters.status;
        }

        return await Appointment.findAll({
            where,
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName']
                    }]
                },
                {
                    model: AppointmentSlot,
                    as: 'slot'
                },
                {
                    model: Consultation,
                    as: 'consultation',
                    attributes: ['meetingToken', 'status']
                }
            ],
            order: [['CreatedAt', 'DESC']]
        });
    }

    /**
     * Find appointments by doctor ID
     * @param {number} doctorId - Doctor ID
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} Appointments
     */
    async findByDoctorId(doctorId, filters = {}) {
        const where = { doctorId };
        if (filters.status) {
            where.status = filters.status;
        }

        return await Appointment.findAll({
            where,
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'lastName', 'phone']
                    }]
                },
                {
                    model: AppointmentSlot,
                    as: 'slot'
                },
                {
                    model: Consultation,
                    as: 'consultation',
                    attributes: ['meetingToken', 'status']
                }
            ],
            order: [['CreatedAt', 'DESC']]
        });
    }

    /**
     * Update appointment
     * @param {number} appointmentId - Appointment ID
     * @param {object} updates - Update data
     * @returns {Promise<object>} Updated appointment
     */
    async updateAppointment(appointmentId, updates, transaction = null) {
        const appointment = await Appointment.findByPk(appointmentId, { transaction });
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return await appointment.update(updates, { transaction });
    }

    /**
     * Delete old unbooked slots
     * @param {Date} beforeDate - Delete slots before this date
     * @returns {Promise<number>} Number of deleted slots
     */
    async deleteOldSlots(beforeDate) {
        return await AppointmentSlot.destroy({
            where: {
                slotDate: {
                    [Op.lt]: beforeDate
                },
                isBooked: false
            }
        });
    }

    /**
     * Delete unbooked future slots for a doctor (for regeneration)
     * @param {number} doctorId - Doctor ID
     * @returns {Promise<number>} Number of deleted slots
     */
    async deleteUnbookedFutureSlots(doctorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await AppointmentSlot.destroy({
            where: {
                doctorId,
                slotDate: {
                    [Op.gte]: today
                },
                isBooked: false
            }
        });
    }

    /**
     * Find all slots for a doctor (used by availability service)
     * @param {number} doctorId 
     * @returns {Promise<Array>}
     */
    async findSlotsByDoctorId(doctorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await AppointmentSlot.findAll({
            where: {
                doctorId,
                slotDate: {
                    [Op.gte]: today
                }
            },
            order: [['slotDate', 'ASC'], ['startTime', 'ASC']]
        });
    }

    /**
     * Delete a single slot
     * @param {number} slotId 
     */
    async deleteSlot(slotId) {
        return await AppointmentSlot.destroy({
            where: { id: slotId }
        });
    }
}

module.exports = new AppointmentRepository();
