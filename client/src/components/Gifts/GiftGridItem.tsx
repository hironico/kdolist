import React, { useState } from 'react';
import { Gift } from '@/LoginContext';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Redeem } from '@mui/icons-material';

type GiftGridItemProps = {
  oneGift: Gift;
  isOwner: boolean;
  showTakenToOwner: boolean;
  editable: boolean;
  currentUserId?: string;
  onClick: () => void;
  onDelete: () => void;
  onTake: () => void;
  onFavorite: () => void;
};

const GiftGridItem: React.FC<GiftGridItemProps> = ({
  oneGift,
  isOwner,
  showTakenToOwner,
  editable,
  currentUserId,
  onClick,
  onDelete,
  onTake,
  onFavorite
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const isTaken = oneGift.selectedById !== null;
  const isTakenByCurrentUser = oneGift.selectedById === currentUserId;
  const isFavorite = oneGift.isFavorite || false;
  
  // Can untake only if taken by current user
  const canUntake = isTaken && isTakenByCurrentUser;

  // Show taken indicator if:
  // - Gift is taken AND user is NOT the owner, OR
  // - Gift is taken AND user IS the owner AND showTakenToOwner is enabled
  const shouldShowTaken = isTaken && (!isOwner || showTakenToOwner);

  // Get first image or use default
  const imageUrl = oneGift.images && oneGift.images.length > 0
    ? oneGift.images[0].url
    : '/logo_kdolist-192.png'; // Default image

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setMenuAnchorEl(null);
  };

  const handleTakeAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onTake();
  };

  const handleFavoriteAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onFavorite();
  };

  const handleDeleteAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete();
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        position: 'relative',
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
      onClick={onClick}
    >
      {/* Image section */}
      <Box sx={{ position: 'relative', height: '65%' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={oneGift.name}
          sx={{
            objectFit: 'cover',
            opacity: shouldShowTaken ? 0.5 : 1,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Top-left: Taken and Favorite indicators */}
        {(shouldShowTaken || isFavorite) && (
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
            {shouldShowTaken && (
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                }}
              >
                <CheckCircleIcon color="success" fontSize="small" />
              </IconButton>
            )}
            {isFavorite && (
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                }}
              >
                <FavoriteIcon color="error" fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}

        {/* Top-right: Menu button */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={() => handleMenuClose()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Take/Untake action - disable untake if taken by someone else */}
          <MenuItem onClick={handleTakeAction} disabled={isTaken && !canUntake}>
            <ListItemIcon>
              {isTaken ? <CheckCircleIcon fontSize="small" color="success" /> : <CheckCircleOutlineIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {isTaken 
                ? (canUntake ? 'Marquer comme disponible' : 'Pris par quelqu\'un d\'autre')
                : 'Marquer comme pris'
              }
            </ListItemText>
          </MenuItem>

          {/* Favorite action - only for owners */}
          {isOwner && (
            <MenuItem onClick={handleFavoriteAction}>
              <ListItemIcon>
                {isFavorite ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</ListItemText>
            </MenuItem>
          )}

          {/* Delete action - only for editable lists */}
          {editable && (
            <MenuItem onClick={handleDeleteAction}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* If no image, show default icon overlay */}
        {(!oneGift.images || oneGift.images.length === 0) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <Redeem sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
          </Box>
        )}
      </Box>

      {/* Content section */}
      <CardContent sx={{
        height: '35%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pt: '0px', pl: '5px', pr: '5px', pb: '5px',
        m: '0px',
        '&:last-child': {
          pb: '0px'
        }
      }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontSize: '1rem',
            fontWeight: 500,
            textDecoration: shouldShowTaken ? 'line-through' : 'none',
            mb: '0px',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {oneGift.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GiftGridItem;
