# Client-Side Keycloak Authentication Integration Guide

This guide explains how the Keycloak OIDC authentication is integrated into the KDoList React client application.

## Overview

The client application has been configured to work with Keycloak authentication through a server-side OIDC flow. When users click the "Keycloak SSO" button, they are redirected to the Keycloak server for authentication, and after successful login, they are redirected back with JWT tokens.

## Architecture

### Authentication Flow

1. **User Initiates Login**
   - User clicks "Keycloak SSO" button on login page
   - Client redirects to server endpoint: `GET /api/v1/auth/keycloak/login`

2. **Server Redirects to Keycloak**
   - Server generates PKCE code verifier and challenge
   - Server redirects user to Keycloak login page

3. **User Authenticates**
   - User enters credentials on Keycloak login page
   - Keycloak validates credentials

4. **Keycloak Callback**
   - Keycloak redirects to server: `GET /api/v1/auth/keycloak/callback?code=...`
   - Server exchanges code for tokens using PKCE
   - Server retrieves user profile from Keycloak
   - Server creates/updates user in database
   - Server generates application JWT token

5. **Client Receives Tokens**
   - Server redirects to client: `http://localhost:3000/auth/callback?token=...&refresh=...`
   - Client component extracts tokens from URL
   - Client stores tokens in context and localStorage
   - Client redirects to main application

## Components

### KeycloakCallback Component

Located at: `client/src/pages/KeycloakCallback/KeycloakCallback.tsx`

This component handles the authentication callback from the server:

```typescript
export function KeycloakCallback() {
  // 1. Extract tokens from URL parameters
  const token = searchParams.get('token');
  const refreshToken = searchParams.get('refresh');
  
  // 2. Decode JWT to get user profile
  const payload = JSON.parse(atob(token.split('.')[1]));
  
  // 3. Update LoginContext with user information
  setLoginInfo({
    id: payload.id,
    username: payload.username,
    email: payload.email,
    jwt: token,
    // ...
  });
  
  // 4. Store tokens in localStorage
  localStorage.setItem('jwt', token);
  
  // 5. Redirect to main application
  navigate('/');
}
```

### KeycloakError Component

Also in `KeycloakCallback.tsx`, this component displays authentication errors:

```typescript
export function KeycloakError() {
  const errorMessage = searchParams.get('message');
  
  return (
    <Alert severity="error">
      <Typography>Authentication Failed</Typography>
      <Typography>{errorMessage}</Typography>
    </Alert>
  );
}
```

### SignInCard Component

Located at: `client/src/components/SignInCard/SignInCard.tsx`

The Keycloak login button has been added:

```typescript
const handleKeycloakLogin = () => {
  // Redirect to server's Keycloak login endpoint
  window.location.href = `${apiBaseUrl}/auth/keycloak/login`;
};

<Button
  fullWidth
  variant="outlined"
  onClick={handleKeycloakLogin}
  startIcon={<KeyIcon />}
>
  <Typography>Keycloak SSO</Typography>
</Button>
```

## Routes Configuration

Routes have been added for the callback pages:

```typescript
// client/src/routes/types.ts
enum Pages {
  // ...
  KeycloakCallback,
  KeycloakError,
  // ...
}

// client/src/routes/index.ts
const routes: Routes = {
  // ...
  [Pages.KeycloakCallback]: {
    component: asyncComponentLoader(() => 
      import('@/pages/KeycloakCallback').then(m => ({ 
        default: m.KeycloakCallback 
      }))
    ),
    path: '/auth/callback',
    inSideBar: false,
  },
  [Pages.KeycloakError]: {
    component: asyncComponentLoader(() => 
      import('@/pages/KeycloakCallback').then(m => ({ 
        default: m.KeycloakError 
      }))
    ),
    path: '/auth/error',
    inSideBar: false,
  },
  // ...
};
```

## Token Management

### Storing Tokens

Tokens are stored in two places:

1. **LoginContext**: For application-wide access to authentication state
2. **localStorage**: For persistence across page reloads

```typescript
// In KeycloakCallback component
setLoginInfo({
  jwt: token,
  accessToken: refreshToken,
  // ... other user data
});

localStorage.setItem('jwt', token);
localStorage.setItem('refreshToken', refreshToken);
```

### Using Tokens

To make authenticated API requests, include the JWT token in the Authorization header:

