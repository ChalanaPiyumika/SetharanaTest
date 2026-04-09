const { DataTypes } = require('sequelize');

/**
 * ConsultationMessage Model
 * Represents a threaded chat message within a consultation
 */

module.exports = (sequelize) => {
    const ConsultationMessage = sequelize.define('ConsultationMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'MessageId'
        },

        consultationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Consultations',
                key: 'ConsultationId'
            },
            field: 'ConsultationId'
        },

        senderRole: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [['PATIENT', 'DOCTOR']]
            },
            field: 'SenderRole'
        },

        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'UserId of the sender',
            field: 'SenderId'
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'Message'
        }

    }, {
        tableName: 'ConsultationMessages',
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return ConsultationMessage;
};
