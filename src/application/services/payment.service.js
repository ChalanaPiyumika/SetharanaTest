const paymentRepository = require('../../infrastructure/repositories/payment.repository');
const appointmentRepository = require('../../infrastructure/repositories/appointment.repository');
const emailService = require('./email.service');
const { generatePaymentData, verifyHash } = require('../../shared/utils/payhere.util');
const { PaymentStatus } = require('../../domain/enums/payment-status.enum');
const { AppointmentStatus } = require('../../domain/enums/appointment-status.enum');
const { ConsultationType } = require('../../domain/enums/consultation-type.enum');
const { sequelize } = require('../../infrastructure/database');

/**
 * Payment Service
 * Business logic for payment processing
 */

class PaymentService {
    /**
     * Initiate payment for an appointment
     * @param {string} appointmentPublicId - Appointment public ID
     * @returns {Promise<object>} PayHere form data
     */
    async initiatePayment(appointmentPublicId) {
        const appointment = await appointmentRepository.findAppointmentByPublicId(appointmentPublicId);

        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if payment is already completed
        if (appointment.paymentStatus === PaymentStatus.PAID) {
            const error = new Error('Payment already completed');
            error.statusCode = 400;
            throw error;
        }

        // Generate PayHere payment data
        const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
        const patientEmail = appointment.patient.user.email;
        const patientPhone = appointment.patient.user.phone || '';

        const paymentData = generatePaymentData({
            publicId: appointment.publicId,
            amount: appointment.amount,
            patientName,
            patientEmail,
            patientPhone
        });

        return paymentData;
    }

    /**
     * Process PayHere webhook notification
     * @param {object} webhookData - Data from PayHere webhook
     * @returns {Promise<object>} Processing result
     */
    async processWebhook(webhookData) {
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            method,
            status_message,
            card_holder_name,
            card_no
        } = webhookData;

        console.log(`[PayHere Webhook] Received for order: ${order_id}, status: ${status_code}`);

        // Verify hash
        const isValidHash = verifyHash(md5sig, order_id, payhere_amount, status_code);

        if (!isValidHash) {
            console.error('[PayHere Webhook] Invalid hash signature');
            const error = new Error('Invalid payment signature');
            error.statusCode = 400;
            throw error;
        }

        // Find appointment
        const appointment = await appointmentRepository.findAppointmentByPublicId(order_id);

        if (!appointment) {
            console.error(`[PayHere Webhook] Appointment not found: ${order_id}`);
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if already processed (idempotency)
        const existingPayment = await paymentRepository.findByGatewayRef(payment_id);
        if (existingPayment) {
            console.log(`[PayHere Webhook] Payment already processed: ${payment_id}`);
            return { message: 'Payment already processed', appointment };
        }

        const transaction = await sequelize.transaction();

        try {
            // Status code 2 = Success
            if (status_code === '2') {
                // Update payment record
                await paymentRepository.updateByAppointmentId(appointment.id, {
                    gatewayRef: payment_id,
                    status: PaymentStatus.PAID
                }, transaction);

                // Update appointment status
                await appointmentRepository.updateAppointment(appointment.id, {
                    status: AppointmentStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.PAID,
                    paymentId: payment_id,
                    paymentDate: new Date()
                }, transaction);

                // Mark slot as booked
                await appointmentRepository.markSlotBooked(appointment.slotId, transaction);

                await transaction.commit();

                console.log(`[PayHere Webhook] Payment successful for appointment: ${order_id}`);

                // Send confirmation email
                const updatedAppointment = await appointmentRepository.findAppointmentById(appointment.id);
                await emailService.sendAppointmentConfirmation(updatedAppointment);
                
                // Auto-create consultation for VIDEO or EMAIL type (Directly after payment)
                if (Number(updatedAppointment.consultationType) === ConsultationType.VIDEO || 
                    Number(updatedAppointment.consultationType) === ConsultationType.EMAIL) {
                    try {
                        const consultationService = require('./consultation.service');
                        await consultationService.createConsultation(appointment.id);
                        console.log(`✓ Video consultation created for appointment: ${order_id}`);
                    } catch (consultationError) {
                        console.error(`✗ Failed to auto-create consultation: ${consultationError.message}`);
                        // Don't fail the whole payment flow if consultation creation fails
                    }
                }

                return {
                    message: 'Payment processed successfully',
                    appointment: updatedAppointment
                };

            } else {
                // Payment failed
                await paymentRepository.updateByAppointmentId(appointment.id, {
                    gatewayRef: payment_id,
                    status: PaymentStatus.FAILED
                }, transaction);

                await appointmentRepository.updateAppointment(appointment.id, {
                    paymentStatus: PaymentStatus.FAILED
                }, transaction);

                await transaction.commit();

                console.log(`[PayHere Webhook] Payment failed for appointment: ${order_id}, reason: ${status_message}`);

                return {
                    message: 'Payment failed',
                    appointment
                };
            }

        } catch (error) {
            await transaction.rollback();
            console.error('[PayHere Webhook] Error processing payment:', error.message);
            throw error;
        }
    }

    /**
     * Get payment details for an appointment
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise<object>} Payment details
     */
    async getPaymentByAppointmentId(appointmentId) {
        const payment = await paymentRepository.findByAppointmentId(appointmentId);

        if (!payment) {
            const error = new Error('Payment not found');
            error.statusCode = 404;
            throw error;
        }

        return payment;
    }

    /**
     * Simulate a successful payment (DEVELOPMENT ONLY)
     * @param {string} publicId - Appointment public ID
     */
    async simulateSuccess(publicId) {
        // Double check it's not production (redundant but safe)
        if (process.env.NODE_ENV === 'production') {
            const error = new Error('Simulation not allowed in production');
            error.statusCode = 403;
            throw error;
        }

        console.log(`[DEV] Simulating success for: ${publicId}`);
        
        // Mock data that looks like PayHere success
        const mockWebhookData = {
            order_id: publicId,
            status_code: '2', // Success
            payment_id: `SIMULATED_${Date.now()}`,
            payhere_amount: '0', // Amount doesn't strictly matter for simulation
            payhere_currency: 'LKR',
            md5sig: 'SIMULATED' // This will fail verifyHash unless we bypass it
        };

        // We'll bypass hash verification if it's a simulation
        const appointment = await appointmentRepository.findAppointmentByPublicId(publicId);
        if (!appointment) {
            const error = new Error('Appointment not found');
            error.statusCode = 404;
            throw error;
        }

        const transaction = await sequelize.transaction();
        try {
            await paymentRepository.updateByAppointmentId(appointment.id, {
                gatewayRef: mockWebhookData.payment_id,
                status: PaymentStatus.PAID
            }, transaction);

            await appointmentRepository.updateAppointment(appointment.id, {
                status: AppointmentStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID
            }, transaction);

            await appointmentRepository.markSlotBooked(appointment.slotId, transaction);
            await transaction.commit();

            console.log(`[DEV] Simulation successful for: ${publicId}`);
            
            // Optionally send email
            const updatedAppointment = await appointmentRepository.findAppointmentById(appointment.id);
            await emailService.sendAppointmentConfirmation(updatedAppointment);

            // Auto-create consultation for VIDEO or EMAIL type (Simulation)
            if (Number(updatedAppointment.consultationType) === ConsultationType.VIDEO || 
                Number(updatedAppointment.consultationType) === ConsultationType.EMAIL) {
                const consultationService = require('./consultation.service');
                await consultationService.createConsultation(appointment.id);
                console.log(`[DEV] Video consultation created for simulation: ${publicId}`);
            }

            return { message: 'Simulation successful', appointment: updatedAppointment };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new PaymentService();
