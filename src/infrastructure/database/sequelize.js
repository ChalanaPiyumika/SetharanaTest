const { Sequelize } = require('sequelize');
const env = require('../../shared/config/env');

/**
 * Sequelize Database Connection
 * Configures and exports Sequelize instance
 */

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    logging: env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: false
    },
    ...(env.DB_SSL ? {
        dialectOptions: {
            ssl: {
                rejectUnauthorized: true
            }
        }
    } : {})
});

module.exports = sequelize;
