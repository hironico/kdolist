import React, { useState, useEffect } from 'react';
import { Gift } from "@/LoginContext";
import { Typography, IconButton, Avatar, keyframes } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import { Redeem } from '@mui/icons-material';

// Bounce animation for favorite icon
const favoriteBounce = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

type GiftsListContentsProps = {
    oneGift: Gift;
    editable: boolean;
    isOwner: boolean;
    showTakenToOwner: boolean;
    onDelete: () => void;
    onTake: () => void;
    onEdit: () => void;
    onFavorite: () => void;
}

/**
 * Represents a Gift item in the Gift List under the form of a SwipeableListItem.
 * The strikethrough decoration logic:
 * - Always shown for non-owners when gift is taken
 * - For owners: only shown if showTakenToOwner is true (useful for collections/series tracking)
 */
const GiftsListItem: React.FC<GiftsListContentsProps> = ({ oneGift, editable, isOwner, showTakenToOwner, onDelete: deleteAction, onTake: takeAction, onEdit: editAction, onFavorite: favoriteAction }) => {

    const isTaken = oneGift.selectedById !== null;
    const isFavorite = oneGift.isFavorite || false;
    const [shouldAnimate, setShouldAnimate] = useState(false);

    // Handle favorite click: animate first, then update server
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOwner) return;

        // Trigger animation
        setShouldAnimate(true);

        // After animation completes, update server
        setTimeout(() => {
            setShouldAnimate(false);
            favoriteAction();
        }, 500); // Match animation duration
    };

    // Show strikethrough if:
    // - Gift is taken AND user is NOT the owner, OR
    // - Gift is taken AND user IS the owner AND showTakenToOwner is enabled
    const shouldShowStrikethrough = isTaken && (!isOwner || showTakenToOwner);
    const decoration = shouldShowStrikethrough ? 'line-through' : 'none';

    const primaryText = (
        <Typography sx={{ textDecoration: decoration }}>{oneGift.name}</Typography>
    );

    // Create favorite icon as rightContent - visible to all users
    // Only clickable for list owners
    const rightContent = isFavorite || isOwner ? (
        <IconButton
            size="small"
            onClick={handleFavoriteClick}
            disabled={!isOwner}
            sx={{
                cursor: isOwner ? 'pointer' : 'default',
                '&.Mui-disabled': {
                    opacity: 1
                },
                animation: shouldAnimate ? `${favoriteBounce} 0.5s ease-in-out` : 'none',
            }}
        >
            {isFavorite ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
    ) : undefined;

    const modifDate = new Date(oneGift.updatedAt.toString());
    const secondaryText = (
        <Typography variant="caption">
            {`Modif.${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()} `}
        </Typography>
    );

    const deleteActionSwipe: SwipeableListItemAction = {
        icon: <DeleteIcon />,
        color: 'error',
        onAction: deleteAction
    };

    const takeActionSwipe: SwipeableListItemAction = {
        icon: <CheckIcon />,
        color: isTaken ? 'success' : 'default',
        onAction: takeAction
    }

    // Get first image or use default
    const imageUrl = oneGift.images && oneGift.images.length > 0
        ? oneGift.images[0].url
        : '/logo_kdolist-192.png';

    const giftIcon = (
        <Avatar
            src={imageUrl}
            alt={oneGift.name}
            variant="rounded"
            sx={{
                width: 40,
                height: 40,
                backgroundColor: 'white',
                filter: shouldShowStrikethrough ? 'grayscale(100%)' : 'none'

            }}
        >
        </Avatar>
    );

    return (
        <SwipeableListItem
            keyId={`gift - ${oneGift.id} `}
            onClickMain={editAction}
            primaryText={primaryText}
            secondaryText={secondaryText}
            action1={editable ? deleteActionSwipe : undefined}
            action2={takeActionSwipe}
            icon={giftIcon}
            rightContent={rightContent}
        />
    );
}

export default GiftsListItem;
