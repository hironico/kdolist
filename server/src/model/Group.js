const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Group extends Model { }

Group.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { sequelize, modelName: 'group' });

module.exports = Group;
