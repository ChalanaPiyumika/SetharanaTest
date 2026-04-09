const { DataTypes } = require('sequelize');

/**
 * ConsultationDocument Model
 * Stores file/document attachments uploaded during a consultation
 */

module.exports = (sequelize) => {
    const ConsultationDocument = sequelize.define('ConsultationDocument', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'DocumentId'
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

        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'FileName'
        },

        filePath: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'FilePath'
        },

        mimeType: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'MimeType'
        },

        uploadedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'UserId of the uploader',
            field: 'UploadedBy'
        }

    }, {
        tableName: 'ConsultationDocuments',
        timestamps: true,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt'
    });

    return ConsultationDocument;
};
