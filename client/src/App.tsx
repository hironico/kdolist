import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import Pages from '@/routes/Pages';
import Header from '@/sections/Header';
import HotKeys from '@/sections/HotKeys';
import Notifications from '@/sections/Notifications';
import Sidebar from '@/sections/Sidebar';
import { LoginContextProvider } from './LoginContext';
import { AppInitializer } from '@/components/AppInitializer';

function App() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return (
      <>
        <CssBaseline />
        <AppInitializer onReady={() => setIsReady(true)} />
      </>
    );
  }

  return (
    <>
      <LoginContextProvider>
        <CssBaseline />
        <Notifications />
        <HotKeys />
        <BrowserRouter>
          <Header />
          <Sidebar />
          <Pages />
        </BrowserRouter>
      </LoginContextProvider>
    </>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
