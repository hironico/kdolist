import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Badge from '@mui/material/Badge';
import { FlexBox } from '@/components/styled';
import useNotifications from '@/store/notifications';
import useSidebar from '@/store/sidebar';
import { getRandomJoke } from './utils';
import routes from '@/routes';
import { PathRouteProps, useLocation, useNavigate } from 'react-router-dom';
import { PathRouteCustomProps, Routes } from '@/routes/types';
import { ReactNode, useContext, useState } from 'react';
import { ChevronLeft, Notifications as NotificationsIcon } from '@mui/icons-material';
import { LoginContext } from '@/LoginContext';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { UpdateDialog } from '@/components/UpdateDialog';

function Header() {
  const [, sidebarActions] = useSidebar();
  const [, notificationsActions] = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const loginContext = useContext(LoginContext);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  function getRouteByPath(
    routes: Routes,
    path: string,
  ): (PathRouteProps & PathRouteCustomProps) | undefined {
    return Object.values(routes).find((route) => route.path === path);
  }

  const getTitle = (): string => {
    const route = getRouteByPath(routes, location.pathname);
    if (!route) return 'no route';

    const title = route.title ? route.title : loginContext.giftList?.name;
    return title ? title : 'no title';
  };

  function showNotification() {
    notificationsActions.push({
      options: {
        // Show fully customized notification
        // Usually, to show a notification, you'll use something like this:
        // notificationsActions.push({ message: ... })
        // `message` accepts string as well as ReactNode
        // If you want to show a fully customized notification, you can define
        // your own `variant`s, see @/sections/Notifications/Notifications.tsx
        variant: 'customNotification',
        autoHideDuration: 3000,
      },
      message: getRandomJoke(),
    });
  }

  /**
   * Before leaving the list contents page and return to mylists, clear the contents
   * opf the currently displayed list to avoid flicker effect with last loaded list when going
   * back to the content list page for a new list.
   */
  const goToMyLists = () => {
    navigate('/mylists');
  }

  const renderMenuIconButton = (): ReactNode => {
    return (
      <IconButton
        onClick={sidebarActions.toggle}
        size="large"
        edge="start"
        color="info"
        aria-label="menu"
        sx={{ mr: 1 }}
      >
        <MenuIcon />
      </IconButton>
    );
  };

  const renderBackNavigateIconButton = (): ReactNode => {
    const { state } = location;
    
    return (
      <IconButton
        onClick={() => goToMyLists()}
        size="large"
        edge="start"
        color="info"
        aria-label="backward"
        sx={{ mr: 1 }}
      >
        <ChevronLeft />
      </IconButton>
    );
  };

  const renderIconButton = (): ReactNode => {
    let home = false;
    switch (location.pathname) {
      case '/':
      case '/login':
      case '/mylists':
      case '/mygroupslists':
      case '/privacy':
        home = true;
        break;

      default:
        home = false;
        break;
    }
    return home ? renderMenuIconButton() : renderBackNavigateIconButton();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <FlexBox sx={{ alignItems: 'center' }}>
            {renderIconButton()}
            <Button size="large" onClick={showNotification}>
              {getTitle()}
            </Button>
          </FlexBox>

          <FlexBox sx={{ alignItems: 'center', gap: 1 }}>
            {/* Update notification bell */}
            {loginContext.updateAvailable && (
              <IconButton
                color="warning"
                onClick={() => setUpdateDialogOpen(true)}
                aria-label="mise à jour disponible"
              >
                <Badge badgeContent="!" color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            
            <IconButton>
              <UserAvatar />
            </IconButton>
          </FlexBox>
        </Toolbar>
      </AppBar>

      {/* Update dialog */}
      <UpdateDialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
      />
    </Box>
  );
}

export default Header;
