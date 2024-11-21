const { Group, User, GroupMembership, Notification } = require('../model/model');

class GroupController {
  async inviteUser(groupId, userId, invitedByUserId) {
    const [group, user, invitedBy] = await Promise.all([
      Group.findByPk(groupId),
      User.findByPk(userId),
      User.findByPk(invitedByUserId)
    ]);
    if (!group || !user || !invitedBy) throw new Error('Group, User, or Inviter not found');

    const membership = await GroupMembership.create({
      groupId,
      userId,
      status: 'INVITED',
      invitedById: invitedByUserId,
      lastStatusChange: new Date()
    });

    await Notification.create({
      recipientId: userId,
      type: 'GROUP_INVITE',
      message: `You've been invited to join the group ${group.name}`,
      createdAt: new Date()
    });

    return membership;
  }

  async removeUser(groupId, userId) {
    const membership = await GroupMembership.findOne({ where: { groupId, userId } });
    if (!membership) throw new Error('User is not a member of this group');

    await membership.destroy();
    return { message: 'User removed from group successfully' };
  }

  async changeAdmin(groupId, newAdminId) {
    const group = await Group.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    const newAdmin = await User.findByPk(newAdminId);
    if (!newAdmin) throw new Error('New admin user not found');

    group.adminId = newAdminId;
    await group.save();

    await Notification.create({
      recipientId: newAdminId,
      type: 'ADMIN_CHANGED',
      message: `You are now the admin of the group ${group.name}`,
      createdAt: new Date()
    });

    return group;
  }

  async acceptJoinRequest(membershipId) {
    const membership = await GroupMembership.findByPk(membershipId);
    if (!membership) throw new Error('GroupMembership not found');

    membership.status = 'MEMBER';
    membership.lastStatusChange = new Date();
    await membership.save();

    await Notification.create({
      recipientId: membership.userId,
      type: 'GROUP_JOIN_ACCEPTED',
      message: `Your request to join the group has been accepted`,
      createdAt: new Date()
    });

    return membership;
  }

  async rejectJoinRequest(membershipId) {
    const membership = await GroupMembership.findByPk(membershipId);
    if (!membership) throw new Error('GroupMembership not found');

    membership.status = 'REJECTED';
    membership.lastStatusChange = new Date();
    await membership.save();

    await Notification.create({
      recipientId: membership.userId,
      type: 'GROUP_JOIN_REJECTED',
      message: `Your request to join the group has been rejected`,
      createdAt: new Date()
    });

    return membership;
  }

  async notifyMembers(groupId, message) {
    const group = await Group.findByPk(groupId, { include: [{ model: GroupMembership, where: { status: 'MEMBER' } }] });
    if (!group) throw new Error('Group not found');

    const notifications = await Promise.all(group.GroupMemberships.map(membership =>
      Notification.create({
        recipientId: membership.userId,
        type: 'GROUP_NOTIFICATION',
        message,
        createdAt: new Date()
      })
    ));

    return notifications;
  }

  async viewPendingRequests(groupId) {
    return await GroupMembership.findAll({
      where: { groupId, status: 'REQUESTED' },
      include: [User]
    });
  }
}

module.exports = new GroupController();