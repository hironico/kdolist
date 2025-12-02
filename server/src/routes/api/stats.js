const express = require('express');
const logger = require('../../logger');
const { User, Gift, Link, Image } = require('../../model');

const statsApi = express.Router();

/**
 * Get platform statistics
 * No authentication required - public endpoint
 */
statsApi.get('/', async (req, res) => {
    try {
        logger.info('Fetching platform statistics');

        // Count all users
        const userCount = await User.count();

        // Count all gifts
        const giftCount = await Gift.count();

        // Count all links
        const linkCount = await Link.count();

        // Count all images
        const imageCount = await Image.count();

        const stats = {
            users: userCount,
            gifts: giftCount,
            links: linkCount,
            images: imageCount
        };

        logger.info(`Statistics: ${JSON.stringify(stats)}`);
        res.status(200).json(stats);
    } catch (error) {
        logger.error(`Error fetching statistics: ${error.message}`);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

module.exports = { statsApi };
