const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { ConsultationStatus } = require('../enums/consultation-status.enum');

/**
 * Consultation Model
 * Represents a video consultation session linked to an appointment
 */

module.exports = (sequelize) => {
    const Consultation = sequelize.define('Consultation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'ConsultationId'
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

        roomName: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            field: 'RoomName'
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: ConsultationStatus.SCHEDULED,
            validate: {
                isIn: [[
                    ConsultationStatus.SCHEDULED,
                    ConsultationStatus.ACTIVE,
                    ConsultationStatus.ENDED
                ]]
            },
            field: 'Status'
        },

        startedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'StartedAt'
        },

        endedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'EndedAt'
        },

        recordingUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'RecordingUrl'
        },

        meetingToken: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
            defaultValue: () => uuidv4(),
            field: 'MeetingToken'
        },

        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'Notes'
        }

    }, {
        tableName: 'Consultations',
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return Consultation;
};
