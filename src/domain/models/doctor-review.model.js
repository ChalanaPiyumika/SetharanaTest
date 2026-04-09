const { DataTypes } = require('sequelize');

/**
 * Doctor Review Model
 * Stores reviews submitted for a doctor
 */
module.exports = (sequelize) => {
    const DoctorReview = sequelize.define('DoctorReview', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'ReviewId'
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
        reviewerName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'ReviewerName'
        },
        stars: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            field: 'Stars'
        },
        reviewText: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'ReviewText'
        }
    }, {
        tableName: 'DoctorReviews',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return DoctorReview;
};
