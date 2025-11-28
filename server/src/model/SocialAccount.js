const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class SocialAccount extends Model { }

SocialAccount.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider: {
        type: DataTypes.ENUM('GOOGLE', 'FACEBOOK', 'MICROSOFT', 'APPLE', 'LOGIN', 'KEYCLOAK'),
        allowNull: false
    },
    socialId: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, { sequelize, modelName: 'socialAccount' });

module.exports = SocialAccount;
