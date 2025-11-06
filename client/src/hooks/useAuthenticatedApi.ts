import { useContext, useCallback } from 'react';
import { LoginContext } from '@/LoginContext';
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete,
} from '@/utils/api';

/**
 * Custom hook that provides authenticated API methods with automatic token refresh
 * @returns Object with authenticated API methods
 */
export function useAuthenticatedApi() {
  const { loginInfo, setLoginInfo } = useContext(LoginContext);

  // Callback to update JWT when token is refreshed
  const handleTokenRefresh = useCallback(
    (newJwt: string) => {
      const updatedInfo = { ...loginInfo, jwt: newJwt };
      setLoginInfo(updatedInfo);
      console.log('Token refreshed and stored');
    },
    [loginInfo, setLoginInfo]
  );

  // Authenticated GET request
  const get = useCallback(
    async (url: string): Promise<Response> => {
      return authenticatedGet(
        url,
        loginInfo.jwt || '',
        loginInfo.accessToken,
        handleTokenRefresh
      );
    },
    [loginInfo.jwt, loginInfo.accessToken, handleTokenRefresh]
  );

  // Authenticated POST request
  const post = useCallback(
    async (url: string, body: any): Promise<Response> => {
      return authenticatedPost(
        url,
        body,
        loginInfo.jwt || '',
        loginInfo.accessToken,
        handleTokenRefresh
      );
    },
    [loginInfo.jwt, loginInfo.accessToken, handleTokenRefresh]
  );

  // Authenticated PUT request
  const put = useCallback(
    async (url: string, body: any): Promise<Response> => {
      return authenticatedPut(
        url,
        body,
        loginInfo.jwt || '',
        loginInfo.accessToken,
        handleTokenRefresh
      );
    },
    [loginInfo.jwt, loginInfo.accessToken, handleTokenRefresh]
  );

  // Authenticated DELETE request
  const del = useCallback(
    async (url: string): Promise<Response> => {
      return authenticatedDelete(
        url,
        loginInfo.jwt || '',
        loginInfo.accessToken,
        handleTokenRefresh
      );
    },
    [loginInfo.jwt, loginInfo.accessToken, handleTokenRefresh]
  );

  return {
    get,
    post,
    put,
    delete: del,
  };
}
