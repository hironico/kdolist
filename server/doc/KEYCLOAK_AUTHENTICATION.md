# Keycloak OIDC Authentication for KDoList

This document provides a complete guide for setting up and using Keycloak OIDC authentication in the KDoList application.

## Overview

The KDoList application now supports Keycloak authentication using the OpenID Connect (OIDC) protocol with PKCE (Proof Key for Code Exchange) for enhanced security. Users can log in using their Keycloak credentials, and the application will generate JWT tokens for subsequent API requests.

## Architecture

```
┌─────────────┐         ┌─────────────┐          ┌──────────────┐         ┌──────────┐
│   Client    │         │   Server    │          │   Keycloak   │         │ Database │
│  (React)    │         │  (Node.js)  │          │    Server    │         │(Postgres)│
└──────┬──────┘         └──────┬──────┘          └──────┬───────┘         └────┬─────┘
       │                       │                        │                      │
       │  1. Click Login       │                        │                      │
       ├──────────────────────>│                        │                      │
       │                       │                        │                      │
       │  2. Redirect to KC    │                        │                      │
       │<──────────────────────┤                        │                      │
       │                       │                        │                      │
       │  3. User Login        │                        │                      │
       ├───────────────────────┼───────────────────────>│                      │
       │                       │                        │                      │
       │  4. Auth Code         │                        │                      │
       │<──────────────────────┼────────────────────────┤                      │
       │                       │                        │                      │
       │  5. Redirect to Server│                        │                      │
       ├──────────────────────>│                        │                      │
       │                       │  6. Exchange Code      │                      │
       │                       ├───────────────────────>│                      │
       │                       │                        │                      │
       │                       │  7. Tokens             │                      │
       │                       │<───────────────────────┤                      │
       │                       │                        │                      │
       │                       │  8. Get User Info      │                      │
       │                       ├───────────────────────>│                      │
       │                       │                        │                      │
       │                       │  9. User Profile       │                      │
       │                       │<───────────────────────┤                      │
       │                       │                        │                      │
       │                       │ 10. Create/Update User │                      │
       │                       ├────────────────────────┼─────────────────────>│
       │                       │                        │                      │
       │                       │ 11. Generate JWT       │                      │
       │                       │                        │                      │
       │ 12. Redirect with JWT │                        │                      │
       │<──────────────────────┤                        │                      │
       │                       │                        │                      │
       │ 13. Store JWT         │                        │                      │
       │ & Redirect to App     │                        │                      │
       │                       │                        │                      │
```

## Features

- **OIDC Standard Flow**: Industry-standard authentication protocol
- **PKCE Support**: Enhanced security for public clients
- **JWT Tokens**: Stateless authentication for API requests
- **User Profile Sync**: Automatic user creation/update from Keycloak
- **Session Management**: Secure session handling with express-session
- **Automatic Integration**: Works alongside existing authentication methods (Google, Facebook, email/password)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Keycloak server (26.x or compatible)
- Access to Keycloak admin console

### 1. Set Up Keycloak

Follow the detailed guide in `server/KEYCLOAK_SETUP.md` to:
- Create a realm
- Create a client
- Configure redirect URIs
- Create test users

### 2. Configure Server

```bash
cd server

# Copy the sample environment file
cp .env.keycloak.sample .env

# Edit .env with your Keycloak configuration
# Minimum required variables:
# - KEYCLOAK_ISSUER_URL
# - KEYCLOAK_CLIENT_ID
# - KEYCLOAK_CLIENT_SECRET (if using confidential client)
# - KEYCLOAK_REDIRECT_URI
# - AUTH_SECRET
# - SESSION_SECRET

# Install dependencies (if not already installed)
# Important: Ensure openid-client is version 5.x
npm install openid-client@5
npm install

# Start the server
npm run dev
```

### 3. Configure Client

```bash
cd client

# Install dependencies (if not already installed)
npm install

# Update API base URL if needed (in src/config/index.ts)
# Default assumes server runs on port 2020
# Change to 3001 if using .env.keycloak.sample defaults

# Start the client
npm run dev
```

### 4. Test Authentication

1. Open browser to `http://localhost:3000/login`
2. Click "Keycloak SSO" button
3. Login with your Keycloak credentials
4. You should be redirected back to the application

## Implementation Details

### Server-Side Components

#### Keycloak Configuration Module
**File**: `server/src/config/keycloak.js`

Handles Keycloak client initialization and OIDC operations:
- Auto-discovers Keycloak endpoints
- Generates PKCE code verifier and challenge
- Manages client instance

#### Authentication Routes
**File**: `server/src/routes/api/auth.js`

New endpoints:
- `GET /api/v1/auth/keycloak/login` - Initiates OIDC flow
- `GET /api/v1/auth/keycloak/callback` - Handles Keycloak callback

#### Server Initialization
**File**: `server/src/index.js`

Updates:
- Session middleware configuration
- Keycloak client initialization on startup

### Client-Side Components

#### Callback Handler
**File**: `client/src/pages/KeycloakCallback/KeycloakCallback.tsx`

Two components:
- `KeycloakCallback` - Processes successful authentication
- `KeycloakError` - Displays authentication errors

#### Login Button
**File**: `client/src/components/SignInCard/SignInCard.tsx`

Added Keycloak SSO button with Key icon

#### Routing
**Files**: 
- `client/src/routes/types.ts`
- `client/src/routes/index.ts`

Added routes:
- `/auth/callback` - Authentication callback
- `/auth/error` - Error display

## Environment Variables

### Server Configuration

