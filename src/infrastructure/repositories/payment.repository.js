const { Payment } = require('../database');

/**
 * Payment Repository
 * Data access layer for payment transactions
 */

class PaymentRepository {
    /**
     * Create payment record
     * @param {object} paymentData - Payment data
     * @returns {Promise<object>} Created payment
     */
    async create(paymentData, transaction = null) {
        return await Payment.create(paymentData, { transaction });
    }

    /**
     * Find payment by ID
     * @param {number} paymentId - Payment ID
     * @returns {Promise<object|null>} Payment record
     */
    async findById(paymentId) {
        return await Payment.findByPk(paymentId);
    }

    /**
     * Find payment by appointment ID
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise<object|null>} Payment record
     */
    async findByAppointmentId(appointmentId, transaction = null) {
        return await Payment.findOne({
            where: { appointmentId },
            transaction
        });
    }

    /**
     * Find payment by gateway reference
     * @param {string} gatewayRef - PayHere transaction reference
     * @returns {Promise<object|null>} Payment record
     */
    async findByGatewayRef(gatewayRef) {
        return await Payment.findOne({
            where: { gatewayRef }
        });
    }

    /**
     * Update payment
     * @param {number} paymentId - Payment ID
     * @param {object} updates - Update data
     * @returns {Promise<object>} Updated payment
     */
    async update(paymentId, updates) {
        const payment = await this.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        return await payment.update(updates);
    }

    /**
     * Update payment by appointment ID
     * @param {number} appointmentId - Appointment ID
     * @param {object} updates - Update data
     * @returns {Promise<object>} Updated payment
     */
    async updateByAppointmentId(appointmentId, updates, transaction = null) {
        const payment = await this.findByAppointmentId(appointmentId, transaction);
        if (!payment) {
            throw new Error('Payment not found');
        }
        return await payment.update(updates, { transaction });
    }
}

module.exports = new PaymentRepository();
