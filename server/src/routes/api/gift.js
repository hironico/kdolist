const express = require('express');

const { authenticateJWT } = require('./auth');

const { GiftList, Link, Gift, Image } = require('../../model/model');
const logger = require('../../logger');
const giftlistcontroller = require('../../controller/giftlistcontroller');

const giftApi = express.Router();

/**
 * Save a gift with dependencies into the database. Saves the gift, its links and images.
 * Links and images MUST be present when calling this endpoints or existing relations will be wiped out.
 */
giftApi.post('/v1/gift/', authenticateJWT, async (req, res) => {

    try {
        const theList = await GiftList.findOne({
            where: {
                id: req.body.giftListId,
                ownerId: req.user.id
            }
        });

        if (theList === null) {
            res.status(403).send('Cannot add gift to list. List not found.').end();
            return;
        }

        const gift = req.body.id ? await giftlistcontroller.updateGift(req.body.id, req.body) : await giftlistcontroller.addGift(req.body);

        if (gift === null) {
            res.status(403).send(`Cannot create or update gift. Invalid gift ID`).end();
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

        // TODO ajouter les immages

        // return newly created gift with links and images
        const newGift = await Gift.findByPk(gift.id, {
            include: [{ model: Link }, { model: Image }]
        });

        res.status(200).json(newGift);

    } catch (error) {
        logger.error(error);
        res.status(403).json(error).end();
    }
});

giftApi.delete('/v1/gift/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift list id').end();
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

giftApi.get('/v1/gift/links/:id', authenticateJWT, (req, res) => {
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

giftApi.post('/v1/gift/take/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    giftlistcontroller.updateGift(giftId, {selectedById: req.user.id, selectedAt: new Date()})
    .then(theGift => {
        res.status(200).json(theGift);
    })
});

giftApi.post('/v1/gift/untake/:id', authenticateJWT, (req, res) => {
    const giftId = req.params.id;
    if (!giftId) {
        res.status(403).send('Invalid gift id').end();
        return;
    }

    giftlistcontroller.updateGift(giftId, {selectedById: null, selectedAt: null})
    .then(theGift => {
        res.status(200).json(theGift);
    })
});

module.exports = { giftApi };