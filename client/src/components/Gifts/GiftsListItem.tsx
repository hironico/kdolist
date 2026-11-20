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

/** Short numeric date with dashes: dd-mm-yyyy. */
const formatShortDate = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${date.getFullYear()}`;
};

type GiftsListContentsProps = {
    oneGift: Gift;
    editable: boolean;
    isOwner: boolean;
    showTakenToOwner: boolean;
    currentUserId?: string;
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
const GiftsListItem: React.FC<GiftsListContentsProps> = ({ oneGift, editable, isOwner, showTakenToOwner, currentUserId, onDelete: deleteAction, onTake: takeAction, onEdit: editAction, onFavorite: favoriteAction }) => {

    const isTaken = oneGift.selectedById !== null;
    const isTakenByCurrentUser = isTaken && oneGift.selectedById === currentUserId;
    const isFavorite = oneGift.isFavorite || false;
    const [shouldAnimate, setShouldAnimate] = useState(false);

    // Handle favorite click: animate first, then update server
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editable) return;

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
    // Clickable for owners and collaborative members
    const rightContent = isFavorite || editable ? (
        <IconButton
            size="small"
            onClick={handleFavoriteClick}
            disabled={!editable}
            sx={{
                cursor: editable ? 'pointer' : 'default',
                '&.Mui-disabled': {
                    opacity: 1
                },
                animation: shouldAnimate ? `${favoriteBounce} 0.5s ease-in-out` : 'none',
            }}
        >
            {isFavorite ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
    ) : undefined;

    // "Modif: dd-mm-yyyy", followed by "Réservé par: <prénom>" ("moi" when the
    // current user reserved it). The reserver is shown under the same rule as
    // the strikethrough, so the owner only sees it when the list allows it
    // (the server doesn't even send it otherwise).
    const reserverName = isTakenByCurrentUser
        ? 'moi'
        : (oneGift.selectedBy?.firstname?.trim() || oneGift.selectedBy?.username || '');
    const showReserver = shouldShowStrikethrough && reserverName !== '';

    const secondaryText = (
        <Typography variant="caption" color="text.secondary">
            {`Modif: ${formatShortDate(new Date(oneGift.updatedAt.toString()))}${showReserver ? ` / Réservé par: ${reserverName}` : ''}`}
        </Typography>
    );

    const deleteActionSwipe: SwipeableListItemAction = {
        icon: <DeleteIcon />,
        color: 'error',
        onAction: deleteAction,
        ariaLabel: 'Supprimer',
    };

    const takeActionSwipe: SwipeableListItemAction = {
        icon: <CheckIcon />,
        color: isTaken ? 'success' : 'default',
        onAction: takeAction,
        ariaLabel: isTaken ? 'Libérer' : 'Réserver',
    }

    // Get first image or use default
    const imageUrl = oneGift.images && oneGift.images.length > 0
        ? oneGift.images[0].url
        : '/logo_kdolist-192.png';

    // iOS list row image (tall row): 44pt, 11pt corner radius.
    const giftIcon = (
        <Avatar
            src={imageUrl}
            alt={oneGift.name}
            variant="rounded"
            sx={{
                width: 44,
                height: 44,
                borderRadius: '11px',
                backgroundColor: 'background.default',
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
            iconTint="none"
            rightContent={rightContent}
        />
    );
}

export default GiftsListItem;
