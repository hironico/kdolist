import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    Divider,
    Chip,
    useTheme,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import BoltIcon from '@mui/icons-material/Bolt';
import SwipeableListItem from '@/components/SwipeableListItem/SwipeableListItem';
import ConfirmAlert from '@/components/ConfirmAlert';
import { TribeDetailsData } from './types';

interface TribeDetailsProps {
    tribeDetails: TribeDetailsData | null;
    currentUserId?: string;
    onDeleteInvitation?: (membershipId: string) => void;
    onChangeMembershipStatus?: (membershipId: string, newStatus: 'ADMIN' | 'MEMBER') => void;
}

/** One counter of the stats row: icon + value on one line, label below. */
const StatCounter: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
    <Box sx={{ textAlign: 'center', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'primary.main' }}>
            {icon}
            <Typography variant="h6" component="span" color="text.primary">
                {value}
            </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
    </Box>
);

// Membership status capsules (iOS-style tinted pills).
const statusChipSx = (color: string) => ({
    height: 22,
    bgcolor: color,
    color: '#ffffff',
    fontWeight: 600,
    typography: 'caption',
    '& .MuiChip-label': { px: 1 },
});

/**
 * TribeDetails component displays comprehensive information about a tribe
 * including picture, name, member counts, admins, and members.
 */
