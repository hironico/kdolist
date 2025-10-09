import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginContext } from '@/LoginContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

/**
 * KeycloakCallback component handles the redirect from Keycloak after authentication.
 * It extracts the JWT token from URL parameters and stores it in the login context.
 */
export function KeycloakCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLoginInfo } = useContext(LoginContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        
        if (!token) {
          throw new Error('No authentication token received');
        }

        // Decode JWT to extract user profile (without verification - server already verified it)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        
        const payload = JSON.parse(jsonPayload);

        console.log(`Login callback with user: ${JSON.stringify(payload, null, 4)}`);

        // Update login context with user information
        setLoginInfo({
          id: payload.id || undefined,
          username: payload.username || undefined,
          firstname: payload.firstname || undefined,
          lastname: payload.lastname || undefined,
          email: payload.email || undefined,
          jwt: token,
          accessToken: refreshToken || undefined,
          accessTokenProvider: 'KEYCLOAK',
          profile: {
            id: payload.id || '',
            username: payload.username || '',
            firstname: payload.firstname || '',
            lastname: payload.lastname || '',
          },
        });

        // Store token in localStorage for persistence
        localStorage.setItem('jwt', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Redirect to main application
        navigate('/mylists');
      } catch (error) {
        console.error('Authentication callback error:', error);
        navigate('/auth/error', { 
          state: { 
            message: error instanceof Error ? error.message : 'Authentication failed' 
          } 
        });
      }
    };

    handleCallback();
  }, [searchParams, setLoginInfo, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing authentication...
      </Typography>
    </Box>
  );
}

/**
 * KeycloakError component displays authentication errors
 */
export function KeycloakError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An authentication error occurred';

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
      padding={3}
    >
      <Alert severity="error" sx={{ maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Failed
        </Typography>
        <Typography variant="body2">
          {errorMessage}
        </Typography>
      </Alert>
      <Typography 
        variant="body2" 
        color="primary" 
        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => navigate('/login')}
      >
        Return to login page
      </Typography>
    </Box>
  );
}
