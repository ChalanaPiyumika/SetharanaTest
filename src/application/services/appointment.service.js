const appointmentRepository = require('../../infrastructure/repositories/appointment.repository');
const paymentRepository = require('../../infrastructure/repositories/payment.repository');
const emailService = require('./email.service');
const { AppointmentStatus } = require('../../domain/enums/appointment-status.enum');
const { PaymentStatus } = require('../../domain/enums/payment-status.enum');
const { ConsultationType } = require('../../domain/enums/consultation-type.enum');
const { isSlotPast } = require('../../shared/utils/slot-generator.util');
const { sequelize } = require('../../infrastructure/database');


/**
 * Appointment Service
 * Business logic for appointment booking and management
 */

class AppointmentService {
    /**
     * Book an appointment
     * @param {number} patientId - Patient ID
     * @param {object} bookingData - Booking data
     * @returns {Promise<object>} Created appointment with payment data
     */
    async bookAppointment(patientId, bookingData) {
        const { slotId, consultationType, amount } = bookingData;

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            // 1. Validate slot exists and is available
            const slot = await appointmentRepository.findSlotById(slotId, transaction);

            if (!slot) {
                const error = new Error('Slot not found');
                error.statusCode = 404;
                throw error;
            }

            if (slot.isBooked) {
                const error = new Error('Slot is already booked');
                error.statusCode = 409;
                throw error;
            }

            // 2. Validate slot is not in the past
            if (isSlotPast(slot.slotDate, slot.startTime)) {
                const error = new Error('Cannot book a slot in the past');
                error.statusCode = 400;
                throw error;
            }

            // 3. Create appointment
            const appointment = await appointmentRepository.createAppointment({
                patientId,
                doctorId: slot.doctorId,
                slotId,
                consultationType,
                amount,
                status: AppointmentStatus.SCHEDULED,
                paymentStatus: PaymentStatus.PENDING
            }, transaction);

            // 4. Create payment record
            const payment = await paymentRepository.create({
                appointmentId: appointment.id,
                amount,
                currency: 'LKR',
                status: PaymentStatus.PENDING
            }, transaction);

            await transaction.commit();

            // Return appointment with payment info
            return {
                appointment: await appointmentRepository.findAppointmentById(appointment.id),
                payment
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get available slots for a doctor
     * @param {number} doctorId - Doctor ID
     * @param {Date} startDate - Start date (optional)
     * @param {Date} endDate - End date (optional)
     * @returns {Promise<Array>} Available slots
     */
    async getAvailableSlots(doctorId, startDate = null, endDate = null) {
        const start = startDate || new Date();
        const end = endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead

        return await appointmentRepository.findAvailableSlots(doctorId, start, end);
    }

    /**
     * Get appointments for a patient
     * @param {number} patientId - Patient ID
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} Appointments
     */
    async getPatientAppointments(patientId, filters = {}) {
        return await appointmentRepository.findByPatientId(patientId, filters);
    }

    /**
     * Get appointments for a doctor
     * @param {number} doctorId - Doctor ID
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} Appointments
     */
    async getDoctorAppointments(doctorId, filters = {}) {
        return await appointmentRepository.findByDoctorId(doctorId, filters);
    }

    /**
     * Get appointment by ID
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise<object>} Appointment
     */
    async getAppointmentById(appointmentId) {
        const appointment = await appointmentRepository.findAppointmentById(appointmentId);

        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        return appointment;
    }

    /**
     * Get appointment by public ID
     * @param {string} publicId - Public ID
     * @returns {Promise<object>} Appointment
     */
    async getAppointmentByPublicId(publicId) {
        const appointment = await appointmentRepository.findAppointmentByPublicId(publicId);

        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        return appointment;
    }

    /**
     * Cancel appointment
     * @param {number} appointmentId - Appointment ID
     * @param {number} userId - User ID (for authorization)
     * @param {string} userRole - User role
     * @param {string} cancellationReason - Reason for cancellation
     * @returns {Promise<object>} Updated appointment
     */
    async cancelAppointment(appointmentId, userId, userRole, cancellationReason) {
        const appointment = await appointmentRepository.findAppointmentById(appointmentId);

        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        // Authorization check
        const isPatient = userRole === 'PATIENT' && appointment.patient.userId === userId;
        const isDoctor = userRole === 'DOCTOR' && appointment.doctor.userId === userId;

        if (!isPatient && !isDoctor) {
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        // Check if already cancelled
        if (appointment.status === AppointmentStatus.CANCELLED) {
            const error = new Error('Appointment is already cancelled');
            error.statusCode = 400;
            throw error;
        }

        // Check if completed
        if (appointment.status === AppointmentStatus.COMPLETED) {
            const error = new Error('Cannot cancel a completed appointment');
            error.statusCode = 400;
            throw error;
        }

        // Check 1-hour cancellation window
        const appointmentDateTime = new Date(appointment.slot.slotDate);
        const [hours, minutes] = appointment.slot.startTime.split(':');
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

        if (hoursUntilAppointment < 1) {
            const error = new Error('Cannot cancel within 1 hour of appointment');
            error.statusCode = 400;
            throw error;
        }

        // If paid, attempt PayHere refund before updating DB
        let refundSuccess = false;
        let refundAmount = null;

        if (appointment.paymentStatus === PaymentStatus.PAID) {
            refundAmount = appointment.amount;

            // Get the PayHere payment_id (gateway reference) from the payment record
            const payment = await paymentRepository.findByAppointmentId(appointmentId);
            const gatewayRef = payment?.gatewayRef || appointment.paymentId;

            if (gatewayRef && !gatewayRef.startsWith('SIMULATED_')) {
                try {
                    const { requestRefund } = require('../../shared/utils/payhere.util');
                    await requestRefund(gatewayRef, `Cancelled: ${cancellationReason}`);
                    refundSuccess = true;
                    console.log(`✓ PayHere refund successful for appointment ${appointmentId}`);
                } catch (refundError) {
                    console.error(`✗ PayHere refund failed for appointment ${appointmentId}:`, refundError.message);
                    // Continue with cancellation even if refund API fails
                    // Admin can manually process the refund later
                }
            } else {
                // Simulated payment or no gateway ref — mark as refunded directly
                refundSuccess = true;
                console.log(`[Refund] Skipping PayHere API for simulated/missing payment ref: ${gatewayRef}`);
            }
        }

        const transaction = await sequelize.transaction();

        try {
            // Update appointment status
            await appointmentRepository.updateAppointment(appointmentId, {
                status: AppointmentStatus.CANCELLED,
                cancellationReason
            }, transaction);

            // Mark slot as available
            await appointmentRepository.markSlotAvailable(appointment.slotId, transaction);

            // Update payment status to refunded if paid
            if (appointment.paymentStatus === PaymentStatus.PAID) {
                await paymentRepository.updateByAppointmentId(appointmentId, {
                    status: refundSuccess ? PaymentStatus.REFUNDED : PaymentStatus.PAID
                }, transaction);
            }

            await transaction.commit();

            // Send cancellation email
            const updatedAppointment = await appointmentRepository.findAppointmentById(appointmentId);
            await emailService.sendAppointmentCancellation(updatedAppointment, refundAmount);

            return updatedAppointment;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Reschedule appointment
     * @param {number} appointmentId - Appointment ID
     * @param {number} patientId - Patient ID (for authorization)
     * @param {number} newSlotId - New slot ID
     * @returns {Promise<object>} Updated appointment
     */
    async rescheduleAppointment(appointmentId, patientId, newSlotId) {
        const appointment = await appointmentRepository.findAppointmentById(appointmentId);

        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        // Authorization check
        if (appointment.patientId !== patientId) {
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        // Can only reschedule scheduled or confirmed appointments
        if (appointment.status !== AppointmentStatus.SCHEDULED && appointment.status !== AppointmentStatus.CONFIRMED) {
            const error = new Error('Can only reschedule scheduled or confirmed appointments');
            error.statusCode = 400;
            throw error;
        }

        // Validate new slot
        const newSlot = await appointmentRepository.findSlotById(newSlotId);

        if (!newSlot) {
            const error = new Error('New slot not found');
            error.statusCode = 404;
            throw error;
        }

        if (newSlot.isBooked) {
            const error = new Error('New slot is already booked');
            error.statusCode = 409;
            throw error;
        }

        if (isSlotPast(newSlot.slotDate, newSlot.startTime)) {
            const error = new Error('Cannot reschedule to a slot in the past');
            error.statusCode = 400;
            throw error;
        }

        const transaction = await sequelize.transaction();

        try {
            const oldSlot = appointment.slot;

            // Mark old slot as available
            await appointmentRepository.markSlotAvailable(appointment.slotId, transaction);

            // Update appointment with new slot
            await appointmentRepository.updateAppointment(appointmentId, {
                slotId: newSlotId,
                doctorId: newSlot.doctorId
            }, transaction);

            // Mark new slot as booked
            await appointmentRepository.markSlotBooked(newSlotId, transaction);

            await transaction.commit();

            // Send reschedule email
            const updatedAppointment = await appointmentRepository.findAppointmentById(appointmentId);
            await emailService.sendAppointmentReschedule(updatedAppointment, oldSlot, newSlot);

            return updatedAppointment;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new AppointmentService();
