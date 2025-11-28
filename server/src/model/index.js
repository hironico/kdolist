const sequelize = require('./database');
const logger = require('../logger');

// Import all models with their associations
const {
    User,
    SocialAccount,
    Group,
    GroupMembership,
    GiftList,
    Gift,
    Link,
    Image,
    GroupAccess,
    Notification
} = require('./associations');

// Sync the models with the database
sequelize.sync({ force: false }).then(() => {
    logger.debug('Database & tables created!');
});

// Export all models and sequelize instance
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