```env
# Keycloak OIDC Configuration
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/kdolist
KEYCLOAK_CLIENT_ID=kdolist-client
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3001/api/v1/auth/keycloak/callback

# JWT Configuration
AUTH_SECRET=your-jwt-secret
AUTH_REFRESH_SECRET=your-refresh-secret
AUTH_TOKEN_EXPIRATION_TIME=1h

# Session Configuration
SESSION_SECRET=your-session-secret

# Client Configuration
CLIENT_URL=http://localhost:3000

# Server Configuration
SERVER_PORT=3001
```

See `server/.env.keycloak.sample` for complete configuration options.

## API Endpoints

### Authentication Endpoints

#### Initiate Keycloak Login
```
GET /api/v1/auth/keycloak/login
```

Redirects user to Keycloak for authentication.

**Response**: HTTP 302 Redirect to Keycloak

---

#### Keycloak Callback
```
GET /api/v1/auth/keycloak/callback?code={auth_code}&state={state}
```

Handles callback from Keycloak, exchanges authorization code for tokens.

**Response**: HTTP 302 Redirect to client with JWT tokens

Success: `http://localhost:3000/auth/callback?token={jwt}&refresh={refresh_token}`
Error: `http://localhost:3000/auth/error?message={error_message}`

---

#### Verify Token
```
GET /api/v1/auth/whoami
Headers:
  Authorization: Bearer {jwt_token}
```

Verifies JWT token and returns user profile.

**Response**: 
```json
{
  "id": "user-id",
  "username": "username",
  "email": "user@example.com",
  "firstname": "First",
  "lastname": "Last"
}
```

---

#### Refresh Token
```
POST /api/v1/auth/refresh
Headers:
  Authorization: Bearer {jwt_token}
Body:
{
  "token": "refresh_token"
}
```

Refreshes JWT token.

**Response**:
```json
{
  "accessToken": "new_jwt_token"
}
```

---

#### Logout
```
POST /api/v1/auth/logout
Headers:
  Authorization: Bearer {jwt_token}
Body:
{
  "token": "refresh_token"
}
```

Invalidates refresh token.

**Response**: `200 OK`

## Security Considerations

### Production Deployment Checklist

- [ ] Use HTTPS for all communications
- [ ] Generate strong, unique secrets for JWT and sessions
- [ ] Configure CORS to restrict origins
- [ ] Use confidential client in Keycloak
- [ ] Enable SSL in Keycloak realm settings
- [ ] Set appropriate token lifespans
- [ ] Implement rate limiting on authentication endpoints
- [ ] Enable Keycloak brute force detection
- [ ] Use httpOnly cookies for token storage (consider migration from localStorage)
- [ ] Implement CSRF protection
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Token Security

- Tokens are currently passed via URL parameters (consider alternatives for production)
- localStorage is used for token persistence (consider httpOnly cookies)
- Implement token rotation strategy
- Monitor for token leakage

## Troubleshooting

### Server Issues

**Problem**: "Keycloak client not initialized"
- Check `KEYCLOAK_ISSUER_URL` is correct
- Verify Keycloak server is running and accessible
- Check server logs for initialization errors

**Problem**: "Invalid redirect URI"
- Ensure Keycloak client redirect URIs match `KEYCLOAK_REDIRECT_URI`
- Check for trailing slashes
- Verify protocol (http vs https)

### Client Issues

**Problem**: "No authentication token received"
- Check server callback is working
- Verify server environment variables
- Check browser console for errors

**Problem**: CORS errors
- Add client URL to Keycloak "Web origins"
- Verify server CORS configuration
- Check browser console for specific origin

### Database Issues

**Problem**: User creation fails
- Ensure `SocialAccount` table exists
- Verify database supports `KEYCLOAK` provider
- Check database connection
- Review server logs for SQL errors

## Testing

### Manual Testing

1. **Login Flow**
   - Click Keycloak SSO button
   - Verify redirect to Keycloak
   - Enter credentials
   - Verify redirect back to app
   - Check localStorage for tokens

2. **Token Verification**
   - Make authenticated API request
   - Verify token in Authorization header
   - Check `/api/v1/auth/whoami` response

3. **Token Refresh**
   - Wait for token to expire
   - Attempt token refresh
   - Verify new token works

4. **Logout**
   - Perform logout
   - Verify tokens are cleared
   - Attempt to access protected resource
   - Should be redirected to login

### Automated Testing

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## Migration Guide

### Migrating Existing Users

If you have existing users who want to use Keycloak:

1. Users must create Keycloak account with same email
2. First Keycloak login will fail (email already exists)
3. Consider implementing account linking feature
4. Or manual migration process

### From Other Authentication Methods

Users can continue using existing methods (Google, Facebook, email/password) alongside Keycloak. The system maintains separate social account records per provider.

## Performance Considerations

- Session storage: Consider Redis for production
- Token caching: Implement token caching to reduce database queries
- Connection pooling: Enable for database connections
- Rate limiting: Implement on authentication endpoints

## Monitoring

### Metrics to Track

- Authentication success/failure rates
- Token refresh frequency
- Session duration
- API request latency
- Error rates by type

### Logging

Enable detailed logging for:
- Authentication attempts
- Token generation/validation
- User profile sync
- Keycloak communication errors

## Additional Resources

### Documentation

- [Server Setup Guide](server/KEYCLOAK_SETUP.md)
- [Client Integration Guide](client/AUTH_INTEGRATION.md)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect Spec](https://openid.net/connect/)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)

### Dependencies

**Server**:
- `openid-client@5.x` - OpenID Connect client (v5.x for CommonJS support, NOT v6.x)
- `jsonwebtoken` - JWT generation/verification
- `express-session` - Session management

**Client**:
- `react-router-dom` - Routing
- `@mui/material` - UI components

## Support

For issues and questions:
- Check troubleshooting sections in documentation
- Review server logs for error details
- Check Keycloak server logs
- Verify all configuration settings

## License

MIT License - See LICENSE file for details
