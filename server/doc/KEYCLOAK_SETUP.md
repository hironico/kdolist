# Keycloak OIDC Authentication Setup Guide

This guide explains how to set up Keycloak authentication for the KDoList application.

## Prerequisites

- Keycloak server running (version 26.x or compatible)
- Access to Keycloak admin console
- Node.js and npm installed
- PostgreSQL database configured

## Keycloak Configuration

### 1. Create a Realm

1. Log in to Keycloak admin console (typically at `http://localhost:8080`)
2. Create a new realm or use an existing one (e.g., `kdolist`)
3. Note the realm name for your configuration

### 2. Create a Client

1. Navigate to **Clients** in your realm
2. Click **Create client**
3. Configure the client:
   - **Client type**: OpenID Connect
   - **Client ID**: `kdolist-client` (or your preferred ID)
   - Click **Next**

4. Configure **Capability config**:
   - **Client authentication**: ON (for confidential client) or OFF (for public client)
   - **Authorization**: OFF
   - **Authentication flow**: 
     - ✓ Standard flow
     - ✓ Direct access grants
   - Click **Next**

5. Configure **Login settings**:
   - **Root URL**: `http://localhost:3000` (your client app URL)
   - **Home URL**: `http://localhost:3000`
   - **Valid redirect URIs**: 
     - `http://localhost:3001/api/v1/auth/keycloak/callback`
     - `http://localhost:3000/auth/callback`
   - **Valid post logout redirect URIs**: `http://localhost:3000`
   - **Web origins**: `*` (or specific origins for production)
   - Click **Save**

6. If you chose **Client authentication: ON**, go to the **Credentials** tab:
   - Copy the **Client secret** for your `.env` file

### 3. Configure Client Scopes (Optional)

1. Navigate to **Client scopes**
2. Ensure the following scopes are available:
   - `openid` (required)
   - `email` (recommended)
   - `profile` (recommended)

### 4. Create Test Users

1. Navigate to **Users**
2. Click **Add user**
3. Fill in user details:
   - **Username**: test-user
   - **Email**: test@example.com
   - **Email verified**: ON
   - **First name**: Test
   - **Last name**: User
4. Click **Create**
5. Go to **Credentials** tab:
   - Click **Set password**
   - Enter a password
   - Set **Temporary**: OFF
   - Click **Save**

## Server Configuration

### 1. Install Dependencies

**Important**: This integration requires `openid-client@5.x` (not v6.x) because the project uses CommonJS. Version 6.x is ESM-only and won't work with `require()`.

```bash
cd server

# If you need to install/fix the openid-client version:
npm install openid-client@5

# Then install all dependencies:
npm install
```

### 2. Configure Environment Variables

Copy the sample environment file:
```bash
cp .env.keycloak.sample .env
```

Edit `.env` and configure the following variables:

```env
# Keycloak Configuration
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/kdolist
KEYCLOAK_CLIENT_ID=kdolist-client
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-keycloak
KEYCLOAK_REDIRECT_URI=http://localhost:3001/api/v1/auth/keycloak/callback

# JWT Configuration
AUTH_SECRET=your-jwt-secret-key
AUTH_REFRESH_SECRET=your-refresh-secret-key
AUTH_TOKEN_EXPIRATION_TIME=1h

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Client URL
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

Ensure your database is configured and the `SocialAccount` table supports the `KEYCLOAK` provider.

## Authentication Flow

### Server-Side Flow

1. **Login Initiation**: User visits `/api/v1/auth/keycloak/login`
   - Server generates PKCE code verifier and challenge
   - Stores code verifier in session
   - Redirects to Keycloak authorization endpoint

2. **User Authentication**: User authenticates with Keycloak
   - Keycloak validates credentials
   - Redirects back to callback URL with authorization code

3. **Callback Processing**: Server receives callback at `/api/v1/auth/keycloak/callback`
   - Exchanges authorization code for tokens using PKCE
   - Retrieves user info from Keycloak
   - Creates or finds user in local database
   - Generates application JWT tokens
   - Redirects to client with tokens

4. **Client Token Storage**: Client receives tokens and stores them
   - Uses JWT for subsequent API requests
   - Includes token in Authorization header: `Bearer <token>`

### API Endpoints

- **GET** `/api/v1/auth/keycloak/login` - Initiate Keycloak login
- **GET** `/api/v1/auth/keycloak/callback` - Handle Keycloak callback
- **GET** `/api/v1/auth/whoami` - Verify JWT token (requires Authorization header)
- **POST** `/api/v1/auth/refresh` - Refresh JWT token
- **POST** `/api/v1/auth/logout` - Logout and invalidate refresh token

## Testing the Integration

### 1. Start Keycloak

```bash
# If using Docker
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.1.1 start-dev
```

### 2. Start the Server

```bash
cd server
npm run dev
```

### 3. Test Authentication Flow

#### Option 1: Using Browser
1. Navigate to `http://localhost:3001/api/v1/auth/keycloak/login`
2. You should be redirected to Keycloak login page
3. Enter your test user credentials
4. After successful authentication, you'll be redirected to the client with tokens

#### Option 2: Using curl
```bash
# This will show the redirect URL
curl -v http://localhost:3001/api/v1/auth/keycloak/login
```

### 4. Verify JWT Token

After receiving the token from the callback:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/auth/whoami
```

## Security Considerations

### Production Deployment

1. **Use HTTPS**: Always use HTTPS in production
   ```env
   SERVER_SSL_ENABLED=true
   SERVER_SSL_KEY_FILE=/path/to/private.key
   SERVER_SSL_CERT_FILE=/path/to/certificate.crt
   ```

2. **Secure Secrets**: Use strong, randomly generated secrets
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Configure CORS**: Restrict CORS to specific origins in production
   - Update `corsOptions` in `server/src/index.js`

4. **Session Configuration**: Use secure session settings
   ```javascript
   cookie: {
     secure: true,        // Only send over HTTPS
     httpOnly: true,      // Not accessible via JavaScript
     sameSite: 'strict',  // CSRF protection
     maxAge: 1800000      // 30 minutes
   }
   ```

5. **Keycloak Best Practices**:
   - Use client authentication (confidential client) in production
   - Enable SSL required in realm settings
   - Configure appropriate token lifespans
   - Implement proper role-based access control
   - Enable brute force detection

## Troubleshooting

### Common Issues

1. **"Keycloak client not initialized"**
   - Check KEYCLOAK_ISSUER_URL is correct
   - Verify Keycloak server is running
   - Check server logs for initialization errors

2. **"Invalid redirect URI"**
   - Ensure redirect URI in Keycloak client matches KEYCLOAK_REDIRECT_URI
   - Check for trailing slashes or protocol mismatches

3. **"Code verifier not found in session"**
   - Verify session middleware is configured
   - Check SESSION_SECRET is set
   - Ensure cookies are enabled in browser

4. **CORS errors**
   - Add client URL to Keycloak client's "Web origins"
   - Update server CORS configuration

### Debug Mode

Enable detailed logging:
```javascript
// In server/src/config/keycloak.js
logger.level = 'debug';
```

## Client Integration

See `client/AUTH_INTEGRATION.md` for instructions on integrating the authentication flow in your React client application.

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect Specification](https://openid.net/connect/)
- [PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
