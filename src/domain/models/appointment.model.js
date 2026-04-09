const { DataTypes } = require('sequelize');
const { AppointmentStatus } = require('../enums/appointment-status.enum');
const { PaymentStatus } = require('../enums/payment-status.enum');
const { ConsultationType } = require('../enums/consultation-type.enum');

/**
 * Appointment Model
 * Represents a booked consultation appointment
 */

module.exports = (sequelize) => {
    const Appointment = sequelize.define('Appointment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'AppointmentId'
        },
        publicId: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
            field: 'PublicId'
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Patients',
                key: 'PatientId'
            },
            field: 'PatientId'
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Doctors',
                key: 'DoctorId'
            },
            field: 'DoctorId'
        },
        slotId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'AppointmentSlots',
                key: 'SlotId'
            },
            field: 'SlotId'
        },
        consultationType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: ConsultationType.VIDEO,
            validate: {
                isIn: [[ConsultationType.VIDEO, ConsultationType.IN_PERSON, ConsultationType.EMAIL]]
            },
            field: 'ConsultationType'
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: AppointmentStatus.SCHEDULED,
            validate: {
                isIn: [[
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.COMPLETED,
                    AppointmentStatus.CANCELLED
                ]]
            },
            field: 'Status'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'Amount'
        },
        paymentStatus: {
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
            field: 'PaymentStatus'
        },
        paymentId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Gateway transaction reference',
            field: 'PaymentId'
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'PaymentDate'
        },
        cancellationReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'CancellationReason'
        }
    }, {
        tableName: 'Appointments',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        indexes: [
            {
                fields: ['PatientId', 'Status']
            },
            {
                fields: ['DoctorId', 'Status']
            },
            {
                fields: ['PublicId']
            }
        ]
    });

    // Generate readable publicId after creation: APT-YYMM-NNNNN
    Appointment.afterCreate(async (appointment, options) => {
        const now = appointment.CreatedAt || new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const publicId = `APT-${yy}${mm}-${String(appointment.id).padStart(5, '0')}`;

        await appointment.update(
            { publicId },
            { transaction: options.transaction || null }
        );
    });

    return Appointment;
};
