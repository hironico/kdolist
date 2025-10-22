import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * ExternalRedirect component handles redirecting to external URLs
 * This is used for OAuth flows and other external authentication services
 */
export function ExternalRedirect() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const newTab = searchParams.get('newTab');

  useEffect(() => {
    if (url) {
      // Use replace to avoid adding to browser history
      if (newTab === 'true') {
        window.open(url, '_blank');
        window.history.back();
      } else {
        window.location.assign(url);
      }
    }
  }, [url]);

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
        Redirecting to {url}...
      </Typography>
    </Box>
  );
}
