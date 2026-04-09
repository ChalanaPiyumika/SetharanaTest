const { DataTypes } = require('sequelize');

/**
 * Doctor Model Definition
 * Represents the Doctors table in the database
 * One-to-one relationship with User
 */

module.exports = (sequelize) => {
    const Doctor = sequelize.define('Doctor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'DoctorId'
        },
        publicId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'PublicDoctorId'
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
        registrationNumber: {
            type: DataTypes.STRING(100),
            allowNull: true, // Allow null for auto-creation during registration
            defaultValue: '', // Default to empty string to satisfy database constraint
            field: 'RegistrationNumber'
        },
        experienceYears: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0
            },
            field: 'ExperienceYears'
        },
        consultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                min: 0
            },
            field: 'ConsultationFee'
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'Bio'
        },
        category: {
            type: DataTypes.ENUM(
                'Ayurvedha Specialists',
                'Panchakarma Specialists',
                'Wellness Experts'
            ),
            allowNull: false,
            defaultValue: 'Ayurvedha Specialists',
            field: 'Category'
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'Consultant Ayurvedic Doctor',
            field: 'Title'
        },
        videoConsultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 1500,
            field: 'VideoConsultationFee'
        },
        emailConsultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 1500,
            field: 'EmailConsultationFee'
        },

        rating: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: true,
            defaultValue: 4.8,
            field: 'Rating'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'IsVerified'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'DeletedAt'
        }
    }, {
        tableName: 'Doctors',
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

    return Doctor;
};
