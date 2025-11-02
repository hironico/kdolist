const { DataTypes, where } = require('sequelize');
const { GiftList, Gift, GroupAccess, Notification, Link, Image, sequelize } = require('../model/model');
const logger = require('../logger');

class GiftListController {
  async addGift({ giftListId, name, isHidden, selectedAt, selectedById }) {
    const giftList = await GiftList.findByPk(giftListId);
    if (!giftList) throw new Error(`Cannot add Gift to list. List not found ${giftListId}`);

    const gift = await Gift.create({ name, giftListId, isHidden, selectedAt, selectedById });

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

    const newGift = await gift.update(updates);

    await Notification.create({
      recipientId: gift.giftList.ownerId,
      type: 'GIFT_LIST_UPDATED',
      message: `The gift "${gift.name}" in your list "${gift.giftList.name}" has been updated`,
      createdAt: new Date()
    });

    return newGift;
  }

  async addGiftLink({url, description, giftId}) {
      logger.debug(`Adding link: ${url} to gift id ${giftId}`);
      return Link.create({url, description, giftId});
  }

  async removeGiftLink(giftLinkId) {
    const link = await Link.findByPk(giftLinkId);
    if (!link) throw Error(`Cannot find link id ${giftLinkId}`);

    return link.destroy();
  }

  async removeAllGiftLinks(giftId) {
    return Link.destroy({
      where: {
        giftId: giftId
      }
    }).then(() => {
      logger.debug(`Delete all links for gif id: ${giftId}. Success.`);
    });
  }

  async addAllGiftLinks(links) {
    const allPromises = [];

    logger.debug(`adding all links:\n${JSON.stringify(links, null, 2)}`);

    for (const link of links) {
      const prom = this.addGiftLink(link)
      allPromises.push(prom);
    }

    return Promise.all(allPromises);
  }

  async addGiftImage({giftId, url}) {
    logger.debug(`Adding image to gift id: ${giftId}`);
    return Image.create({giftId, url});
  }

  async removeGiftImage(giftImageId) {
    const img = await Image.findByPk(giftImageId);
    if (!img) throw new Error(`Cannot remove image with id ${giftImageId}. Not found.`);

    return img.destroy();
  }

  async addAllGiftImages(images) {
    const allPromises = [];

    for (let img of images) {
      const prom = this.addGiftImage(img);
      allPromises.push(prom);
    }

    return Promise.all(allPromises);
  }

  async removeAllGiftImages(giftId) {
    return Image.destroy({
      where: {
        giftId: giftId
      }
    }).then(() => {
      logger.debug(`Delete all gift images for gif id: ${giftId}. Success.`);
    });
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
        model: Gift, include: [{ model: Link }, { model: Image }]
      }]
    });

    if (!giftList) throw new Error('Gift List not found');

    return giftList.gifts;
  }

  async addOrUpdateGiftList(giftList, ownerId) {
    if (giftList.id && giftList.id !== '') {
      const list = await GiftList.findByPk(giftList.id);

      if (list === null) {
        logger.error(`Cannot update list with id: ${giftList.id}. Not found.`);
        return null;
      }

      if (list.ownerId !== ownerId) {
        logger.error(`Cannot update list with id: ${giftList.id}. Not owned by current user: ${list.ownerId} <> ${ownerId}`);
        return null;
      }

      await list.update({ name: giftList.name});

      return list;      
    } else {
      const newGiftList = await GiftList.create({
        name: giftList.name,
        ownerId: ownerId
      });
      return newGiftList;
    }
  }
}

module.exports = new GiftListController();