const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Image extends Model { }

Image.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Base64 representation of the data URL to use when displaying the image in the application.'
    },
    altText: DataTypes.STRING
}, { sequelize, modelName: 'image', onDelete: 'CASCADE' });

module.exports = Image;
