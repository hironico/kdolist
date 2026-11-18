import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import Badge from '@mui/material/Badge';
import { Toolbar as IosToolbar } from '@ios27_design_system/react';
import useNotifications from '@/store/notifications';
import useSidebar from '@/store/sidebar';
import { getRandomJoke } from './utils';
import routes from '@/routes';
import { PathRouteProps, useLocation, useNavigate } from 'react-router-dom';
import { PathRouteCustomProps, Routes } from '@/routes/types';
import React, { ReactNode, useContext, useState } from 'react';
import { ArrowBackIosNew, Notifications as NotificationsIcon } from '@mui/icons-material';
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
        color="primary"
        aria-label="menu"
      >
        <MenuIcon />
      </IconButton>
    );
  };

  // iOS back button: chevron + previous screen title, in the accent colour.
  const renderBackNavigateIconButton = (): ReactNode => {
    return (
      <ButtonBase
        onClick={() => goToMyLists()}
        aria-label="retour aux listes"
        sx={{
          color: 'primary.main',
          typography: 'body1',
          gap: 0.25,
          px: 0.5,
          py: 1,
          borderRadius: 2,
          '&:active': { opacity: 0.5 },
        }}
      >
        <ArrowBackIosNew fontSize="small" />
        Listes
      </ButtonBase>
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

  // Tapping the title shows a random joke (easter egg kept from the MUI header).
  const handleToolbarClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('.ios27-toolbar-title')) {
      showNotification();
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* iOS 27 navigation bar (@ios27_design_system/react Toolbar) on the
          uniform toolbar material, edge to edge. */}
      <IosToolbar
        className="kdo-toolbar ios27-toolbar-uniform"
        title={getTitle()}
        onClick={handleToolbarClick}
        leading={renderIconButton()}
        trailing={
          <>
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

            <IconButton aria-label="profil">
              <UserAvatar />
            </IconButton>
          </>
        }
      />

      {/* Update dialog */}
      <UpdateDialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
      />
    </Box>
  );
}

export default Header;
