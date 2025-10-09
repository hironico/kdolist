import { LoginContext } from '@/LoginContext';
import { Avatar, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCircle, Logout } from '@mui/icons-material';
import { keycloakAccountUrl, apiBaseUrl } from '@/config';

const UserAvatar = () => {
  const appContext = useContext(LoginContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar() {
    const { username } = appContext.loginInfo;
    const name = username ? username : '';
    return {
      sx: {
        bgcolor: stringToColor(name),
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
          transform: 'scale(1.05)',
        },
        transition: 'all 0.2s ease-in-out',
      },
      children: `${name.split(' ')[0][0]}`,
    };
  }

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (appContext.loginInfo.accessTokenProvider === 'KEYCLOAK') {
      window.open(keycloakAccountUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLogout = async () => {
    handleMenuClose();

    try {
      // Call server logout endpoint
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appContext.loginInfo.jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: refreshToken }),
        });
      }

      // Clear local storage
      localStorage.removeItem('jwt');
      localStorage.removeItem('refreshToken');

      // Clear login context
      appContext.setLoginInfo({
        id: undefined,
        username: undefined,
        email: undefined,
        accessToken: undefined,
        accessTokenProvider: undefined,
        jwt: undefined,
        profile: null,
      });

      // If user logged in with Keycloak, also logout from Keycloak
      if (appContext.loginInfo.accessTokenProvider === 'KEYCLOAK') {
        // Redirect to Keycloak logout endpoint
        const keycloakLogoutUrl = keycloakAccountUrl.replace('/account', '/protocol/openid-connect/logout');
        const redirectUri = encodeURIComponent(window.location.origin);
        window.location.href = `${keycloakLogoutUrl}?redirect_uri=${redirectUri}`;
      } else {
        // For other auth methods, just redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      localStorage.removeItem('jwt');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const { username, accessTokenProvider } = appContext.loginInfo;
  
  if (username === '') {
    return <></>;
  }

  return (
    <>
      <Avatar {...stringAvatar()} onClick={handleAvatarClick} />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            mt: 1.5,
          },
        }}
      >
        {accessTokenProvider === 'KEYCLOAK' && (
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
        )}
        {accessTokenProvider === 'KEYCLOAK' && <Divider />}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserAvatar;
