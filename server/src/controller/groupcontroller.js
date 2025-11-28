const { Group, User, GroupMembership, Notification } = require('../model/model');
const { Op } = require('sequelize');

class GroupController {
  async createGroup(name, adminId) {
    const group = await Group.create({ name, adminId });
    await GroupMembership.create({
      groupId: group.id,
      userId: adminId,
      status: 'ADMIN',
      lastStatusChange: new Date()
    });
    return group;
  }

  async searchGroups(query) {
    const { Op, Sequelize } = require('sequelize');
    return await Group.findAll({
      where: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('name')),
        {
          [Op.like]: `%${query.toLowerCase()}%`
        }
      )
    });
  }

  async requestJoin(groupId, userId) {
    const existing = await GroupMembership.findOne({ where: { groupId, userId } });
    if (existing) {
      if (existing.status === 'REJECTED') {
        throw new Error('Your request to join this group was previously rejected.');
      }
      if (existing.status === 'MEMBER') {
        throw new Error('You are already a member of this group.');
      }
      if (existing.status === 'REQUESTED') {
        throw new Error('You have already requested to join this group.');
      }
      if (existing.status === 'INVITED') {
        // If invited, automatically accept
        existing.status = 'MEMBER';
        existing.lastStatusChange = new Date();
        await existing.save();
        return existing;
      }
    }

    const membership = await GroupMembership.create({
      groupId,
      userId,
      status: 'REQUESTED',
      requestedAt: new Date(),
      lastStatusChange: new Date()
    });

    // Notify admin
    const group = await Group.findByPk(groupId);
    if (group && group.adminId) {
      await Notification.create({
        recipientId: group.adminId,
        type: 'GROUP_JOIN_REQUEST',
        message: `User requested to join group ${group.name}`,
        createdAt: new Date()
      });
    }

    return membership;
  }

  async getUserGroups(userId) {
    const { Op } = require('sequelize');
    return await Group.findAll({
      include: [
        {
          model: GroupMembership,
          where: {
            userId
          }
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'firstname', 'lastname']
        }
      ],
      order: [
        [GroupMembership, 'status', 'ASC'],
        ['name', 'ASC']
      ]
    });
  }

  async getGroupMembers(groupId) {
    return await GroupMembership.findAll({
      where: { groupId },
      include: [User]
    });
  }

  async getGroupDetails(groupId, userId) {
    const { GiftList, GroupAccess } = require('../model/model');

    // Get the group with admin info
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'firstname', 'lastname']
        }
      ]
    });

    if (!group) throw new Error('Group not found');

    // Get all members with their user info
    const memberships = await GroupMembership.findAll({
      where: {
        groupId,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'firstname', 'lastname'],
          as: 'user'
        }
      ],
      order: [['lastStatusChange', 'ASC']]
    });

    // Separate admins, regular members, invited, and declined
    const admins = memberships.filter(m => m.status === 'ADMIN');
    const members = memberships.filter(m => m.status === 'MEMBER');
    const invited = memberships.filter(m => m.status === 'INVITED');
    const declined = memberships.filter(m => m.status === 'REJECTED');

    const confirmedMembers = memberships.filter(m => m.status === 'MEMBER' || m.status === 'ADMIN');
    const confirmedUserIds = confirmedMembers.map(m => m.userId);

    // Get gift lists shared with this group
    const groupLists = await GiftList.findAll({
      where: {
        ownerId: { [Op.in]: confirmedUserIds }
      }
    });

    // Count total gift lists
    const totalLists = groupLists.length;

    return {
      id: group.id,
      name: group.name,
      adminId: group.adminId,
      admin: group.admin,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      admins: admins.map(a => a.user),
      members: members.map(m => m.user),
      invited: invited.map(i => ({ ...i.user.get({ plain: true }), membershipId: i.id })),
      declined: declined.map(d => ({ ...d.user.get({ plain: true }), membershipId: d.id })),
      totalMembers: memberships.length,
      totalLists: totalLists,
      giftLists: groupLists
    };
  }

  async inviteUser(groupId, userId, invitedByUserId) {
    const [group, user] = await Promise.all([
      Group.findByPk(groupId),
      User.findByPk(userId)
    ]);

    if (!group || !user) throw new Error('Group or User not found');

    if (group.adminId !== invitedByUserId) {
      throw new Error('Only the group admin can invite users.');
    }

    // Check if already member or invited
    const existing = await GroupMembership.findOne({ where: { groupId, userId } });
    if (existing) {
      if (existing.status === 'MEMBER') throw new Error('User is already a member');
      if (existing.status === 'INVITED') throw new Error('User is already invited');
      // If REJECTED or REQUESTED, we might want to reset to INVITED
      existing.status = 'INVITED';
      existing.invitedById = invitedByUserId;
      existing.lastStatusChange = new Date();
      await existing.save();
      return existing;
    }

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

  async deleteGroup(groupId, userId) {
    const group = await Group.findByPk(groupId);
    if (!group) throw new Error('Group not found');

    // Check if the user is the admin of the group
    if (group.adminId !== userId) {
      throw new Error('Only the group admin can delete the group');
    }

    // Delete all memberships first
    await GroupMembership.destroy({ where: { groupId } });

    // Delete the group
    await group.destroy();

    return { message: 'Group deleted successfully' };
  }

  async acceptInvite(membershipId, userId) {
    const membership = await GroupMembership.findByPk(membershipId);
    if (!membership) throw new Error('Membership not found');
    if (membership.userId !== userId) throw new Error('Not authorized');
    if (membership.status !== 'INVITED') throw new Error('No pending invitation');

    membership.status = 'MEMBER';
    membership.lastStatusChange = new Date();
    await membership.save();
    return membership;
  }

  async rejectInvite(membershipId, userId) {
    const membership = await GroupMembership.findByPk(membershipId);
    if (!membership) throw new Error('Membership not found');
    if (membership.userId !== userId) throw new Error('Not authorized');
    if (membership.status !== 'INVITED') throw new Error('No pending invitation');

    membership.status = 'REJECTED';
    membership.lastStatusChange = new Date();
    await membership.save();
    return membership;
  }

  // Deprecated or Admin-only methods below
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