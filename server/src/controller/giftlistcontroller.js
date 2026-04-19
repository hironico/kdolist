const { DataTypes, where } = require('sequelize');
const { GiftList, Gift, Group, GroupAccess, GroupMembership, Notification, Link, Image, sequelize } = require('../model');
const { Op } = require('sequelize');
const logger = require('../logger');

class GiftListController {
  async addGift({ giftListId, name, isHidden, selectedAt, selectedById }, userId = null) {
    const giftList = await GiftList.findByPk(giftListId);
    if (!giftList) throw new Error(`Cannot add Gift to list. List not found ${giftListId}`);

    const gift = await Gift.create({ name, giftListId, isHidden, selectedAt, selectedById });

    logger.info(`Created gift: ${JSON.stringify(gift)}`);

    // update the modification date of the list
    giftList.set('updatedAt', new Date(), { raw: true });
    await giftList.save();

    return gift;
  }

  async removeGift(giftId, userId = null) {
    const gift = await Gift.findByPk(giftId, { include: [GiftList] });
    if (!gift) throw new Error('Gift not found');

    await gift.destroy();

    return { message: 'Gift removed successfully' };
  }

  async updateGift(giftId, updates, userId = null) {
    const gift = await Gift.findByPk(giftId, { include: [GiftList, Link, Image] });
    if (!gift) throw new Error('Gift not found');

    logger.debug(`Found gift for update: ${JSON.stringify(gift, null, 2)}`);

    const newGift = await gift.update(updates);

    return newGift;
  }

  async addGiftLink({ url, description, giftId }) {
    logger.debug(`Adding link: ${url} to gift id ${giftId}`);
    return Link.create({ url, description, giftId });
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

  async addGiftImage({ giftId, url }) {
    logger.debug(`Adding image to gift id: ${giftId}`);
    return Image.create({ giftId, url });
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

    // Note: GIFT_LIST_SHARED is not in the notification enum, commenting out
    // await Notification.create({
    //   recipientId: giftList.ownerId,
    //   senderId: null,
    //   objectId: giftListId,
    //   type: 'GIFT_LIST_SHARED',
    //   createdAt: new Date()
    // });

    return groupAccess;
  }

  async notifyGroupOfChanges(giftListId) {
    const giftList = await GiftList.findByPk(giftListId, { include: [{ model: GroupAccess, include: ['Group'] }] });
    if (!giftList) throw new Error('Gift List not found');

    const notifications = await Promise.all(giftList.GroupAccesses.flatMap(access =>
      access.Group.GroupMemberships.map(membership =>
        Notification.create({
          recipientId: membership.userId,
          senderId: giftList.ownerId,
          objectId: giftListId,
          type: 'GIFT_LIST_UPDATED',
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

      list.set('name', giftList.name);
      list.set('showTakenToOwner', giftList.showTakenToOwner);
      if (giftList.isCollaborative !== undefined) {
        list.set('isCollaborative', giftList.isCollaborative);
      }
      list.set('updatedAt', new Date());

      await list.save();

      return list;
    } else {
      const newGiftList = await GiftList.create({
        name: giftList.name,
        ownerId: ownerId,
        isCollaborative: giftList.isCollaborative ?? false
      });
      return newGiftList;
    }
  }

  /**
   * Replace all GroupAccess records for a list with the supplied groupIds.
   * Only the owner may call this.
   */
  async setGroupAccesses(giftListId, groupIds, ownerId) {
    const list = await GiftList.findByPk(giftListId);
    if (!list) throw new Error(`GiftList not found: ${giftListId}`);
    if (list.ownerId !== ownerId) throw new Error('Only the list owner can manage group access.');

    // Delete existing accesses for this list
    await GroupAccess.destroy({ where: { giftListId } });

    if (!groupIds || groupIds.length === 0) {
      return [];
    }

    const created = await Promise.all(
      groupIds.map(groupId => GroupAccess.create({ giftListId, groupId }))
    );

    logger.info(`Set ${created.length} group accesses for list ${giftListId}`);
    return created;
  }

  /**
   * Returns true if userId is the list owner, OR if the list is collaborative
   * and the user is a MEMBER or ADMIN of any group that has GroupAccess to this list.
   */
  async isUserAuthorizedToEdit(listId, userId) {
    const list = await GiftList.findByPk(listId, {
      include: [{ model: GroupAccess }]
    });

    if (!list) return false;
    if (list.ownerId === userId) return true;
    if (!list.isCollaborative) return false;

    const groupIds = list.groupAccesses.map(ga => ga.groupId);
    if (groupIds.length === 0) return false;

    const membership = await GroupMembership.findOne({
      where: {
        userId,
        groupId: { [Op.in]: groupIds },
        status: { [Op.in]: ['MEMBER', 'ADMIN'] }
      }
    });

    return membership !== null;
  }

  async toggleFavorite(giftId) {
    const gift = await Gift.findByPk(giftId, { include: [GiftList] });
    if (!gift) throw new Error('Gift not found');

    // Toggle the favorite status
    gift.isFavorite = !gift.isFavorite;
    gift.updatedAt = new Date();
    await gift.save();

    logger.info(`Toggled favorite status for gift ${giftId}: ${gift.isFavorite}`);

    return gift;
  }
}

module.exports = new GiftListController();
