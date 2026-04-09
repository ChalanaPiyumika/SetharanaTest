const { DataTypes } = require('sequelize');
const { PaymentStatus } = require('../enums/payment-status.enum');

/**
 * Payment Model
 * Represents a payment transaction for an appointment
 */

module.exports = (sequelize) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'PaymentId'
        },
        appointmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Appointments',
                key: 'AppointmentId'
            },
            field: 'AppointmentId'
        },
        gatewayRef: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'PayHere transaction reference',
            field: 'GatewayRef'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'Amount'
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'LKR',
            allowNull: false,
            field: 'Currency'
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: PaymentStatus.PENDING,
            validate: {
                isIn: [[
                    PaymentStatus.PENDING,
                    PaymentStatus.PAID,
                    PaymentStatus.FAILED,
                    PaymentStatus.REFUNDED
                ]]
            },
            field: 'Status'
        }
    }, {
        tableName: 'Payments',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        indexes: [
            {
                fields: ['AppointmentId']
            },
            {
                fields: ['GatewayRef']
            }
        ]
    });

    return Payment;
};
