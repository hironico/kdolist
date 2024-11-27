const express = require('express');

const { authenticateJWT } = require('./auth');

const { GiftList, Link, Gift } = require('../../model/model');
const logger = require('../../logger');
const giftlistcontroller = require('../../controller/giftlistcontroller');

const giftApi = express.Router();


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

        try {
            const gift = req.body.id ? giftlistcontroller.updateGift(req.body.id, req.body) : giftlistcontroller.addGift(req.body);
            logger.debug(`Gift with id ${gift.id} has been added to list id ${gift.giftListId}.`);

            // TODO ajouter les immages


            // TODO ajouter les liens

            // renvoyer le gift nouvellement créé
            res.status(200).json(gift);

        } catch (error) {
            logger.error(error);
            res.status(403).json(error).end();
        }

    } catch (error) {
        logger.error(error);
        res.status(500).json(error).end();
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

giftApi.post('/v1/gift/links/', authenticateJWT, (req, res) => {
    const links = req.body;

    logger.debug('Links to save: ' + JSON.stringify(links));

    const promises = [];

    for (link of links) {
        logger.debug('Saving link: ' + JSON.stringify(link));

        const prom = Gift.findOne({
            where: {
                id: link.giftId
            },
            include: [GiftList]
        })
        .then(gift => {
            if (!gift || gift.giftList.ownerId !== req.user.id) {
                const msg = 'Cannot save a link for a gift owned by different user.';
                throw(new Error(msg));
            } 
            
            const newLink = { 
                url : link.url, 
                description: link.description,
                giftId: link.giftId
            };

            return Link.create(newLink);
            });

        promises.push(prom);
    }

    Promise.all(promises)
    .then (() => {
        res.status(200).send('Links have been created.');
    })
    .catch(error => {
        logger.error(`Cannot save links. ${error}`);
        res.status(500).send('Cannot save links. ' + error).end();
    })
});

module.exports = { giftApi };