import { useContext } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import RestartIcon from '@mui/icons-material/RestartAlt';
import UpdateIcon from '@mui/icons-material/SystemUpdateAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { FullSizeCenteredFlexBox } from '@/components/styled';
import { email, messages } from '@/config';
import { LoginContext } from '@/LoginContext';
import resetApp from '@/utils/reset-app';

function AppErrorBoundaryFallback() {
  const { updateAvailable } = useContext(LoginContext);

  const handleUpdate = () => {
    // Reload to install the new service worker
    window.location.reload();
  };

  return (
    <Box height={400}>
      <FullSizeCenteredFlexBox>
        <Paper sx={{ p: 5 }}>
          <Typography variant="h5" component="h3">
            {messages.app.crash.title}
          </Typography>
          
          {/* Show update button if new version is available */}
          {updateAvailable && (
            <>
              <Button
                startIcon={<UpdateIcon />}
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                sx={{ mt: 3, mb: 2 }}
                fullWidth
              >
                Update to New Version
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A new version of the app is available. Updating may fix this issue.
              </Typography>
              <Typography component="h6" sx={{ my: 2 }}>or</Typography>
            </>
          )}

          <Button
            startIcon={<EmailIcon />}
            variant="outlined"
            target="_blank"
            rel="noreferrer"
            href={`mailto: ${email}`}
            sx={{ my: 2 }}
          >
            {messages.app.crash.options.email}
          </Button>
          <Typography component="h6">or</Typography>
          <Button startIcon={<RestartIcon />} sx={{ mt: 3 }} variant="outlined" onClick={resetApp}>
            {messages.app.crash.options.reset}
          </Button>
        </Paper>
      </FullSizeCenteredFlexBox>
    </Box>
  );
}

export default AppErrorBoundaryFallback;
