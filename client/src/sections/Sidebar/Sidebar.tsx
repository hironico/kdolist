import { Link } from 'react-router-dom';

import DefaultIcon from '@mui/icons-material/Deblur';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Badge from '@mui/material/Badge';

import routes from '@/routes';
import useSidebar from '@/store/sidebar';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import { useEffect, useState } from 'react';

interface Tribe {
  id: string;
  name: string;
  adminId: string;
  groupMemberships?: Array<{
    status: string;
  }>;
}

function Sidebar() {
  const [isSidebarOpen, sidebarActions] = useSidebar();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const api = useAuthenticatedApi();

  // Fetch tribes to check for pending invitations
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        const response = await api.get(`${apiBaseUrl}/group`);
        if (response.ok) {
          const tribes: Tribe[] = await response.json();
          const invitedCount = tribes.filter(
            (tribe) => tribe.groupMemberships?.[0]?.status === 'INVITED'
          ).length;
          setPendingInvitationsCount(invitedCount);
        }
      } catch (error) {
        console.error('Failed to fetch tribes for badge', error);
      }
    };

    if (isSidebarOpen) {
      fetchTribes();
    }
  }, [api, isSidebarOpen]);

  return (
    <SwipeableDrawer
      anchor="left"
      open={isSidebarOpen}
      onClose={sidebarActions.close}
      onOpen={sidebarActions.open}
      disableBackdropTransition={false}
      swipeAreaWidth={30}
      data-pw="sidebar"
    >
      <List sx={{ width: '250px' }}>
        {Object.values(routes)
          .filter((route) => route.inSideBar)
          .map(({ path, title, icon: Icon }) => (
            <ListItem sx={{ p: 0 }} key={path}>
              <ListItemButton component={Link} to={path as string} onClick={sidebarActions.close}>
                <ListItemIcon>
                  {path === '/tribes' && pendingInvitationsCount > 0 ? (
                    <Badge badgeContent={pendingInvitationsCount} color="error">
                      {Icon ? <Icon /> : <DefaultIcon />}
                    </Badge>
                  ) : (
                    Icon ? <Icon /> : <DefaultIcon />
                  )}
                </ListItemIcon>
                <ListItemText>{title}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        <ListItem sx={{ p: 0 }} key="github">
          <ListItemButton component={Link} to="/redirect?url=https://github.com/hironico/kdolist&newTab=true" onClick={sidebarActions.close}>
            <ListItemIcon><DefaultIcon /></ListItemIcon>
            <ListItemText>GitHub</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </SwipeableDrawer>
  );
}

export default Sidebar;
