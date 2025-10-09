# KDoList Deployment Guide

This guide explains how to deploy the KDoList application with Keycloak authentication.

## Deployment Scenarios

### Scenario 1: Development (Separate Servers)
- **Client**: Vite dev server on port 3000
- **Server**: Node.js Express on port 3001
- **Use case**: Local development with hot-reload

### Scenario 2: Production (Single Server)
- **Both**: Node.js Express on port 3001 serving built client + API
- **Use case**: Production deployment, easier to manage

## Production Deployment (Single Server)

This is the recommended approach for production. The Node.js server serves both the API and the built React application.

### Step 1: Build the Client

```bash
cd client
npm install
npm run build
```

This creates a `client/dist` directory with the production-ready React app.

### Step 2: Configure Server Environment

The server's `.env` file should point to the client build:

```env
# Server Configuration
SERVER_PORT=3001

# Web UI Configuration - Points to built client
WEBUI_HOME_DIR=../client/dist

# Keycloak Configuration
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/kdolist
KEYCLOAK_CLIENT_ID=kdolist-client
KEYCLOAK_CLIENT_SECRET=your-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3001/api/v1/auth/keycloak/callback

# Client URL - Same as server when serving from single server
CLIENT_URL=http://localhost:3001

# Other configuration...
AUTH_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Step 3: Start the Server

```bash
cd server
npm install
npm start
```

### Step 4: Access the Application

Open your browser to: `http://localhost:3001`

The server will:
- Serve API endpoints at `/api/*`
- Serve static React files for all other routes
- Handle React Router client-side routing via SPA fallback

## How It Works

### Server Configuration

The server (`server/src/index.js`) is configured to:

1. **Serve Static Files**: 
   ```javascript
   app.use(express.static(process.env.WEBUI_HOME_DIR));
   ```

2. **Handle API Routes**:
   ```javascript
   app.use('/api', require('./routes/api/'));
   ```

3. **SPA Fallback** (serves index.html for client routes):
   ```javascript
   app.get('*', (req, res) => {
     if (req.accepts('html')) {
       res.sendFile(`${process.env.WEBUI_HOME_DIR}/index.html`);
     }
   });
   ```

### Authentication Flow

1. User clicks "Keycloak SSO" button
2. Browser redirects to `/api/v1/auth/keycloak/login`
3. Server redirects to Keycloak
4. User authenticates
5. Keycloak redirects to `/api/v1/auth/keycloak/callback`
6. Server validates, creates JWT, redirects to `/auth/callback?token=...`
7. Express serves index.html (SPA fallback)
8. React Router handles `/auth/callback` route
9. React component extracts token and stores it

## Development Setup (Separate Servers)

For development with hot-reload:

### Terminal 1: Start Client Dev Server

```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2: Start Server

```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

### Development Configuration

Update `client/src/config/index.ts` to point to the server:

```typescript
const apiBaseUrl =
  url.hostname === 'localhost'
    ? `http://${url.hostname}:3001/api/v1`
    : `${url.protocol}//${url.hostname}/api/v1`;
```

Update `server/.env`:

```env
CLIENT_URL=http://localhost:3000
```

The server will redirect to `http://localhost:3000/auth/callback` after authentication.

## Keycloak Configuration

### Development Setup

1. **Issuer URL**: `http://localhost:8080/realms/kdolist`

2. **Client Redirect URIs**:
   - `http://localhost:3001/api/v1/auth/keycloak/callback` (server callback)
   - `http://localhost:3001/auth/callback` (React route - production)
   - `http://localhost:3000/auth/callback` (React route - development)

3. **Web Origins**: `*` (or specific origins for production)

### Production Setup

1. **Issuer URL**: `https://your-keycloak-domain.com/realms/kdolist`

2. **Client Redirect URIs**:
   - `https://your-domain.com/api/v1/auth/keycloak/callback`
   - `https://your-domain.com/auth/callback`

3. **Web Origins**: `https://your-domain.com`

