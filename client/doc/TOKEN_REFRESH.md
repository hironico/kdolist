# JWT Token Refresh Implementation

This document explains how JWT token refresh is implemented in the kdolist application and how to use it in your components.

## Overview

The application now automatically refreshes JWT tokens when they expire, preventing users from losing their work or being forced to re-login when their token expires during long sessions.

## Architecture

### 1. Server-side (`server/src/routes/api/auth.js`)
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Purpose**: Exchanges a refresh token for a new JWT access token
- **Authentication**: Requires current JWT (even if expired) + refresh token in body

### 2. Client-side

#### Token Refresh Utility (`client/src/utils/api.ts`)
Provides low-level functions for authenticated API calls with automatic retry:

```typescript
import { fetchWithTokenRefresh, authenticatedPost } from '@/utils/api';

// Automatically retries with refreshed token on 401/403
const response = await fetchWithTokenRefresh(
  url,
  options,
  jwt,
  refreshToken,
  (newJwt) => {
    // Callback when token is refreshed
    updateStoredJwt(newJwt);
  }
);
```

#### Login Context (`client/src/LoginContext.tsx`)
Provides the `refreshToken()` method:

```typescript
const { refreshToken } = useContext(LoginContext);

// Manually refresh token
const success = await refreshToken();
if (success) {
  console.log('Token refreshed!');
}
```

#### Custom Hook (`client/src/hooks/useAuthenticatedApi.ts`)
**Recommended approach** - Provides ready-to-use authenticated methods:

```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

function MyComponent() {
  const api = useAuthenticatedApi();
  
  // All methods automatically refresh token on 401/403
  const response = await api.get('/api/v1/giftlist');
  const response = await api.post('/api/v1/gift', giftData);
  const response = await api.put('/api/v1/gift/123', updateData);
  const response = await api.delete('/api/v1/gift/123');
}
```

## How It Works

### Token Refresh Flow

```
1. User makes API call (e.g., save gift list)
   ↓
2. API returns 401 Unauthorized (token expired)
   ↓
3. System automatically calls /auth/refresh
   ↓
4. New JWT token received
   ↓
5. New token stored in context & localStorage
   ↓
6. Original API call retried with new token
   ↓
7. Success! User doesn't notice anything
```

### What Happens on Failure?

If token refresh fails (e.g., refresh token also expired):
1. Auth is cleared from localStorage
2. User is redirected to login page
3. After login, user returns to where they were (if applicable)

## Usage Examples

### Example 1: Saving a Gift List

**Before (manual error handling):**
```typescript
const handleSaveList = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/giftlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(listData),
    });
    
    if (response.status === 401) {
      // Token expired - user has to re-login
      navigate('/login');
      return;
    }
    
    if (response.ok) {
      // Success
    }
  } catch (error) {
    console.error(error);
  }
};
```

**After (automatic refresh):**
```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const handleSaveList = async () => {
  const api = useAuthenticatedApi();
  
  try {
    const response = await api.post(`${apiBaseUrl}/giftlist`, listData);
    
    if (response.ok) {
      // Success - token was auto-refreshed if needed
    } else {
      // Handle other errors (400, 500, etc.)
    }
  } catch (error) {
    console.error(error);
  }
};
```

### Example 2: Fetching Gift Lists

**Before:**
```typescript
useEffect(() => {
  const fetchLists = async () => {
    const response = await fetch(`${apiBaseUrl}/giftlist`, {
      headers: {
        Authorization: `Bearer ${loginInfo.jwt}`,
      },
    });
    
    if (response.status === 401) {
      setLoginInfo({ ...loginInfo, jwt: '' });
      return;
    }
    
    const lists = await response.json();
    setGiftLists(lists);
  };
  
  fetchLists();
}, []);
```

**After:**
```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

useEffect(() => {
  const fetchLists = async () => {
    const api = useAuthenticatedApi();
    const response = await api.get(`${apiBaseUrl}/giftlist`);
    
    if (response.ok) {
      const lists = await response.json();
      setGiftLists(lists);
    }
    // Token automatically refreshed if expired
  };
  
  fetchLists();
}, []);
```

### Example 3: Deleting a Gift

```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const handleDeleteGift = async (giftId: string) => {
  const api = useAuthenticatedApi();
  
  const response = await api.delete(`${apiBaseUrl}/gift/${giftId}`);
  
  if (response.ok) {
    console.log('Gift deleted successfully');
    // Refresh list...
  }
  // Token auto-refreshed if needed
};
```

### Example 4: Updating a Gift

```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const handleUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
  const api = useAuthenticatedApi();
  
  const response = await api.put(
    `${apiBaseUrl}/gift/${giftId}`,
    updates
  );
  
  if (response.ok) {
    const updatedGift = await response.json();
    console.log('Gift updated:', updatedGift);
  }
};
```

