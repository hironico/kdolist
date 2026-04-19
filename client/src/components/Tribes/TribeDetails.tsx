import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    Divider,
    Chip,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import BoltIcon from '@mui/icons-material/Bolt';
import SwipeableListItem from '@/components/SwipeableListItem/SwipeableListItem';
import ActionSheet, { ActionSheetEntry } from '@/components/ActionSheet/ActionSheet';
import { TribeDetailsData } from './types';

interface TribeDetailsProps {
    tribeDetails: TribeDetailsData | null;
    currentUserId?: string;
    onDeleteInvitation?: (membershipId: string) => void;
    onChangeMembershipStatus?: (membershipId: string, newStatus: 'ADMIN' | 'MEMBER') => void;
}

/**
 * TribeDetails component displays comprehensive information about a tribe
 * including picture, name, member counts, admins, and members.
 */
const TribeDetails: React.FC<TribeDetailsProps> = ({ tribeDetails, currentUserId, onDeleteInvitation, onChangeMembershipStatus }) => {
    // State for confirmation ActionSheet
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
        <Box sx={{ pb: 2 }}>
            {/* Tribe Picture and Name */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 3,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                }}
            >
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        mb: 2,
                    }}
                >
                    {getInitials(name)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                    {name}
                </Typography>
            </Box>

            {/* Stats Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    py: 2,
                    px: 2,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <AdminPanelSettingsIcon color="primary" sx={{ mr: 0.5 }} />
                        <Typography variant="h6" fontWeight="bold">
                            {admins.length}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Admin{admins.length > 1 ? 's' : ''}
                    </Typography>
                </Box>

                <Divider orientation="vertical" flexItem />

                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <GroupIcon color="primary" sx={{ mr: 0.5 }} />
                        <Typography variant="h6" fontWeight="bold">
                            {totalMembers}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Membre{totalMembers > 1 ? 's' : ''}
                    </Typography>
                </Box>

                <Divider orientation="vertical" flexItem />

                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <ListAltIcon color="primary" sx={{ mr: 0.5 }} />
                        <Typography variant="h6" fontWeight="bold">
                            {totalLists}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Liste{totalLists > 1 ? 's' : ''}
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* All Members Section - Unified List */}
            <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, px: 2, display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1 }} color="primary" />
                    Membres ({totalMembers})
                </Typography>
                <List sx={{
                    m: '0px',
                    mt: '10px',
                    maxHeight: '50vh',
                    overflowY: 'auto',
                    alignSelf: 'start'
                }}>
                    {/* Admins First */}
                    {admins.map((admin) => (
                        <SwipeableListItem
                            key={`admin-${admin.id}`}
                            keyId={`admin-${admin.id}`}
                            icon={<PersonIcon />}
                            primaryText={`${admin.firstname} ${admin.lastname}`}
                            secondaryText={`@${admin.username}`}
                            rightContent={<Chip label="Admin" size="small" color="primary" />}
                            action1={
                                isCurrentUserAdmin && onChangeMembershipStatus && admin.id !== adminId
                                    ? {
                                        icon: <BoltIcon sx={{ color: '#FFA500' }} />,
                                        color: 'default' as const,
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
                            primaryText={`${invitation.firstname} ${invitation.lastname}`}
                            secondaryText={`@${invitation.username}`}
                            rightContent={<Chip label="Invité" size="small" color="info" />}
                            action1={
                                isCurrentUserAdmin && onDeleteInvitation
                                    ? {
                                        icon: <DeleteIcon />,
                                        color: 'error' as const,
                                        onAction: () => onDeleteInvitation(invitation.membershipId),
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
                            primaryText={`${invitation.firstname} ${invitation.lastname}`}
                            secondaryText={`@${invitation.username}`}
                            rightContent={<Chip label="Refusé" size="small" color="error" />}
                            action1={
                                isCurrentUserAdmin && onDeleteInvitation
                                    ? {
                                        icon: <DeleteIcon />,
                                        color: 'error' as const,
                                        onAction: () => onDeleteInvitation(invitation.membershipId),
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
                            primaryText={`${member.firstname} ${member.lastname}`}
                            secondaryText={`${member.username}`}
                            rightContent={<Chip label="Membre" size="small" color="default" />}
                            action1={
                                isCurrentUserAdmin && onChangeMembershipStatus && member.id !== adminId
                                    ? {
                                        icon: <BoltIcon sx={{ color: '#D3D3D3' }} />,
                                        color: 'default' as const,
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

            {/* Confirmation ActionSheet */}
            <ActionSheet
                open={confirmActionSheetOpen}
                handleClose={handleCancelAdminChange}
                message={
                    pendingAction?.action === 'REMOVE_ADMIN'
                        ? `Retirer les droits d'administrateur à ${pendingAction.memberName} ?`
                        : `Promouvoir ${pendingAction?.memberName} en tant qu'administrateur ?`
                }
                entries={[
                    {
                        label: pendingAction?.action === 'REMOVE_ADMIN' ? 'Retirer les droits' : 'Promouvoir',
                        color: pendingAction?.action === 'REMOVE_ADMIN' ? 'error' : 'primary',
                        onAction: handleConfirmAdminChange,
                    },
                ]}
                defaultEntry={{
                    label: 'Annuler',
                    color: 'primary',
                    onAction: handleCancelAdminChange,
                }}
            />
        </Box>
    );
};

export default TribeDetails;
