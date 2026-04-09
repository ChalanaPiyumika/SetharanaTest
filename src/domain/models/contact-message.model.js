const { DataTypes } = require('sequelize');

/**
 * Contact Message Model
 * Represents a contact form submission
 */

module.exports = (sequelize) => {
    const ContactMessage = sequelize.define('ContactMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'MessageId'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'Name'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                isEmail: true
            },
            field: 'Email'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'Message'
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'IsResolved'
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'ResolvedAt'
        }
    }, {
        tableName: 'ContactMessages',
        timestamps: true,
        underscored: false,
        createdAt: 'CreatedAt',
        updatedAt: 'UpdatedAt',
        indexes: [
            {
                fields: ['IsResolved']
            },
            {
                fields: ['CreatedAt']
            }
        ]
    });

    return ContactMessage;
};
