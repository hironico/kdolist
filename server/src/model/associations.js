// Import all models
const User = require('./User');
const SocialAccount = require('./SocialAccount');
const Group = require('./Group');
const GroupMembership = require('./GroupMembership');
const GiftList = require('./GiftList');
const Gift = require('./Gift');
const Link = require('./Link');
const Image = require('./Image');
const GroupAccess = require('./GroupAccess');
const Notification = require('./Notification');

/**
 * Define all model associations/relationships
 * This file centralizes all the relationships between models
 */

// User <-> SocialAccount
User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);

// User <-> GiftList
GiftList.belongsTo(User, { as: 'owner' });

// User <-> GroupMembership
User.hasMany(GroupMembership);
GroupMembership.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// User <-> Group (admin relationship)
User.hasMany(Group, { as: 'adminGroups', foreignKey: 'adminId' });
Group.belongsTo(User, { as: 'admin' });

// User <-> Notification
User.hasMany(Notification, { as: 'receivedNotifications', foreignKey: 'recipientId' });
Notification.belongsTo(User, { as: 'recipient' });

User.hasMany(Notification, { as: 'sentNotifications', foreignKey: 'senderId' });
Notification.belongsTo(User, { as: 'sender' });

// User <-> Gift (selected by relationship)
User.hasMany(Gift, { as: 'selectedGifts', foreignKey: 'selectedById' });
Gift.belongsTo(User, { as: 'selectedBy' });

// Group <-> GroupMembership
Group.hasMany(GroupMembership);
GroupMembership.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });

// Group <-> GroupAccess
Group.hasMany(GroupAccess);
GroupAccess.belongsTo(Group);

// GiftList <-> Gift
GiftList.hasMany(Gift, { onDelete: 'CASCADE' });
Gift.belongsTo(GiftList, { onDelete: 'CASCADE' });

// GiftList <-> GroupAccess
GiftList.hasMany(GroupAccess);
GroupAccess.belongsTo(GiftList);

// Gift <-> Link
Gift.hasMany(Link);
Link.belongsTo(Gift, { as: 'gift', onDelete: 'CASCADE' });

// Gift <-> Image
Gift.hasMany(Image);
Image.belongsTo(Gift, { onDelete: 'CASCADE' });

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
    Notification
};
