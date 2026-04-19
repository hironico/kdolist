const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class GiftList extends Model { }

GiftList.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    showTakenToOwner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'If true, the owner can see which gifts are marked as taken. Useful for collections/series tracking.'
    },
    isCollaborative: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'If true, tribes listed in GroupAccess can add/edit/delete gifts on this list.'
    }
}, { sequelize, modelName: 'giftList' });

module.exports = GiftList;
