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
import { UpdateNotifier } from '@/components/UpdateNotifier';
import { SwipeableListProvider } from '@/components/SwipeableListItem';

function App() {
  return (
    <>
      <LoginContextProvider>
        <SwipeableListProvider>
          <CssBaseline />
          <Notifications />
          <HotKeys />
          <UpdateNotifier />
          <BrowserRouter>
            <Header />
            <Sidebar />
            <Pages />
          </BrowserRouter>
        </SwipeableListProvider>
      </LoginContextProvider>
    </>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
