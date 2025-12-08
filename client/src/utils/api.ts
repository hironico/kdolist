import { apiBaseUrl } from '@/config';

interface RefreshResponse {
  accessToken: string;
}

/**
 * Refreshes the JWT access token using the refresh token
 * @param refreshToken The refresh token
 * @param currentJwt The current JWT (required for authentication)
 * @returns New access token or null if refresh failed
 */
export async function refreshAccessToken(
  refreshToken: string,
  currentJwt: string
): Promise<string | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentJwt}`,
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }

    const data: RefreshResponse = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Makes an authenticated API request with automatic token refresh on 401
 * @param url The API endpoint URL
 * @param options Fetch options
 * @param jwt Current JWT token
 * @param refreshToken Refresh token for getting new JWT
 * @param onTokenRefresh Callback when token is refreshed
 * @returns Fetch response
 */
export async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${jwt}`,
  };

  // First attempt with current token
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401/403 and we have a refresh token, try to refresh
  if ((response.status === 401 || response.status === 403) && refreshToken) {
    console.log('Token expired, attempting refresh...');

    const newJwt = await refreshAccessToken(refreshToken, jwt);

    if (newJwt) {
      console.log('Token refreshed successfully, retrying request');

      // Update the stored token
      if (onTokenRefresh) {
        onTokenRefresh(newJwt);
      }

      // Retry the original request with new token
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newJwt}`,
      };

      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      console.error('Token refresh failed, user needs to re-login');
    }
  }

  return response;
}

/**
 * Helper for making authenticated GET requests with auto-refresh
 */
export async function authenticatedGet(
  url: string,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  return fetchWithTokenRefresh(
    url,
    { method: 'GET' },
    jwt,
    refreshToken,
    onTokenRefresh
  );
}

/**
 * Helper for making authenticated POST requests with auto-refresh
 */
export async function authenticatedPost(
  url: string,
  body: any,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  return fetchWithTokenRefresh(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    jwt,
    refreshToken,
    onTokenRefresh
  );
}

/**
 * Helper for making authenticated PUT requests with auto-refresh
 */
export async function authenticatedPut(
  url: string,
  body: any,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  return fetchWithTokenRefresh(
    url,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    jwt,
    refreshToken,
    onTokenRefresh
  );
}

/**
 * Helper for making authenticated PATCH requests with auto-refresh
 */
export async function authenticatedPatch(
  url: string,
  body: any,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  return fetchWithTokenRefresh(
    url,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    jwt,
    refreshToken,
    onTokenRefresh
  );
}

/**
 * Helper for making authenticated DELETE requests with auto-refresh
 */
export async function authenticatedDelete(
  url: string,
  jwt: string,
  refreshToken: string | undefined,
  onTokenRefresh?: (newJwt: string) => void
): Promise<Response> {
  return fetchWithTokenRefresh(
    url,
    { method: 'DELETE' },
    jwt,
    refreshToken,
    onTokenRefresh
  );
}
