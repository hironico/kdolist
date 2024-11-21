const { DataTypes } = require('sequelize');
const { GiftList, Gift, GroupAccess, Notification, Link, Image } = require('../model/model');
const logger = require('../logger');

class GiftListController {
  async addGift({giftListId, name, description, isHidden, selectedAt, selectedById}) {
    const giftList = await GiftList.findByPk(giftListId);
    if (!giftList) throw new Error(`Cannot add Gift to list. List not found ${giftListId}`);

    const gift = await Gift.create({ name, description, giftListId, isHidden, selectedAt, selectedById });

    logger.debug(`Created gift: ${JSON.stringify(gift)}`);

    await Notification.create({
      recipientId: giftList.ownerId,
      type: 'GIFT_ADDED',
      message: `A new gift "${name}" has been added to your list "${giftList.name}"`,
      createdAt: new Date()
    });

    return gift;
  }

  async removeGift(giftId) {
    const gift = await Gift.findByPk(giftId, { include: [GiftList] });
    if (!gift) throw new Error('Gift not found');

    await gift.destroy();

    await Notification.create({
      recipientId: gift.giftList.ownerId,
      type: 'GIFT_REMOVED',
      message: `The gift "${gift.name}" has been removed from your list "${gift.giftList.name}"`,
      createdAt: new Date()
    });

    return { message: 'Gift removed successfully' };
  }

  async updateGift(giftId, updates) {
    const gift = await Gift.findByPk(giftId, { include: [GiftList, Link, Image] });
    if (!gift) throw new Error('Gift not found');

    logger.debug(`Found gift for update: ${JSON.stringify(gift, null, 2)}`);

    await gift.update(updates);

    await Notification.create({
      recipientId: gift.giftList.ownerId,
      type: 'GIFT_LIST_UPDATED',
      message: `The gift "${gift.name}" in your list "${gift.giftList.name}" has been updated`,
      createdAt: new Date()
    });

    return gift;
  }

  async shareWithGroup(giftListId, groupId) {
    const [giftList, existingAccess] = await Promise.all([
      GiftList.findByPk(giftListId),
      GroupAccess.findOne({ where: { giftListId, groupId } })
    ]);

    if (!giftList) throw new Error('Gift List not found');
    if (existingAccess) throw new Error('This list is already shared with the group');

    const groupAccess = await GroupAccess.create({ giftListId, groupId });

    await Notification.create({
      recipientId: giftList.ownerId,
      type: 'GIFT_LIST_SHARED',
      message: `Your gift list "${giftList.name}" has been shared with a group`,
      createdAt: new Date()
    });

    return groupAccess;
  }

  async notifyGroupOfChanges(giftListId) {
    const giftList = await GiftList.findByPk(giftListId, { include: [{ model: GroupAccess, include: ['Group'] }] });
    if (!giftList) throw new Error('Gift List not found');

    const notifications = await Promise.all(giftList.GroupAccesses.flatMap(access => 
      access.Group.GroupMemberships.map(membership =>
        Notification.create({
          recipientId: membership.userId,
          type: 'GIFT_LIST_UPDATED',
          message: `The gift list "${giftList.name}" has been updated`,
          createdAt: new Date()
        })
      )
    ));

    return notifications;
  }

  async viewOfferedGifts(giftListId, showHidden = false) {
    const giftList = await GiftList.findByPk(giftListId, {
      include: [{
        model: Gift,
        where: { selectedById: { [Op.ne]: null } },
        ...(showHidden ? {} : { where: { isHidden: false } })
      }]
    });

    if (!giftList) throw new Error('Gift List not found');

    return giftList.Gifts;
  }

  async viewGiftListContents(giftListId) {
    const giftList = await GiftList.findByPk(giftListId, {
      include: [{
        model: Gift
      }]
    });
  
    if (!giftList) throw new Error('Gift List not found');
  
    return giftList.gifts;
  }
}

module.exports = new GiftListController();