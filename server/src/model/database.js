const { Sequelize } = require('sequelize');
const dotenv = require('dotenv').config();
const logger = require('../logger');

logger.info(`Connecting to database : ${process.env.DB_NAME} on ${process.env.DB_HOSTNAME}:${process.env.DB_PORT} with user ${process.env.DB_USER}`);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: (msg) => logger.debug(msg)
});

module.exports = sequelize;
