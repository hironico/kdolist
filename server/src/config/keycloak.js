const { Issuer, generators } = require('openid-client');
const logger = require('../logger');

let keycloakClient = null;
let codeVerifier = null;

/**
 * Initialize Keycloak OIDC client
 */
async function initKeycloakClient() {
    try {
        const keycloakIssuerUrl = process.env.KEYCLOAK_ISSUER_URL;
        
        if (!keycloakIssuerUrl) {
            logger.warn('KEYCLOAK_ISSUER_URL not configured. Keycloak authentication will not be available.');
            return null;
        }

        logger.info(`Discovering Keycloak configuration from: ${keycloakIssuerUrl}`);
        
        const keycloakIssuer = await Issuer.discover(keycloakIssuerUrl);
        
        logger.info(`Discovered issuer: ${keycloakIssuer.issuer}`);
        
        keycloakClient = new keycloakIssuer.Client({
            client_id: process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
            redirect_uris: [process.env.KEYCLOAK_REDIRECT_URI],
            response_types: ['code'],
        });

        logger.info('Keycloak OIDC client initialized successfully');
        return keycloakClient;
    } catch (error) {
        logger.error(`Failed to initialize Keycloak client: ${error.message}`);
        logger.error('Stack trace:', error.stack);
        throw error;
    }
}

/**
 * Get the authorization URL for Keycloak login
 */
function getAuthorizationUrl() {
    if (!keycloakClient) {
        throw new Error('Keycloak client not initialized');
    }

    codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const authUrl = keycloakClient.authorizationUrl({
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    });

    return { authUrl, codeVerifier };
}

/**
 * Get the Keycloak client instance
 */
function getClient() {
    return keycloakClient;
}

/**
 * Get the stored code verifier
 */
function getCodeVerifier() {
    return codeVerifier;
}

/**
 * Store code verifier for a session
 */
function setCodeVerifier(verifier) {
    codeVerifier = verifier;
}

module.exports = {
    initKeycloakClient,
    getAuthorizationUrl,
    getClient,
    getCodeVerifier,
    setCodeVerifier
};