const TribeDetails: React.FC<TribeDetailsProps> = ({ tribeDetails, currentUserId, onDeleteInvitation, onChangeMembershipStatus }) => {
    const theme = useTheme();
    // State for the confirmation alert
    const [confirmActionSheetOpen, setConfirmActionSheetOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        membershipId: string;
        memberName: string;
        action: 'REMOVE_ADMIN' | 'ADD_ADMIN';
    } | null>(null);

    // Handlers for admin rights confirmation
    const handleRequestAdminChange = (membershipId: string, memberName: string, action: 'REMOVE_ADMIN' | 'ADD_ADMIN') => {
        setPendingAction({ membershipId, memberName, action });
        setConfirmActionSheetOpen(true);
    };

    const handleConfirmAdminChange = () => {
        if (pendingAction && onChangeMembershipStatus) {
            const newStatus = pendingAction.action === 'REMOVE_ADMIN' ? 'MEMBER' : 'ADMIN';
            onChangeMembershipStatus(pendingAction.membershipId, newStatus);
        }
        setConfirmActionSheetOpen(false);
        setPendingAction(null);
    };

    const handleCancelAdminChange = () => {
        setConfirmActionSheetOpen(false);
        setPendingAction(null);
    };

    if (!tribeDetails) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Chargement...
                </Typography>
            </Box>
        );
    }

    const { name, admins, members, invited, declined, totalMembers, totalLists, adminId } = tribeDetails;

    // Check if current user is an admin (any admin, not just the owner)
    const isCurrentUserAdmin = admins.some(admin => admin.id === currentUserId);

    // Generate initials for tribe avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        // Fills the (non scrolling) sheet: the header and the stats keep their
        // height and the members section takes the rest, scrolling its list.
        <Box sx={{ pb: 2, px: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Tribe picture and name, like an iOS contact card header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    pt: 1,
                    pb: 3,
                }}
            >
                <Avatar
                    sx={{
                        width: 88,
                        height: 88,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        typography: 'h4',
                        mb: 1.5,
                    }}
                >
                    {getInitials(name)}
                </Avatar>
                <Typography variant="h5" component="p" textAlign="center" sx={{ overflowWrap: 'anywhere' }}>
                    {name}
                </Typography>
            </Box>

            {/* Stats, as one inset grouped row of three counters */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr auto 1fr',
                    alignItems: 'center',
                    flexShrink: 0,
                    py: 1.5,
                    bgcolor: 'background.paper',
                    borderRadius: '26px',
                }}
            >
                <StatCounter icon={<AdminPanelSettingsIcon />} value={admins.length} label={`Admin${admins.length > 1 ? 's' : ''}`} />
                <Divider orientation="vertical" flexItem />
                <StatCounter icon={<GroupIcon />} value={totalMembers} label={`Membre${totalMembers > 1 ? 's' : ''}`} />
                <Divider orientation="vertical" flexItem />
                <StatCounter icon={<ListAltIcon />} value={totalLists} label={`Liste${totalLists > 1 ? 's' : ''}`} />
            </Box>

            {/* All members, as an inset grouped list with a section header */}
            <Box sx={{ pt: 3, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="overline" color="text.secondary" component="h3" sx={{ display: 'block', flexShrink: 0, px: 2, mb: 0.5 }}>
                    Membres ({totalMembers})
                </Typography>
                {/* The only scrolling area of the sheet: it shrinks to the space
                    left under the header and the stats. */}
                <List sx={{
                    m: '0px',
                    flex: '0 1 auto',
                    minHeight: 0,
                    maxHeight: 'none',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}>
                    {/* Admins First */}
                    {admins.map((admin) => (
                        <SwipeableListItem
                            key={`admin-${admin.id}`}
                            keyId={`admin-${admin.id}`}
                            icon={<PersonIcon />}
                            iconTint="primary.main"
                            primaryText={`${admin.firstname} ${admin.lastname}`}
                            secondaryText={`@${admin.username}`}
                            rightContent={<Chip label="Admin" size="small" sx={statusChipSx(theme.palette.primary.main)} />}
                            action1={
                                isCurrentUserAdmin && onChangeMembershipStatus && admin.id !== adminId
                                    ? {
                                        icon: <BoltIcon />,
                                        color: 'default' as const,
                                        ariaLabel: 'Retirer les droits administrateur',
                                        onAction: () => handleRequestAdminChange(
                                            admin.membershipId,
                                            `${admin.firstname} ${admin.lastname}`,
                                            'REMOVE_ADMIN'
                                        ),
                                    }
                                    : undefined
                            }
                        />
                    ))}

                    {/* Invited Members */}
                    {invited.map((invitation) => (
                        <SwipeableListItem
                            key={`invited-${invitation.membershipId}`}
                            keyId={`invited-${invitation.membershipId}`}
                            icon={<PersonIcon />}
                            iconTint="info.main"
                            primaryText={`${invitation.firstname} ${invitation.lastname}`}
                            secondaryText={`@${invitation.username}`}
                            rightContent={<Chip label="Invité" size="small" sx={statusChipSx(theme.palette.info.main)} />}
                            action1={
                                isCurrentUserAdmin && onDeleteInvitation
                                    ? {
                                        icon: <DeleteIcon />,
                                        color: 'error' as const,
                                        onAction: () => onDeleteInvitation(invitation.membershipId),
                                        ariaLabel: "Supprimer l'invitation",
                                    }
                                    : undefined
                            }
                        />
                    ))}

                    {/* Declined Invitations */}
                    {declined.map((invitation) => (
                        <SwipeableListItem
                            key={`declined-${invitation.membershipId}`}
                            keyId={`declined-${invitation.membershipId}`}
                            icon={<PersonIcon />}
                            iconTint={theme.palette.secondary.main}
                            primaryText={`${invitation.firstname} ${invitation.lastname}`}
                            secondaryText={`@${invitation.username}`}
                            rightContent={<Chip label="Refusé" size="small" sx={statusChipSx(theme.palette.error.main)} />}
                            action1={
                                isCurrentUserAdmin && onDeleteInvitation
                                    ? {
                                        icon: <DeleteIcon />,
                                        color: 'error' as const,
                                        onAction: () => onDeleteInvitation(invitation.membershipId),
                                        ariaLabel: "Supprimer l'invitation",
                                    }
                                    : undefined
                            }
                        />
                    ))}

                    {/* Regular Members */}
                    {members.map((member) => (
                        <SwipeableListItem
                            key={`member-${member.id}`}
                            keyId={`member-${member.id}`}
                            icon={<PersonIcon />}
                            iconTint="success.main"
                            primaryText={`${member.firstname} ${member.lastname}`}
                            secondaryText={`@${member.username}`}
                            rightContent={<Chip label="Membre" size="small" sx={statusChipSx(theme.palette.secondary.main)} />}
                            action1={
                                isCurrentUserAdmin && onChangeMembershipStatus && member.id !== adminId
                                    ? {
                                        icon: <BoltIcon />,
                                        color: 'warning' as const,
                                        ariaLabel: 'Promouvoir administrateur',
                                        onAction: () => handleRequestAdminChange(
                                            member.membershipId,
                                            `${member.firstname} ${member.lastname}`,
                                            'ADD_ADMIN'
                                        ),
                                    }
                                    : undefined
                            }
                        />
                    ))}
                </List>
            </Box>

            {/* Confirmation alert */}
            <ConfirmAlert
                open={confirmActionSheetOpen}
                onCancel={handleCancelAdminChange}
                onConfirm={handleConfirmAdminChange}
                title={
                    pendingAction?.action === 'REMOVE_ADMIN'
                        ? `Retirer les droits d'administrateur à ${pendingAction.memberName} ?`
                        : `Promouvoir ${pendingAction?.memberName ?? ''} en tant qu'administrateur ?`
                }
                confirmLabel={pendingAction?.action === 'REMOVE_ADMIN' ? 'Retirer' : 'Promouvoir'}
                destructive={pendingAction?.action === 'REMOVE_ADMIN'}
            />
        </Box>
    );
};

export default TribeDetails;
