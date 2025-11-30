const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Notification extends Model { }

Notification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the user who triggered this notification (e.g., who sent the invite)'
    },
    objectId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the object being notified about (e.g., group/tribe ID, gift list ID)'
    },
    type: {
        type: DataTypes.ENUM('GROUP_INVITE', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_ACCEPTED', 'GROUP_JOIN_REJECTED', 'GROUP_LEAVE', 'GIFT_LIST_UPDATED', 'GIFT_ADDED', 'GIFT_REMOVED', 'GIFT_TAKEN', 'GIFT_UNTAKEN', 'ADMIN_CHANGED'),
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: DataTypes.DATE
}, { sequelize, modelName: 'notification' });

module.exports = Notification;