## Production Checklist

### Security

- [ ] Enable HTTPS (`SERVER_SSL_ENABLED=true`)
- [ ] Use proper SSL certificates (not self-signed)
- [ ] Generate strong secrets for AUTH_SECRET and SESSION_SECRET
- [ ] Use confidential client in Keycloak
- [ ] Configure CORS to restrict origins
- [ ] Set secure session cookies
- [ ] Enable Keycloak SSL requirement
- [ ] Configure proper token lifespans

### Performance

- [ ] Build client in production mode (`npm run build`)
- [ ] Enable gzip compression on server
- [ ] Configure CDN for static assets (optional)
- [ ] Set up database connection pooling
- [ ] Configure proper logging levels

### Monitoring

- [ ] Set up application logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Monitor authentication success/failure rates
- [ ] Track API response times
- [ ] Monitor server resources

## Docker Deployment

### Dockerfile Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci --only=production
RUN cd client && npm ci

# Copy source code
COPY server ./server
COPY client ./client

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 3001

# Set working directory to server
WORKDIR /app/server

# Start server
CMD ["node", "src/index.js"]
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  kdolist:
    build: .
    ports:
      - "3001:3001"
    environment:
      - SERVER_PORT=3001
      - WEBUI_HOME_DIR=../client/dist
      - DB_HOSTNAME=postgres
      - KEYCLOAK_ISSUER_URL=http://keycloak:8080/realms/kdolist
      - KEYCLOAK_REDIRECT_URI=http://localhost:3001/api/v1/auth/keycloak/callback
      - CLIENT_URL=http://localhost:3001
    depends_on:
      - postgres
      - keycloak
    env_file:
      - .env

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=kdolist
      - POSTGRES_USER=dbuser
      - POSTGRES_PASSWORD=supersecret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  keycloak:
    image: quay.io/keycloak/keycloak:26.1.1
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    command: start-dev

volumes:
  postgres_data:
```

## Troubleshooting

### Client Routes Return 404

**Problem**: After authentication redirect, getting 404 error

**Solution**: Ensure the SPA fallback is configured in `server/src/index.js`:

```javascript
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(`${process.env.WEBUI_HOME_DIR}/index.html`);
  }
});
```

### Authentication Redirect Loops

**Problem**: Continuous redirects between server and client

**Solution**: 
1. Check `CLIENT_URL` matches where the client is served
2. Verify Keycloak redirect URIs are correct
3. Check browser console for errors

### Static Assets Not Loading

**Problem**: CSS, JS files returning 404

**Solution**:
1. Verify `WEBUI_HOME_DIR` points to correct build directory
2. Check that `client/dist` contains built files
3. Ensure `express.static` middleware is before SPA fallback

### CORS Errors

**Problem**: CORS errors when accessing API

**Solution**:
1. When serving from same origin, CORS shouldn't be an issue
2. If needed, update CORS configuration in `server/src/index.js`
3. Check Keycloak "Web origins" setting

## Environment Variables Reference

### Server Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERVER_PORT` | Yes | 3001 | Port for Express server |
| `WEBUI_HOME_DIR` | Yes | ../client/dist | Path to built React app |
| `KEYCLOAK_ISSUER_URL` | Yes | - | Keycloak realm URL |
| `KEYCLOAK_CLIENT_ID` | Yes | - | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | Conditional | - | Required for confidential clients |
| `KEYCLOAK_REDIRECT_URI` | Yes | - | Server callback URL |
| `CLIENT_URL` | No | http://localhost:3000 | Where to redirect after auth |
| `AUTH_SECRET` | Yes | - | JWT signing secret |
| `AUTH_REFRESH_SECRET` | Yes | - | Refresh token secret |
| `SESSION_SECRET` | Yes | - | Session encryption secret |

## Additional Resources

- [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)
- [Authentication Documentation](./KEYCLOAK_AUTHENTICATION.md)
- [Client Integration Guide](../../client/doc/AUTH_INTEGRATION.md)
