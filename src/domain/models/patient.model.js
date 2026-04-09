const { DataTypes } = require('sequelize');
const { Gender } = require('../enums/gender.enum');

/**
 * Patient Model Definition
 * Represents the Patients table in the database
 * One-to-one relationship with User
 */

module.exports = (sequelize) => {
    const Patient = sequelize.define('Patient', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'PatientId'
        },
        publicId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'PublicPatientId'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'UserId'
            },
            field: 'UserId'
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'DateOfBirth'
        },
        gender: {
            type: DataTypes.TINYINT,
            allowNull: true,
            validate: {
                isIn: [[Gender.MALE, Gender.FEMALE, Gender.OTHER]]
            },
            field: 'Gender'
        },
        bloodGroup: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'BloodGroup'
        },
        address: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'Address'
        },
        emergencyContactName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'EmergencyContactName'
        },
        emergencyContactPhone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'EmergencyContactPhone'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'DeletedAt'
        }
    }, {
        tableName: 'Patients',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        paranoid: false, // We handle soft deletes manually
        defaultScope: {
            where: {
                deletedAt: null
            }
        },
        scopes: {
            withDeleted: {
                where: {}
            }
        }
    });

    return Patient;
};
