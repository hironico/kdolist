const express = require('express');
const { authenticateJWT } = require('./auth');
const groupController = require('../../controller/groupcontroller');
const logger = require('../../logger');

const groupApi = express.Router();

/**
 * Create a new group
 */
groupApi.post('/', authenticateJWT, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).send('Group name is required');
            return;
        }
        const group = await groupController.createGroup(name, req.user.id);
        res.json(group);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Delete a group (admin only)
 */
groupApi.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const result = await groupController.deleteGroup(groupId, req.user.id);
        res.json(result);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Get groups the current user belongs to
 */
groupApi.get('/', authenticateJWT, async (req, res) => {
    try {
        const groups = await groupController.getUserGroups(req.user.id);
        res.json(groups);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Search groups by name
 */
groupApi.get('/search', authenticateJWT, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).send('Query parameter is required');
            return;
        }
        const groups = await groupController.searchGroups(query);
        res.json(groups);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Get detailed information about a specific group
 */
groupApi.get('/:id/details', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const details = await groupController.getGroupDetails(groupId, req.user.id);
        res.json(details);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Request to join a group
 */
groupApi.post('/:id/join', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const membership = await groupController.requestJoin(groupId, req.user.id);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Invite a user to a group
 */
groupApi.post('/:id/invite', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        if (!userId) {
            res.status(400).send('User ID is required');
            return;
        }
        const membership = await groupController.inviteUser(groupId, userId, req.user.id);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Get members of a group
 */
groupApi.get('/:id/members', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const members = await groupController.getGroupMembers(groupId);
        res.json(members);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Accept a join request (membership ID)
 */
groupApi.post('/membership/:id/accept', authenticateJWT, async (req, res) => {
    try {
        const membershipId = req.params.id;
        // TODO: Check if req.user.id is admin of the group associated with this membership
        const membership = await groupController.acceptJoinRequest(membershipId);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Reject a join request (membership ID)
 */
groupApi.post('/membership/:id/reject', authenticateJWT, async (req, res) => {
    try {
        const membershipId = req.params.id;
        // TODO: Check if req.user.id is admin of the group associated with this membership
        const membership = await groupController.rejectJoinRequest(membershipId);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Accept an invite (membership ID)
 */
groupApi.post('/membership/:id/accept-invite', authenticateJWT, async (req, res) => {
    try {
        const membershipId = req.params.id;
        const membership = await groupController.acceptInvite(membershipId, req.user.id);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Reject an invite (membership ID)
 */
groupApi.post('/membership/:id/reject-invite', authenticateJWT, async (req, res) => {
    try {
        const membershipId = req.params.id;
        const membership = await groupController.rejectInvite(membershipId, req.user.id);
        res.json(membership);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Delete an invitation (admin only)
 */
groupApi.delete('/membership/:id', authenticateJWT, async (req, res) => {
    try {
        const membershipId = req.params.id;
        const { GroupMembership, Group } = require('../../model');

        // Get the membership to check permissions
        const membership = await GroupMembership.findByPk(membershipId);
        if (!membership) {
            return res.status(404).send('Membership not found');
        }

        // Get the group to verify admin status
        const group = await Group.findByPk(membership.groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }

        // Check if the current user is an admin of the group
        if (group.adminId !== req.user.id) {
            return res.status(403).send('Only group admins can delete invitations');
        }

        // Only allow deletion of INVITED or REJECTED memberships
        if (membership.status !== 'INVITED' && membership.status !== 'REJECTED') {
            return res.status(400).send('Can only delete invitations (invited or declined)');
        }

        await membership.destroy();
        res.json({ message: 'Invitation deleted successfully' });
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

/**
 * Leave a group
 */
groupApi.post('/:id/leave', authenticateJWT, async (req, res) => {
    try {
        const groupId = req.params.id;
        const result = await groupController.removeUser(groupId, req.user.id);
        res.json(result);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

module.exports = { groupApi };
