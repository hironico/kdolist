const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Link extends Model { }

Link.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING(4096),
        allowNull: false
    },
    description: DataTypes.TEXT
}, { sequelize, modelName: 'link', onDelete: 'CASCADE' });

module.exports = Link;
