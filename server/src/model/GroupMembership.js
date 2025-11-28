const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class GroupMembership extends Model { }

GroupMembership.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('INVITED', 'REQUESTED', 'MEMBER', 'REJECTED'),
        allowNull: false
    },
    requestedAt: DataTypes.DATE,
    lastStatusChange: DataTypes.DATE
}, { sequelize, modelName: 'groupMembership' });

module.exports = GroupMembership;
