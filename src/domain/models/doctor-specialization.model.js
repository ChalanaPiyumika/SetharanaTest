const { DataTypes } = require('sequelize');

/**
 * DoctorSpecialization Junction Model
 * Handles the Many-to-Many relationship between Doctors and Specializations
 */
module.exports = (sequelize) => {
    const DoctorSpecialization = sequelize.define('DoctorSpecialization', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'Id'
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
        specializationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Specializations',
                key: 'SpecializationId'
            },
            field: 'SpecializationId'
        }
    }, {
        tableName: 'DoctorSpecializations',
        timestamps: false,
        underscored: false
    });

    return DoctorSpecialization;
};