## Migration Guide

### Step 1: Import the Hook
```typescript
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
```

### Step 2: Get API Methods
```typescript
function MyComponent() {
  const api = useAuthenticatedApi();
  // Now use api.get, api.post, api.put, api.delete
}
```

### Step 3: Replace fetch() Calls

**Pattern to Replace:**
```typescript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify(data),
})
```

**Replace With:**
```typescript
api.post(url, data)
```

### Step 4: Remove Manual 401 Handling
You can remove code like:
```typescript
if (response.status === 401) {
  navigate('/login');
  return;
}
```

The system handles this automatically now.

## Token Storage

### Where Tokens Are Stored

1. **JWT (Access Token)**
   - Stored in: `LoginContext` state
   - Persisted in: `localStorage` as part of `kdolist_auth`
   - Used for: API authentication
   - Expires: Short-lived (configured on server)

2. **Refresh Token**
   - Stored in: `LoginContext.loginInfo.accessToken`
   - Persisted in: `localStorage` as part of `kdolist_auth`
   - Used for: Getting new JWT when expired
   - Expires: Long-lived

### localStorage Structure

```javascript
{
  "kdolist_auth": {
    "id": "user-id",
    "username": "john",
    "email": "john@example.com",
    "jwt": "eyJhbGci...",           // Access token (short-lived)
    "accessToken": "refresh_token", // Refresh token (long-lived)
    "accessTokenProvider": "KEYCLOAK",
    "profile": { ... }
  }
}
```

## Best Practices

### ✅ DO:
- Use `useAuthenticatedApi()` hook for all authenticated requests
- Let the system handle token refresh automatically
- Trust that 401 errors are handled for you

### ❌ DON'T:
- Manually check for 401 and redirect to login
- Store JWT separately from login context
- Mix raw `fetch()` with authenticated calls

## Testing Token Refresh

### Method 1: Expire the Token Manually
```javascript
// In browser console
const auth = JSON.parse(localStorage.getItem('kdolist_auth'));
auth.jwt = 'expired.token.here';
localStorage.setItem('kdolist_auth', JSON.stringify(auth));

// Now try to save something - should auto-refresh
```

### Method 2: Wait for Natural Expiration
Configure short expiration on server (development only):
```javascript
// server/.env
AUTH_TOKEN_EXPIRATION_TIME=60s  // 1 minute
```

### Method 3: Mock the Refresh Call
```typescript
// In test file
jest.mock('@/utils/api', () => ({
  authenticatedPost: jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 401 })  // First call fails
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }), // Second succeeds
}));
```

## Troubleshooting

### Issue: Token refresh fails repeatedly
**Cause**: Refresh token might be expired or invalid
**Solution**: User needs to re-login
**What happens**: System redirects to /login automatically

### Issue: 401 error but refresh doesn't trigger
**Cause**: Missing refresh token
**Check**: `loginInfo.accessToken` should exist
**Solution**: Ensure KeycloakCallback stores refresh token

### Issue: Token refreshes but API call still fails
**Cause**: API endpoint might require additional permissions
**Check**: Server logs for authorization errors
**Solution**: Verify user has correct permissions

## API Reference

### useAuthenticatedApi()

Returns an object with authenticated HTTP methods:

```typescript
const api = useAuthenticatedApi();

// All methods return Promise<Response>
api.get(url: string): Promise<Response>
api.post(url: string, body: any): Promise<Response>
api.put(url: string, body: any): Promise<Response>
api.delete(url: string): Promise<Response>
```

### refreshToken()

Manual token refresh (rarely needed):

```typescript
const { refreshToken } = useContext(LoginContext);

const success = await refreshToken();
// Returns: boolean (true if refresh succeeded)
```

## Security Considerations

1. **Tokens are stored in localStorage**
   - Acceptable for PWA applications
   - Protected by same-origin policy
   - Cleared on logout

2. **Refresh tokens are long-lived**
   - Server should rotate refresh tokens
   - Consider implementing token revocation
   - Monitor for suspicious activity

3. **HTTPS Required**
   - Always use HTTPS in production
   - Tokens transmitted in Authorization header
   - Prevents man-in-the-middle attacks

## Summary

The JWT refresh implementation provides:
- ✅ Seamless user experience (no forced re-login)
- ✅ Automatic token refresh on expiration
- ✅ Simple API with `useAuthenticatedApi()` hook
- ✅ Fallback to login if refresh fails
- ✅ Persisted tokens across sessions

Start using it today by replacing your `fetch()` calls with `useAuthenticatedApi()` methods!
