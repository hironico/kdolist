import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { CheckCircle, CloudOff, Refresh } from '@mui/icons-material';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface AppInitializerProps {
  onReady: () => void;
}

type InitStep = 'checking-network' | 'updating-pwa' | 'ready' | 'offline';

export function AppInitializer({ onReady }: AppInitializerProps) {
  const [currentStep, setCurrentStep] = useState<InitStep>('checking-network');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Checking network connection...');
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Step 1: Check network connectivity
        setCurrentStep('checking-network');
        setStatusMessage('Checking network connection...');
        setProgress(10);

        const isOnline = await checkNetworkConnectivity();
        
        if (!isOnline) {
          setCurrentStep('offline');
          setStatusMessage('Running in offline mode');
          setProgress(100);
          // Still allow app to load in offline mode
          setTimeout(() => onReady(), 1500);
          return;
        }

        setProgress(40);
        setStatusMessage('Network connected');
        await sleep(300);

        // Step 2: Check for PWA updates
        setCurrentStep('updating-pwa');
        setStatusMessage('Checking for updates...');
        setProgress(60);

        if (needRefresh) {
          setStatusMessage('Installing updates...');
          setProgress(75);
          
          // Automatically update the service worker
          await updateServiceWorker(true);
          
          setStatusMessage('Update complete');
          setProgress(90);
          await sleep(300);
        } else {
          setStatusMessage('App is up to date');
          setProgress(90);
          await sleep(300);
        }

        // Step 3: Ready to launch
        setCurrentStep('ready');
        setStatusMessage('Starting application...');
        setProgress(100);
        
        // Small delay to show completion before transitioning
        await sleep(500);
        onReady();

      } catch (error) {
        console.error('Error during app initialization:', error);
        // Even if there's an error, we should still load the app
        setStatusMessage('Loading application...');
        setProgress(100);
        setTimeout(() => onReady(), 500);
      }
    };

    initializeApp();
  }, [needRefresh, updateServiceWorker, onReady]);

  const getStepIcon = () => {
    switch (currentStep) {
      case 'checking-network':
        return <CircularProgress size={60} thickness={4} />;
      case 'updating-pwa':
        return <Refresh sx={{ fontSize: 60, animation: 'spin 1s linear infinite' }} />;
      case 'offline':
        return <CloudOff sx={{ fontSize: 60, color: 'warning.main' }} />;
      case 'ready':
        return <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />;
      default:
        return <CircularProgress size={60} />;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 9999,
        gap: 3,
      }}
    >
      {/* Logo or app icon */}
      <Box
        component="img"
        src="/logo_kdolist-192.png"
        alt="KDoList"
        sx={{
          width: 120,
          height: 120,
          mb: 2,
        }}
      />

      {/* Status icon */}
      <Box sx={{ mb: 2 }}>
        {getStepIcon()}
      </Box>

      {/* Status message */}
      <Typography
        variant="h6"
        color="text.primary"
        sx={{
          textAlign: 'center',
          px: 3,
        }}
      >
        {statusMessage}
      </Typography>

      {/* Progress bar */}
      <Box sx={{ width: '80%', maxWidth: 400 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
          }}
        />
      </Box>

      {/* App name */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        KDoList
      </Typography>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}

// Helper function to check network connectivity
async function checkNetworkConnectivity(): Promise<boolean> {
  // First check navigator.onLine
  if (!navigator.onLine) {
    return false;
  }

  // Then try to make an actual request to verify
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('/favicon.svg', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // If fetch fails, we're likely offline or have network issues
    console.warn('Network check failed:', error);
    return false;
  }
}

// Helper function for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
