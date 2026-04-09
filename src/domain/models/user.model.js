const { DataTypes } = require('sequelize');
const { UserRole } = require('../enums/user-role.enum');

/**
 * User Model Definition
 * Represents the Users table in the database
 */

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'UserId'
        },
        publicId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'PublicId'
        },
        googleId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            field: 'GoogleId'
        },
        appleId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            field: 'AppleId'
        },
        authProvider: {
            type: DataTypes.ENUM('LOCAL', 'GOOGLE', 'APPLE'),
            defaultValue: 'LOCAL',
            allowNull: false,
            field: 'AuthProvider'
        },
        email: {
            type: DataTypes.STRING(256),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            field: 'Email'
        },
        passwordHash: {
            type: DataTypes.STRING(512),
            allowNull: true, // Nullable for social logins
            field: 'PasswordHash'
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'FirstName'
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'LastName'
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'Phone'
        },
        role: {
            type: DataTypes.STRING(20),
            defaultValue: UserRole.PATIENT,
            allowNull: false,
            validate: {
                isIn: [[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]]
            },
            field: 'Role'
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'Country'
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'City'
        },
        timezone: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'Timezone'
        },
        profileImageUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'ProfileImageUrl'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'IsActive'
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'IsEmailVerified'
        },
        resetPasswordOtp: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'ResetPasswordOtp'
        },
        resetPasswordOtpExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'ResetPasswordOtpExpiry'
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return User;
};
