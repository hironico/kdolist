const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class GroupAccess extends Model { }

GroupAccess.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
}, { sequelize, modelName: 'groupAccess' });

module.exports = GroupAccess;
