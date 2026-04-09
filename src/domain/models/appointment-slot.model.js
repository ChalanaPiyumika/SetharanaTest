const { DataTypes } = require('sequelize');

/**
 * Appointment Slot Model
 * Generated time slots available for booking
 */

module.exports = (sequelize) => {
    const AppointmentSlot = sequelize.define('AppointmentSlot', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'SlotId'
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
        slotDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: 'Date of the slot',
            field: 'SlotDate'
        },
        startTime: {
            type: DataTypes.STRING(5),
            allowNull: false,
            comment: 'Format: HH:MM (24-hour)',
            field: 'StartTime'
        },
        endTime: {
            type: DataTypes.STRING(5),
            allowNull: false,
            comment: 'Format: HH:MM (24-hour)',
            field: 'EndTime'
        },
        isBooked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'IsBooked'
        }
    }, {
        tableName: 'AppointmentSlots',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        indexes: [
            {
                fields: ['DoctorId', 'SlotDate', 'IsBooked']
            }
        ]
    });

    return AppointmentSlot;
};
