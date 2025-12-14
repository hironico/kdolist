const express = require('express');

const { authenticateJWT } = require('./auth');

const { GiftList, Link, Gift, Image, Notification } = require('../../model');
const logger = require('../../logger');
const giftlistcontroller = require('../../controller/giftlistcontroller');

const giftApi = express.Router();

/**
 * Save a gift with dependencies into the database. Saves the gift, its links and images.
 * Links and images MUST be present when calling this endpoints or existing relations will be wiped out.
 */
giftApi.post('/', authenticateJWT, async (req, res) => {

    try {
        const theList = await GiftList.findOne({
            where: {
                id: req.body.giftListId,
                ownerId: req.user.id
            }
        });

        if (theList === null) {
            res.status(400).send('Cannot add gift to list. List not found or you are not the owner.').end();
            return;
        }

        const gift = req.body.id ? await giftlistcontroller.updateGift(req.body.id, req.body, req.user.id) : await giftlistcontroller.addGift(req.body, req.user.id);

        if (gift === null) {
            res.status(400).send(`Cannot create or update gift. Invalid gift ID`).end();
            return;
        }

        // do not destroy all links if no links property is present
        if (req.body.links) {
            await giftlistcontroller.removeAllGiftLinks(gift.id);
            // check that links have the giftId set.
            const linksToCreate = req.body.links.map(link => {
                link.giftId = gift.id;
                return link;
            });
            await giftlistcontroller.addAllGiftLinks(linksToCreate);
        }

        // do not destroy images if  no images prop is present
        if (req.body.images) {
            await giftlistcontroller.removeAllGiftImages(gift.id);
            // check the images have the gift id set.
            const imagesToCreate = req.body.images.map(img => {
                img.giftId = gift.id;
                return img;
            });
            await giftlistcontroller.addAllGiftImages(imagesToCreate);
        }

        // update the last modified date of the list to indicate there are changes to this list
        giftlistcontroller.addOrUpdateGiftList(theList, req.user.id);

        // return newly created gift with links and images
        const newGift = await Gift.findByPk(gift.id, {
            include: [{ model: Link }, { model: Image }]
        });

        // Create notification based on whether this was a new gift or an update
        const notificationType = req.body.id ? 'GIFT_LIST_UPDATED' : 'GIFT_ADDED';
        await Notification.create({
            recipientId: null,
            senderId: req.user.id,
            objectId: req.body.giftListId,
            type: notificationType,
            createdAt: new Date()
        });

        res.status(200).json(newGift);

    } catch (error) {
        logger.error(error);
        res.status(500).json(error).end();
    }
});

giftApi.delete('/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    try {
        Gift.findByPk(giftId, {
            include: [GiftList]
        })
            .then(theGift => {
                if (theGift.giftList.ownerId !== req.user.id) {
                    logger.warning(`Attempt to delete a gift where user is not owner of the list!`);
                    res.status(403).send('You cannot delete a gift of someone else\'s list.').end();
                    return;
                }

                theGift.destroy()
                    .then(() => {
                        res.status(200).send('Gift has been removed.');
                    })
            }).catch(error => {
                logger.error('Cannot delete gift. Error:' + error);
                res.status(400).send(`Cannot delete gift. ${error}`);
            });
    } catch (error) {
        logger.error(`Cannot delete gift ${id}. Error: ${error}`);
        res.status(500).send(error).end();
    }
});

giftApi.get('/links/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    Link.findAll({
        where: {
            giftId: giftId
        }
    }).then(links => {
        res.status(200).json(links);
    }).catch(error => {
        const msg = `Cannot getch gift links. ${error}`;
        logger.error(msg);
        res.status(500).send(msg).end();
    });
});

