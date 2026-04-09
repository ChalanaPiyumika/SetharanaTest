/**
 * Payment Status Enum
 * Represents the states of a payment transaction
 */

const PaymentStatus = {
    PENDING: 1,     // Payment initiated
    PAID: 2,        // Payment successful
    FAILED: 3,      // Payment failed
    REFUNDED: 4     // Payment refunded
};

const PaymentStatusLabels = {
    1: 'Pending',
    2: 'Paid',
    3: 'Failed',
    4: 'Refunded'
};

const validStatuses = Object.values(PaymentStatus);

module.exports = {
    PaymentStatus,
    PaymentStatusLabels,
    validStatuses
};
