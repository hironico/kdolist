const express = require('express');
const {Op} = require('sequelize');

const { authenticateJWT } = require('./auth');

const { GiftList, Gift, User } = require('../../model/model');
const logger = require('../../logger');
const giftlistcontroller = require('../../controller/giftlistcontroller');

const giftListApi = express.Router();

/**
 * Get the lists of the current logged in user.
 */
giftListApi.get('/', authenticateJWT, async (req, res) => {
    const allMyLists = await GiftList.findAll({
        where: {
            ownerId: req.user.id
        }, 
        include : 'owner'
    });

    res.json(allMyLists);
});

/**
 * Get the lists that are SHARED with the current logged in user.
 */
giftListApi.get('/shared', authenticateJWT, async (req, res) => {
    const allMyLists = await GiftList.findAll({
        where: {
            ownerId: {
                [Op.not]: req.user.id
            }
        },
        include: 'owner'
    });

    res.json(allMyLists);
});

/**
 * Get all lists regardless the owner
 */
giftListApi.get('/all', authenticateJWT, async (req, res) => {
    const allLists = await GiftList.findAll({
        include: 'owner'
    });

    res.json(allLists);
});

/**
 * Get the list contents whose ID is given as path parameter :id
 */
giftListApi.get('/contents/:id', authenticateJWT, async (req, res) => {
    const listId = req.params.id;
    if (!listId) {
        res.status(403).send('Invalid gift list id').end();
        return;
    }

    try {
        const listContents = await giftlistcontroller.viewGiftListContents(listId);
        logger.debug(`Found gifts: ${JSON.stringify(listContents, null, 2)}`);
        res.status(200).json(listContents);
    } catch (error) {
        res.status(500).send(error).end()
    };
});

/**
 * Create or update a new list for the current loggedin user.
 * Returns the newly created list json to client.
 */
giftListApi.post('/', authenticateJWT, async (req, res) => {
    try {
        const newGiftList = await giftlistcontroller.addOrUpdateGiftList(req.body, req.user.id);

        res.status(200).json(newGiftList);
    } catch (error) {
        res.status(500).send(error).end();
    }
});

giftListApi.delete('/:id', authenticateJWT, async (req, res) => {
    const listId = req.params.id;
    if (!listId) {
        res.status(403).send('Invalid gift list id').end();
        return;
    }

    try {
        const theList = await GiftList.findOne({
            where: {
                id: listId,
                ownerId: req.user.id
            },
            include: [Gift]
        });

        if (theList === null) {
            res.status(403).send('List not found').end();
            return;
        }

        // supprimer aussi toutes les clefs etrangeres de la liste

        theList.destroy()
            .then(() => {
                res.status(200).send('Success');
            });

    } catch (error) {
        console.log('Cannot delete gift list: ', error);
        res.status(500).send(error).end();
    }
});

module.exports = { giftListApi };