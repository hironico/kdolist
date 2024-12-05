import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { FlexBox } from '@/components/styled';
import useNotifications from '@/store/notifications';
import useSidebar from '@/store/sidebar';
import { getRandomJoke } from './utils';
import routes from '@/routes';
import { PathRouteProps, useLocation, useNavigate } from 'react-router-dom';
import { PathRouteCustomProps, Routes } from '@/routes/types';
import { ReactNode, useContext} from 'react';
import { ChevronLeft } from '@mui/icons-material';
import { LoginContext } from '@/LoginContext';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { Link, Typography } from '@mui/material';


function Header() {
  const [, sidebarActions] = useSidebar();
  const [, notificationsActions] = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const loginContext = useContext(LoginContext);
  
  function getRouteByPath(routes: Routes, path: string): (PathRouteProps & PathRouteCustomProps) | undefined {
    return Object.values(routes).find(route => route.path === path);
  }

  const getTitle = (): string => {
    const route = getRouteByPath(routes, location.pathname);
    if (!route) return 'no route';

    const title = route.title ? route.title : loginContext.giftList?.name;
    return title ? title : 'no title';
  }

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

  const renderMenuIconButton = (): ReactNode => {
    return <IconButton
      onClick={sidebarActions.toggle}
      size="large"
      edge="start"
      color="info"
      aria-label="menu"
      sx={{ mr: 1 }}
    >
      <MenuIcon />
    </IconButton>
  }

  const renderBackNavigateIconButton = (): ReactNode => {

    const { state } = location;

    const target = state?.editable ? '/mylists' : '/mygroupslists';
    return <IconButton
              onClick={()=> navigate(target)}
              size="large"
              edge="start"
              color="info"
              aria-label="backward"
              sx={{ mr: 1 }}
            >
        <ChevronLeft />
    </IconButton>
  }

  const renderIconButton = (): ReactNode => {
    let home = false;
    switch(location.pathname) {
      case '/':      
      case '/login':
      case '/mylists':
      case '/mygroupslists':
      case '/privacy':
        home = true;
        break;

      default:
        home=false;
        break;
    }
    return home ? renderMenuIconButton() : renderBackNavigateIconButton();
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar  position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <FlexBox sx={{ alignItems: 'center' }}>
            {renderIconButton()}
            <Button size='large' onClick={showNotification}>
              {getTitle()}
            </Button>
          </FlexBox>
          
          <IconButton>
            <UserAvatar />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;
