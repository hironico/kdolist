const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Gift extends Model { }

Gift.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(2048),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(4096),
        allowNull: true
    },
    isHidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'If true, this gift is marked as a favorite by the list owner'
    },
    selectedAt: DataTypes.DATE,
}, { sequelize, modelName: 'gift', onDelete: 'CASCADE' });

module.exports = Gift;
