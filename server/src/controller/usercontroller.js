const { User, Group, GiftList, Gift, Notification, GroupMembership, SocialAccount } = require('../model');

class UserController {
  async createUser(username, firstname, lastname, email) {
    return await User.create({ username, firstname, lastname, email });
  }

  async createGiftList(userId, name) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return await GiftList.create({ name, ownerId: userId });
  }

  async viewAccessibleLists(userId) {
    const user = await User.findByPk(userId, {
      include: [
        { model: GiftList },
        { model: GroupMembership, include: [{ model: Group, include: [{ model: GroupAccess, include: [GiftList] }] }] }
      ]
    });
    if (!user) throw new Error('User not found');

    const ownLists = user.GiftLists;
    const accessibleLists = user.GroupMemberships.flatMap(membership =>
      membership.Group.GroupAccesses.map(access => access.GiftList)
    );

    return [...ownLists, ...accessibleLists];
  }

  async createGroup(userId, name) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return await Group.create({ name, adminId: userId });
  }

  async requestJoinGroup(userId, groupId) {
    const [user, group] = await Promise.all([
      User.findByPk(userId),
      Group.findByPk(groupId)
    ]);
    if (!user || !group) throw new Error('User or Group not found');

    return await GroupMembership.create({
      userId,
      groupId,
      status: 'REQUESTED',
      requestedAt: new Date()
    });
  }

  async respondToGroupInvite(membershipId, accepted) {
    const membership = await GroupMembership.findByPk(membershipId);
    if (!membership) throw new Error('GroupMembership not found');

    membership.status = accepted ? 'MEMBER' : 'REJECTED';
    membership.lastStatusChange = new Date();
    return await membership.save();
  }

  async viewNotifications(userId) {
    return await Notification.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async markNotificationAsRead(notificationId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) throw new Error('Notification not found');

    notification.isRead = true;
    return await notification.save();
  }

  async addSocialAccount(userId, provider, socialId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    return await SocialAccount.create({
      userId,
      provider,
      socialId,
    });
  }

  async removeSocialAccount(socialAccountId) {
    const socialAccount = await SocialAccount.findByPk(socialAccountId);
    if (!socialAccount) throw new Error('Social Account not found');

    await socialAccount.destroy();
    return { message: 'Social Account removed successfully' };
  }

  async selectGiftToOffer(userId, giftId, isHidden) {
    const [user, gift] = await Promise.all([
      User.findByPk(userId),
      Gift.findByPk(giftId)
    ]);
    if (!user || !gift) throw new Error('User or Gift not found');
    if (gift.selectedById) throw new Error('Gift already selected');

    gift.selectedById = userId;
    gift.isHidden = isHidden;
    gift.selectedAt = new Date();
    return await gift.save();
  }
  /**
   * Helper function to remove accents from a string
   */
  _removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Search users by username, firstname, lastname, or email
   * Case-insensitive and accent-insensitive search
   */
  async searchUsers(query) {
    const { Op, Sequelize } = require('sequelize');
    
    // Get all users first (with a reasonable limit to avoid performance issues)
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'firstname', 'lastname', 'email'],
      limit: 1000 // Add a reasonable limit
    });
    
    // Normalize the search query
    const normalizedQuery = this._removeAccents(query.toLowerCase());
    
    // Filter users in JavaScript for accent-insensitive search
    const matchedUsers = allUsers.filter(user => {
      const normalizedUsername = this._removeAccents((user.username || '').toLowerCase());
      const normalizedFirstname = this._removeAccents((user.firstname || '').toLowerCase());
      const normalizedLastname = this._removeAccents((user.lastname || '').toLowerCase());
      const normalizedEmail = (user.email || '').toLowerCase(); // Email usually doesn't have accents
      
      return normalizedUsername.includes(normalizedQuery) ||
             normalizedFirstname.includes(normalizedQuery) ||
             normalizedLastname.includes(normalizedQuery) ||
             normalizedEmail.includes(normalizedQuery);
    });
    
    return matchedUsers;
  }
}

module.exports = new UserController();
