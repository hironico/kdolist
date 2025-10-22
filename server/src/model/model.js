const { Sequelize, DataTypes, Model } = require('sequelize');
const dotenv = require('dotenv').config();
const logger = require('../logger');

logger.info(`Connecting to database : ${process.env.DB_NAME} on ${process.env.DB_HOSTNAME}:${process.env.DB_PORT} with user ${process.env.DB_USER}`);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOSTNAME,
  port:process.env.DB_PORT,
  dialect: process.env.DB_DIALECT, 
  logging: (msg) => logger.debug(msg)
});

class User extends Model {}
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { sequelize, modelName: 'user' });

class SocialAccount extends Model {}
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

class Group extends Model {}
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

class GroupMembership extends Model {}
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

class GiftList extends Model {}
GiftList.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { sequelize, modelName: 'giftList' });

class Gift extends Model {}
Gift.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isHidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  selectedAt: DataTypes.DATE,
}, { sequelize, modelName: 'gift', onDelete: 'CASCADE' });

class Link extends Model {}
Link.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING(1024),
    allowNull: false
  },
  description: DataTypes.TEXT
}, { sequelize, modelName: 'link', onDelete: 'CASCADE'});

class Image extends Model {}
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
}, { sequelize, modelName: 'image', onDelete: 'CASCADE'});

class GroupAccess extends Model {}
GroupAccess.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  }
}, { sequelize, modelName: 'groupAccess' });

class Notification extends Model {}
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
    type: DataTypes.ENUM('GROUP_INVITE', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_ACCEPTED', 'GROUP_JOIN_REJECTED', 'GROUP_LEAVE', 'GIFT_LIST_SHARED', 'GIFT_LIST_UPDATED', 'GIFT_ADDED', 'GIFT_REMOVED', 'GIFT_SELECTED', 'ADMIN_CHANGED'),
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: DataTypes.DATE
}, { sequelize, modelName: 'notification' });

// Associations
User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);

GiftList.belongsTo(User, { as: 'owner' });

User.hasMany(GroupMembership);
GroupMembership.belongsTo(User);

User.hasMany(Group, { as: 'adminGroups', foreignKey: 'adminId' });
Group.belongsTo(User, { as: 'admin' });

User.hasMany(Notification, { as: 'receivedNotifications', foreignKey: 'recipientId' });
Notification.belongsTo(User, { as: 'recipient' });

User.hasMany(Gift, { as: 'selectedGifts', foreignKey: 'selectedById' });
Gift.belongsTo(User, { as: 'selectedBy' });

Group.hasMany(GroupMembership);
GroupMembership.belongsTo(Group);

Group.hasMany(GroupAccess);
GroupAccess.belongsTo(Group);

GiftList.hasMany(Gift, {onDelete: 'CASCADE'});
Gift.belongsTo(GiftList, {onDelete: 'CASCADE'});

GiftList.hasMany(GroupAccess);
GroupAccess.belongsTo(GiftList);

Gift.hasMany(Link);
Link.belongsTo(Gift, {as: 'gift', onDelete: 'CASCADE'});

Gift.hasMany(Image);
Image.belongsTo(Gift, {onDelete: 'CASCADE'});

// Sync the models with the database
sequelize.sync({ force: false }).then(() => {
  logger.debug('Database & tables created!');
});

module.exports = {
  User,
  SocialAccount,
  Group,
  GroupMembership,
  GiftList,
  Gift,
  Link,
  Image,
  GroupAccess,
  Notification,
  sequelize
};