```typescript
const response = await fetch(`${apiBaseUrl}/some-endpoint`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${loginInfo.jwt}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Verification

The existing `checkToken` function in `LoginContext` verifies the token:

```typescript
const checkToken = async () => {
  const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${loginInfo.jwt}`,
    },
  });

  if (!response.ok) {
    loginInfo.jwt = '';
    setLoginInfo(loginInfo);
  }

  return !response.ok;
};
```

## Configuration

### API Base URL

The client automatically configures the API base URL based on the environment:

```typescript
// client/src/config/index.ts
const url = new URL(window.location.href);
const apiBaseUrl =
  url.hostname === 'localhost'
    ? `http://${url.hostname}:2020/api/v1`
    : `${url.protocol}//${url.hostname}/api/v1`;
```

For development with default server port (3001), you may need to update this:

```typescript
const apiBaseUrl =
  url.hostname === 'localhost'
    ? `http://${url.hostname}:3001/api/v1`  // Updated port
    : `${url.protocol}//${url.hostname}/api/v1`;
```

## Testing the Integration

### 1. Start the Development Server

```bash
cd client
npm install
npm run dev
```

### 2. Test Login Flow

1. Navigate to `http://localhost:3000/login`
2. Click "Keycloak SSO" button
3. You should be redirected to Keycloak login page
4. Enter your credentials
5. After successful authentication, you should be redirected back to the application

### 3. Verify Token Storage

Open browser developer tools and check:

```javascript
// In Console
localStorage.getItem('jwt')
localStorage.getItem('refreshToken')

// Should show your JWT tokens
```

### 4. Test Protected Routes

Try accessing a protected route that requires authentication to verify the JWT token is working correctly.

## Troubleshooting

### Common Issues

1. **"No authentication token received"**
   - Check that server callback is properly configured
   - Verify server environment variables are set correctly
   - Check browser console for redirect URLs

2. **Redirect Loop**
   - Clear browser localStorage and cookies
   - Check that callback routes are properly configured
   - Verify server KEYCLOAK_REDIRECT_URI matches client callback path

3. **CORS Errors**
   - Verify server CORS configuration allows client origin
   - Check that Keycloak client has correct "Web origins" setting
   - Ensure cookies are not being blocked by browser

4. **Token Not Persisting**
   - Check that localStorage is enabled in browser
   - Verify LoginContext is properly wrapping the application
   - Check for any code clearing localStorage on page load

### Debug Mode

To debug the authentication flow:

1. **Enable Browser DevTools Network Tab**
   - Monitor redirect chain
   - Check request/response headers
   - Verify token presence in URLs

2. **Check Browser Console**
   - Look for JavaScript errors
   - Verify component rendering
   - Check token decoding

3. **Server Logs**
   - Check server logs for authentication flow
   - Verify Keycloak communication
   - Look for token generation errors

## Security Considerations

### Client-Side Security

1. **Token Storage**
   - Tokens are stored in localStorage (not sessionStorage)
   - Consider using httpOnly cookies for enhanced security in production

2. **Token Exposure**
   - JWT tokens are visible in URL parameters during callback
   - Consider implementing state parameter for CSRF protection
   - Clear tokens from URL history after extraction

3. **HTTPS**
   - Always use HTTPS in production
   - Set secure flag on cookies
   - Validate SSL certificates

### Best Practices

1. **Token Refresh**
   - Implement automatic token refresh before expiration
   - Use the refresh token endpoint: `POST /api/v1/auth/refresh`

2. **Logout**
   - Clear tokens from localStorage on logout
   - Call server logout endpoint to invalidate tokens
   - Redirect to login page

3. **Error Handling**
   - Properly handle authentication errors
   - Display user-friendly error messages
   - Provide retry mechanisms

## Additional Features

### Auto-Login on Page Load

To implement auto-login if a valid token exists:

```typescript
// In App.tsx or main component
useEffect(() => {
  const token = localStorage.getItem('jwt');
  if (token) {
    // Verify token is still valid
    checkToken().then(isValid => {
      if (isValid) {
        // Decode and set login info
        const payload = JSON.parse(atob(token.split('.')[1]));
        setLoginInfo({
          jwt: token,
          // ... decode and set user data
        });
      } else {
        // Token expired, clear storage
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
      }
    });
  }
}, []);
```

### Logout Implementation

```typescript
const handleLogout = async () => {
  try {
    // Call server logout endpoint
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginInfo.jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        token: localStorage.getItem('refreshToken') 
      })
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    
    // Clear context
    setLoginInfo(defaultLoginInfo);
    
    // Redirect to login
    navigate('/login');
  }
};
```

## Next Steps

1. **Implement Token Refresh**: Add automatic token refresh logic
2. **Add Error Boundaries**: Wrap authentication components in error boundaries
3. **Enhance UX**: Add loading states and better error messages
4. **Security Audit**: Review and enhance security measures for production
5. **Testing**: Add unit and integration tests for authentication flow

## Related Documentation

- Server Setup: `server/KEYCLOAK_SETUP.md`
- Server Configuration: `server/.env.keycloak.sample`
- Keycloak Documentation: https://www.keycloak.org/documentation
