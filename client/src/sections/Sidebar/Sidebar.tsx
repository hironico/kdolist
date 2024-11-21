import { Link } from 'react-router-dom';

import DefaultIcon from '@mui/icons-material/Deblur';
import GitHubIcon from '@mui/icons-material/GitHub';
import ThemeIcon from '@mui/icons-material/InvertColors';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { repository } from '@/config';
import { HotKeysButton } from './styled';

import routes from '@/routes';
import useSidebar from '@/store/sidebar';
import { CenteredFlexBox, FlexBox, FullSizeCenteredFlexBox } from '@/components/styled';
import { IconButton, Typography } from '@mui/material';

import useHotKeysDialog from '@/store/hotkeys';
import useTheme from '@/store/theme';
import { display, width } from '@mui/system';

function Sidebar() {
  const [isSidebarOpen, sidebarActions] = useSidebar();
  const [, themeActions] = useTheme();
  const [, hotKeysDialogActions] = useHotKeysDialog();

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
      <List sx={{ width: 250 }}>
        {Object.values(routes)
          .filter((route) => route.inSideBar)
          .map(({ path, title, icon: Icon }) => (
            <ListItem sx={{ p: 0 }} key={path}>
              <ListItemButton component={Link} to={path as string} onClick={sidebarActions.close}>
                <ListItemIcon>{Icon ? <Icon /> : <DefaultIcon />}</ListItemIcon>
                <ListItemText>{title}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      <Divider orientation="horizontal" flexItem />
    </SwipeableDrawer>
  );
}

export default Sidebar;
