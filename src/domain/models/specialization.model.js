const { DataTypes } = require('sequelize');

/**
 * Specialization Model
 * Stores available doctor specializations (e.g., 'Liver Related Diseases', 'Spine Problems')
 */
module.exports = (sequelize) => {
    const Specialization = sequelize.define('Specialization', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'SpecializationId'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'Name'
        }
    }, {
        tableName: 'Specializations',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return Specialization;
};
