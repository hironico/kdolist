const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const { User, SocialAccount } = require('../model/model');
const usercontroller = require('../controller/usercontroller');
const giftlistcontroller = require('../controller/giftlistcontroller');

const refreshTokens = [];

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
            if (err) {
                logger.warn(`Invalid JWT received: ${err}`);
                return res.sendStatus(403).end();
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).send('Expired').end();
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(user.get({ plain: true }), process.env.AUTH_SECRET, { expiresIn: '20m' });
}

const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user.get({ plain: true }), process.env.AUTH_REFRESH_SECRET);
    refreshTokens.push(refreshToken);
    return refreshToken;
}

const authApi = express.Router();

authApi.get('/v1/auth/whoami', authenticateJWT, (req, res) => {
    res.status(200).json(req.user).end();
});

authApi.post('/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send('Provide proper login info').end();
        return;
    }

    User.findOne({
        where: {
            email: email,
        }
    }).then(async user => {

        if (!user) {
            res.status(403).send('Invalid login info.').end();
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(403).send('Invalid login info').end();
            return;
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(200).json({
            username: email,
            email: user.email,
            id: user.id,            
            jwt: accessToken
        });        
    }).catch(error => {
        logger.error(`Cannot find user with password in database. ${error}`);
        res.status(500).send(`Cannot find userin database. ${error}`).end();
    });
})

authApi.post('/v1/auth/fb', async (req, res) => {
    // TODO verify access token from FB

    logger.info(`Facebook user is logging in:\n${JSON.stringify(req.body, null, 2)}`);
    const email = req.body.email;
    if (!email) {
        logger.error('Must provide at least an email!');
        return res.sendStatus(403).end();
    }

    const firstLastNames = req.body.username.split(' ');
    if (firstLastNames.length < 2) {
        firstLastNames.push('');
    }

    const socialAccount = await SocialAccount.findOne({
        where: { socialId: req.body.id, provider: 'FACEBOOK' }
    });

    let user = null;
    try {
        if (!socialAccount) {
            user = await usercontroller.createUser(req.body.username, firstLastNames[0], firstLastNames[1], email);
            await usercontroller.addSocialAccount(user.id, 'FACEBOOK', req.body.id);
            const giftList = await usercontroller.createGiftList(user.id, 'Ma première liste');

            const gift = {
                giftListId: giftList.id,
                name: 'Un exemple de cadeau',
                description: 'C\'est un super cadeau qui me ferait tres plaisir.'
            }

            await giftlistcontroller.addGift(gift);
        } else {
            user = await User.findByPk(socialAccount.userId);
        }
    } catch (error) {
        logger.error(`Cannot create a user and its first list. ${error}`);
        resizeTo.status(500).send(error).end();
        return;
    }

    logger.debug(JSON.stringify(user, null, 2));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    });
})

authApi.post('/v1/auth/refresh', authenticateJWT, (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    const accessToken = generateAccessToken(req.user);

    res.json({
        accessToken
    });
});

authApi.post('/v1/auth/logout', authenticateJWT, (req, res) => {
    const { token } = req.body;

    refreshTokens = refreshTokens.filter(t => t !== token);

    res.status(200).send("Logout successful");
});

module.exports = { authApi, authenticateJWT };