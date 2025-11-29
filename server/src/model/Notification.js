const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Notification extends Model { }

Notification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('GROUP_JOIN_REQUEST', 'GROUP_JOIN_ACCEPTED', 'GROUP_JOIN_REJECTED', 'GROUP_LEAVE', 'GIFT_LIST_UPDATED', 'GIFT_ADDED', 'GIFT_REMOVED', 'GIFT_SELECTED', 'ADMIN_CHANGED'),
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: DataTypes.DATE
}, { sequelize, modelName: 'notification' });

module.exports = Notification;