giftApi.post('/take/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    Gift.findByPk(giftId)
        .then(theGift => {
            if (theGift === null) {
                res.status(400).send('Cannot find gift to mark as taken.').end();
                return;
            }
            if (theGift.selectedById !== null && theGift.selectedById !== '') {
                res.status(400).send('Gift is already taken by someone. Cannot take it for you.').end();
            } else {
                giftlistcontroller.updateGift(giftId, { selectedById: req.user.id, selectedAt: new Date() }, req.user.id)
                    .then(async theGift => {
                        // Create GIFT_TAKEN notification
                        await Notification.create({
                            recipientId: null,
                            senderId: req.user.id,
                            objectId: theGift.giftListId,
                            type: 'GIFT_TAKEN',
                            createdAt: new Date()
                        });
                        res.status(200).json(theGift);
                    }).catch(error => {
                        res.status(500).send('Cannot mark gift as taken.' + error).end();
                    })
            }
        }).catch(error => {
            res.status(500).send(`Cannot find gift to mark as taken. ${error}`).end();
        });
});

giftApi.post('/untake/:id', authenticateJWT, async (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    try {
        // Find the gift first to check who took it
        const theGift = await Gift.findByPk(giftId);
        
        if (!theGift) {
            res.status(404).send('Gift not found').end();
            return;
        }

        // Check if the gift is actually taken
        if (!theGift.selectedById) {
            res.status(400).send('Gift is not marked as taken').end();
            return;
        }

        // Only the person who took the gift can untake it
        if (theGift.selectedById !== req.user.id) {
            logger.warning(`User ${req.user.id} attempted to untake gift ${giftId} that was taken by ${theGift.selectedById}`);
            res.status(403).send('Only the person who took this gift can untake it.').end();
            return;
        }

        // Update the gift to untake it
        const updatedGift = await giftlistcontroller.updateGift(giftId, { selectedById: null, selectedAt: null }, req.user.id);
        
        // Create GIFT_UNTAKEN notification
        await Notification.create({
            recipientId: null,
            senderId: req.user.id,
            objectId: updatedGift.giftListId,
            type: 'GIFT_UNTAKEN',
            createdAt: new Date()
        });
        
        res.status(200).json(updatedGift);
    } catch (error) {
        logger.error(`Cannot untake gift ${giftId}. Error: ${error}`);
        res.status(500).send(`Cannot untake gift. ${error}`).end();
    }
});

giftApi.post('/favorite/:id', authenticateJWT, async (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    try {
        // Find the gift with its associated gift list to check ownership
        const theGift = await Gift.findByPk(giftId, {
            include: [GiftList]
        });

        if (!theGift) {
            res.status(404).send('Gift not found').end();
            return;
        }

        // Check if user is the owner of the gift list
        if (theGift.giftList.ownerId !== req.user.id) {
            logger.warning(`Attempt to toggle favorite on a gift where user is not owner of the list!`);
            res.status(403).send('You can only mark favorites on your own lists.').end();
            return;
        }

        const updatedGift = await giftlistcontroller.toggleFavorite(giftId);
        res.status(200).json(updatedGift);
    } catch (error) {
        logger.error(`Cannot toggle favorite status for gift ${giftId}. Error: ${error}`);
        res.status(500).send(`Cannot toggle favorite. ${error}`).end();
    }
});

giftApi.delete('/image/:id', authenticateJWT, async (req, res) => {
    const imageId = req.params.id;
    if (!imageId) {
        res.status(400).send('Invalid image id').end();
        return;
    }

    try {
        // Find the image with its associated gift and gift list
        const theImage = await Image.findByPk(imageId, {
            include: [{
                model: Gift,
                include: [GiftList]
            }]
        });

        if (!theImage) {
            res.status(404).send('Image not found').end();
            return;
        }

        // Check if user owns the gift list
        if (theImage.gift.giftList.ownerId !== req.user.id) {
            logger.warning(`Attempt to delete an image where user is not owner of the list!`);
            res.status(403).send('You cannot delete an image from someone else\'s gift.').end();
            return;
        }

        // Delete the image
        await theImage.destroy();
        logger.info(`Image ${imageId} deleted by user ${req.user.id}`);
        res.status(200).send('Image has been removed.').end();

    } catch (error) {
        logger.error(`Cannot delete image ${imageId}. Error: ${error}`);
        res.status(500).send(`Cannot delete image. ${error}`).end();
    }
});

module.exports = { giftApi };
