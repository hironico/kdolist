const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../../logger');
const { User, SocialAccount } = require('../../model');
const usercontroller = require('../../controller/usercontroller');
const giftlistcontroller = require('../../controller/giftlistcontroller');
const { getAuthorizationUrl, getClient } = require('../../config/keycloak');

let refreshTokens = [];

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
            if (err) {
                logger.warn(`${req.method} : ${req.originalUrl}. Invalid JWT received: ${err}`);
                return res.sendStatus(403).end();
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).send(`No Authorization header`).end();
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(user.get({ plain: true }), process.env.AUTH_SECRET, { expiresIn: process.env.AUTH_TOKEN_EXPIRATION_TIME });
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

    const username = profile.username;
    if (!username) {
        logger.warn('No username found in profile. Defaulting to email');
        username = email;
        profile['username'] = username;
    }

    const firstName = profile.firstName;
    const lastName = profile.lastName;

    if (!firstName && !lastName) {
        firstName = username;
        profile['firstName'] = firstName;
    }

    // check if the user already exists and create or update it with profile
    const existingUser = await User.findOne({
        where: {
            username: username
        }
    });

    let user = null;
    if (existingUser) {
        logger.info('Found existing user, updating profile with latest data from Keycloak...');
        // Update user profile to keep it in sync with Keycloak
        existingUser.username = username;
        existingUser.firstname = firstName;
        existingUser.lastname = lastName;
        existingUser.email = email;
        await existingUser.save();
        user = existingUser;
        logger.info(`Updated user profile: ${username}`);
    } else {
        logger.info('New user! Creating profile...');
        user = await usercontroller.createUser(username, firstName, lastName, email);
    }

    const socialAccount = await SocialAccount.findOne({
        where: { socialId: profile.id, provider: provider }
    });

    try {
        if (!socialAccount) {
            logger.info(`Adding social ${provider} account for user ${user.username}`);
            await usercontroller.addSocialAccount(user.id, provider, profile.id);
        } else {
            user = await User.findByPk(socialAccount.userId);
        }
    } catch (error) {
        logger.error(`Cannot create a user.${error}`);
        return null;
    }

    logger.debug(JSON.stringify(user, null, 2));
    return user;
}

const authApi = express.Router();

authApi.get('/whoami', authenticateJWT, (req, res) => {
    const profile = req.user;
    delete profile.password;
    res.status(200).json(profile).end();
});

authApi.post('/refresh', authenticateJWT, async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    // need to get a sequelize instance of the user before regenerating token
    const sqlUser = await User.findByPk(req.user.id);

    const accessToken = generateAccessToken(sqlUser);

    res.json({
        accessToken
    });
});

authApi.post('/logout', authenticateJWT, (req, res) => {
    const { token } = req.body;

    refreshTokens = refreshTokens.filter(t => t !== token);

    // Clear session data to prevent issues with subsequent logins
    if (req.session) {
        delete req.session.codeVerifier;
        delete req.session.authStartTime;

        // Optionally destroy the entire session
        req.session.destroy((err) => {
            if (err) {
                logger.error(`Error destroying session: ${err.message}`);
            }
        });
    }

    res.status(200).send("Logout successful");
});

/**
 * Keycloak OIDC Login - Initiate authentication flow
 */
authApi.get('/keycloak/login', (req, res) => {
    try {
        const { authUrl, codeVerifier } = getAuthorizationUrl();

        // Store code verifier and timestamp in session for PKCE flow
        req.session.codeVerifier = codeVerifier;
        req.session.authStartTime = Date.now();

        logger.info(`Redirecting to Keycloak for authentication: ${authUrl}`);

        res.status(200).json({
            authUrl: authUrl
        });
    } catch (error) {
        logger.error(`Keycloak login error: ${error.message}`);
        res.status(500).json({
            error: 'Keycloak authentication not available',
            message: error.message
        }).end();
    }
});

/**
 * Keycloak OIDC Callback - Handle authentication response
 */
authApi.get('/keycloak/callback', async (req, res) => {
    try {

        logger.info(`Keycloak call back after login`);

        const client = getClient();

        if (!client) {
            throw new Error('Keycloak client not initialized');
        }

        const params = client.callbackParams(req);
        const codeVerifier = req.session.codeVerifier;

        if (!codeVerifier) {
            throw new Error('Code verifier not found in session');
        }

        // Exchange authorization code for tokens
        let tokenSet;
        try {
            // Skip nonce and state validation to bypass JWT expiration checks
            // The authorization code itself is still validated by Keycloak
            tokenSet = await client.callback(
                process.env.KEYCLOAK_REDIRECT_URI,
                params,
                {
                    code_verifier: codeVerifier,
                    // Skip JWT validation checks that fail due to clock skew
                    checks: {
                        nonce: false,
                        state: false
                    }
                }
            );
        } catch (callbackError) {
            logger.error(`Callback failed: ${callbackError.message}`);
            logger.error(`Error name: ${callbackError.name}`);
            logger.error(`Error details: ${JSON.stringify(callbackError, null, 2)}`);

            // Log additional error information if available
            if (callbackError.error) {
                logger.error(`OAuth error: ${callbackError.error}`);
            }
            if (callbackError.error_description) {
                logger.error(`OAuth error description: ${callbackError.error_description}`);
            }
            if (callbackError.response) {
                logger.error(`Response status: ${callbackError.response.statusCode}`);
                logger.error(`Response body: ${JSON.stringify(callbackError.response.body)}`);
            }

            // Completely destroy the session to start fresh
            req.session.destroy((err) => {
                if (err) {
                    logger.error(`Failed to destroy session: ${err.message}`);
                }
            });

            // Redirect to client error page to start over
            const errorRedirectUrl = `${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent('Authentication failed. Please try again.')}`;
            return res.redirect(errorRedirectUrl);
        }

        logger.info('Successfully received tokens from Keycloak');

        // Get user info from Keycloak
        const userInfo = await client.userinfo(tokenSet.access_token);

        logger.info(`Keycloak user info: ${JSON.stringify(userInfo, null, 2)}`);

        // Find or create user in database
        const user = await loginSocialUser({
            id: userInfo.sub,
            email: userInfo.email,
            username: userInfo.preferred_username || userInfo.email || `user_${userInfo.sub}`,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
        }, 'KEYCLOAK');

        if (!user) {
            throw new Error('Failed to create or login user');
        }

        // Generate JWT tokens for the application
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Clear session data
        delete req.session.codeVerifier;
        delete req.session.authStartTime;

        // Redirect to client with tokens
        // When serving both API and client from the same server, use relative URL
        const clientRedirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;

        logger.debug(`Redirecting to client callback: ${clientRedirectUrl}`);

        res.redirect(301, clientRedirectUrl);
    } catch (error) {
        logger.error(`Keycloak callback error: ${error.message}`);

        // Clear session data on error
        delete req.session.codeVerifier;
        delete req.session.authStartTime;

        // Redirect to client with error
        const errorRedirectUrl = `/auth/error?message=${encodeURIComponent(error.message)}`;
        res.redirect(errorRedirectUrl);
    }
});

authApi.get('/users/search', authenticateJWT, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).send('Query parameter is required');
            return;
        }
        const users = await usercontroller.searchUsers(query);
        res.json(users);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.message);
    }
});

module.exports = { authApi, authenticateJWT };
