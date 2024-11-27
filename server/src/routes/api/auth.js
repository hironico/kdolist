const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../../logger');
const { User, SocialAccount } = require('../../model/model');
const usercontroller = require('../../controller/usercontroller');
const giftlistcontroller = require('../../controller/giftlistcontroller');

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

/**
 * This function will find the corresponding user for the social account this user is logged into. 
 * If the user is already present (same email) but with qnother social network, then this function fails
 * and return null. 
 * @param {*} profile the profile from the social network 
 * @param {*} provider type of social network : FACEBOOK, GOOGLE ... 
 * @returns the user isntance associated to that account or null in case of problem
 */
const loginSocialUser = async (profile, provider) => {
    logger.info(`${provider} user is logging in:\n${JSON.stringify(profile, null, 2)}`);
    const email = profile.email;
    if (!email) {
        logger.error('Must provide at least an email!');
        return null;
    }

    const firstLastNames = profile.username.split(' ');
    if (firstLastNames.length < 2) {
        firstLastNames.push('');
    }

    const socialAccount = await SocialAccount.findOne({
        where: { socialId: profile.id, provider: provider }
    });

    let user = null;
    try {
        if (!socialAccount) {

            // check if the user already exsits with a different social account
            const existingUser = await User.findOne({
                where: {
                    email: email
                }
            });

            if (existingUser) {
                logger.error('A user attempting to login with a social account but already exsits with another.');
                return null;
            }

            user = await usercontroller.createUser(profile.username, firstLastNames[0], firstLastNames[1], email);
            await usercontroller.addSocialAccount(user.id, provider, profile.id);
            const giftList = await usercontroller.createGiftList(user.id, 'Ma première liste');

            const gift = {
                giftListId: giftList.id,
                name: 'Un exemple de cadeau',
                description: 'C\'est un super cadeau qui me ferait très plaisir.'
            }

            await giftlistcontroller.addGift(gift);
        } else {
            user = await User.findByPk(socialAccount.userId);
        }
    } catch (error) {
        logger.error(`Cannot create a user and its first list. ${error}`);        
        return null;
    }

    logger.debug(JSON.stringify(user, null, 2));
    return user;
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

    const user = loginSocialUser(req.body, 'FACEBOOK');

    if (user === null) {
        res.status(500).send('Cannot create or logina user with FACEBOOK').end();
        return;
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    });
});

authApi.post('/v1/auth/google', async (req, res) => {
    // TODO verify access token from Google

    const user = await loginSocialUser(req.body, 'GOOGLE');

    if (user === null) {
        res.status(500).send('Cannot create or logina user with GOOGLE').end();
        return;
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    });
});

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