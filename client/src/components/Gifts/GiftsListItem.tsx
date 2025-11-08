import React from 'react';
import { Gift } from "@/LoginContext";
import { Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import { Redeem } from '@mui/icons-material';

type GiftsListContentsProps = {
    key: string;
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
const GiftsListItem: React.FC<GiftsListContentsProps> = ({ key, oneGift, editable, isOwner, showTakenToOwner, onDelete: deleteAction, onTake: takeAction, onEdit: editAction, onFavorite: favoriteAction}) => {

    const isTaken = oneGift.selectedById !== null;
    const isFavorite = oneGift.isFavorite || false;
    
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
            onClick={(e) => {
                e.stopPropagation();
                if (isOwner) {
                    favoriteAction();
                }
            }}
            disabled={!isOwner}
            sx={{ 
                cursor: isOwner ? 'pointer' : 'default',
                '&.Mui-disabled': {
                    opacity: 1
                }
            }}
        >
            {isFavorite ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
    ) : undefined;

    const modifDate = new Date(oneGift.updatedAt.toString());
    const secondaryText = (
        <Typography variant="caption">
            {`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}
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

    return (
        <SwipeableListItem
            key={key}
            keyId={key}
            onClickMain={editAction}
            primaryText={primaryText}
            secondaryText={secondaryText}
            action1={editable ? deleteActionSwipe : undefined}
            action2={takeActionSwipe}
            icon={<Redeem />}
            rightContent={rightContent}
        />
    );
}

export default GiftsListItem;
