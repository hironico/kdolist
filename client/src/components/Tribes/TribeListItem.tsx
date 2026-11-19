import React from 'react';
import { Typography, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import { Group } from './types';

interface TribeListItemProps {
    tribe: Group;
    currentUserId?: string;
    onAcceptInvite?: (membershipId: string) => void;
    onRejectInvite?: (membershipId: string) => void;
    onLeaveTribe?: (groupId: string) => void;
    onInviteUser?: (groupId: string) => void;
    onDeleteTribe?: (groupId: string) => void;
    onViewDetails?: (groupId: string) => void;
}

/**
 * Represents a Tribe item in the Tribe List using SwipeableListItem.
 * Shows different actions based on whether the user is invited or a member,
 * and whether they are the admin of the tribe.
 */
const TribeListItem: React.FC<TribeListItemProps> = ({
    tribe,
    currentUserId,
    onAcceptInvite,
    onRejectInvite,
    onLeaveTribe,
    onInviteUser,
    onDeleteTribe,
    onViewDetails,
}) => {
    const membership = tribe.groupMemberships?.[0];
    const isInvited = membership?.status === 'INVITED';
    const isAdmin = tribe.adminId === currentUserId;
    const adminName = tribe.admin ? tribe.admin.username : tribe.adminId;

    // Primary text - tribe name
    const primaryText = (
        <Typography variant="body1" fontWeight={isInvited ? 600 : 400}>
            {tribe.name}
        </Typography>
    );

    // Secondary text - shows invitation status or admin name
    const secondaryText = (
        <Typography variant="caption" color="text.secondary">
            {isInvited ? `Invitation de ${adminName}` : `Admin : ${adminName}`}
        </Typography>
    );

    // Define actions based on status
    let action1: SwipeableListItemAction | undefined;
    let action2: SwipeableListItemAction | undefined;
    let action3: SwipeableListItemAction | undefined;

    if (isInvited && membership) {
        // For invitations: Accept and Reject actions
        action1 = {
            icon: <CheckIcon />,
            color: 'success',
            onAction: () => onAcceptInvite?.(membership.id),
            ariaLabel: 'Accepter',
        };
        action2 = {
            icon: <CloseIcon />,
            color: 'error',
            onAction: () => onRejectInvite?.(membership.id),
            ariaLabel: 'Refuser',
        };
    } else {
        // For joined tribes
        if (isAdmin) {
            // Admin can invite users and delete the tribe
            action1 = {
                icon: <PersonAddIcon />,
                color: 'primary',
                onAction: () => onInviteUser?.(tribe.id),
                ariaLabel: 'Inviter',
            };
            action2 = {
                icon: <DeleteIcon />,
                color: 'error',
                onAction: () => onDeleteTribe?.(tribe.id),
                ariaLabel: 'Supprimer la tribu',
            };
        } else {
            // Regular members can leave but if admin member (not owner) can invite too !
            action1 = {
                icon: <ExitToAppIcon />,
                color: 'error',
                onAction: () => onLeaveTribe?.(tribe.id),
                ariaLabel: 'Quitter la tribu',
            };

            if (membership?.status === 'ADMIN') {
                action2 = {
                    icon: <PersonAddIcon />,
                    color: 'primary',
                    onAction: () => onInviteUser?.(tribe.id),
                    ariaLabel: 'Inviter',
                };
            }
        }
    }

    // Right content - iOS capsule badge for pending invitations
    const rightContent = isInvited ? (
        <Box
            component="span"
            sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                px: 1,
                py: 0.25,
                borderRadius: 999,
                typography: 'caption',
                fontWeight: 600,
            }}
        >
            Nouveau
        </Box>
    ) : undefined;

    return (
        <SwipeableListItem
            keyId={`tribe - ${tribe.id} `}
            primaryText={primaryText}
            secondaryText={secondaryText}
            action1={action1}
            action2={action2}
            action3={action3}
            icon={<GroupIcon />}
            iconTint={isInvited ? 'warning.main' : isAdmin ? 'primary.main' : 'success.main'}
            rightContent={rightContent}
            onClickMain={() => onViewDetails?.(tribe.id)}
        />
    );
};

export default TribeListItem;
