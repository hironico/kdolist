import { GiftLink } from "@/LoginContext";
import LinkIcon from '@mui/icons-material/Link';
import LaunchIcon from '@mui/icons-material/Launch';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip} from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { FC, useState } from "react";
import GiftLinkEditorModal from "./GiftLinkEditorModal";
import Fade from '@mui/material/Fade';

export type GiftLinksMenuProps = {
    links: GiftLink[];
    handleAddLink: (link: GiftLink) => void;
    handleRemoveLink: (link: GiftLink) => void;
    editable: boolean;
}

const GiftLinksMenu: FC<GiftLinksMenuProps> = ({ links, editable, handleAddLink }) => {
    const [anchorEl, setAnchorEl] = useState<EventTarget & Element | null>(null);
    const [linkEditorOpen, setLinkEditorOpen] = useState<boolean>(false);
    const open = Boolean(anchorEl);
  
    const handleClick = (event: React.MouseEvent) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleMenuOpen = (url: string) => {      
      handleClose();
      window.open(url, '_blank');
    }

    const openLinkEditor = () => {
      handleClose();
      setLinkEditorOpen(true);
    }

    const handleLinkEditorClose = () => {
      setLinkEditorOpen(false);
    }
  
    return (
      <div>
        <Button aria-label="more"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleClick}
          variant="outlined" 
          startIcon={<LinkIcon />}
          endIcon={<KeyboardArrowUpIcon/>}
          sx={{ width: '100%' }}>            
            Liens
          </Button>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          TransitionComponent={Fade}
        >
          {links?.map((link) => (
            <Tooltip title={link.url} key={link.id}>
            <MenuItem onClick={() => handleMenuOpen(link.url)}>
              <ListItemIcon>
                <LaunchIcon />
              </ListItemIcon>
              <ListItemText primary={link.description} />
            </MenuItem>
            </Tooltip>
          ))}
          <MenuItem onClick={openLinkEditor} disabled={!editable}>
            <ListItemIcon>
              <AddLinkIcon />
            </ListItemIcon>
            <ListItemText primary="Ajouter..." />
          </MenuItem>
        </Menu>

        <GiftLinkEditorModal onClose={handleLinkEditorClose} onSave={handleAddLink} open={linkEditorOpen} />
      </div>
    );
  };

  export default GiftLinksMenu;