const { User, Group, GiftList, Gift, Notification, GroupMembership, SocialAccount } = require('../model/model');

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
}

module.exports = new UserController();