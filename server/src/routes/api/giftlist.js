const express = require('express');
const { Op } = require('sequelize');

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
        include: 'owner'
    });

    res.json(allMyLists);
});



/**
 * Get user's own lists and lists from tribes they are members of
 */
giftListApi.get('/all', authenticateJWT, async (req, res) => {
    const { Group, GroupMembership } = require('../../model/model');

    // Get user's tribes (where they are admin or member, not invited)
    const userTribes = await Group.findAll({
        include: [{
            model: GroupMembership,
            where: {
                userId: req.user.id,
                status: {
                    [Op.in]: ['MEMBER', 'ADMIN']
                }
            }
        }],
        attributes: ['id', 'name']
    });

    // For each tribe, get all confirmed members and their lists
    const tribeListsMap = {};
    for (const tribe of userTribes) {
        const confirmedMemberships = await GroupMembership.findAll({
            where: {
                groupId: tribe.id,
                status: {
                    [Op.in]: ['MEMBER', 'ADMIN']
                }
            },
            attributes: ['userId']
        });

        const memberIds = confirmedMemberships.map(m => m.userId);

        // Get all lists owned by these members
        const tribeLists = await GiftList.findAll({
            where: {
                ownerId: {
                    [Op.in]: memberIds
                }
            },
            include: 'owner'
        });

        tribeListsMap[tribe.id] = tribeLists;
    }

    // Get user's own lists
    const myLists = await GiftList.findAll({
        where: {
            ownerId: req.user.id
        },
        include: 'owner'
    });

    res.json({
        myLists: myLists,
        userTribes: userTribes,
        tribeListsMap: tribeListsMap
    });
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