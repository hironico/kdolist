import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Chip,
    IconButton,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
}

interface InvitedUser extends User {
    membershipId: string;
}

interface TribeDetailsData {
    id: string;
    name: string;
    adminId: string;
    admin: User;
    createdAt: Date;
    updatedAt: Date;
    admins: User[];
    members: User[];
    invited: InvitedUser[];
    declined: InvitedUser[];
    totalMembers: number;
    totalLists: number;
}

interface TribeDetailsProps {
    tribeDetails: TribeDetailsData | null;
    currentUserId?: string;
    onDeleteInvitation?: (membershipId: string) => void;
}

/**
 * TribeDetails component displays comprehensive information about a tribe
 * including picture, name, member counts, admins, and members.
 */
const TribeDetails: React.FC<TribeDetailsProps> = ({ tribeDetails, currentUserId, onDeleteInvitation }) => {
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

    // Check if current user is an admin
    const isAdmin = currentUserId === adminId;

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
            <Box sx={{ px: 2, pt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1 }} color="primary" />
                    Membres ({totalMembers})
                </Typography>
                <List sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
                    {/* Admins First */}
                    {admins.map((admin) => (
                        <ListItem key={`admin - ${admin.id} `} sx={{ px: 0, borderBottom: 'none' }} >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {admin.firstname} {admin.lastname}
                                        </Typography>
                                        <Chip label="Admin" size="small" color="primary" />
                                    </Box>
                                }
                                secondary={`@${admin.username} `}
                            />
                        </ListItem>
                    ))}

                    {/* Invited Members */}
                    {invited.map((invitation) => (
                        <ListItem
                            key={`invited - ${invitation.membershipId} `}
                            sx={{ px: 0, borderBottom: 'none' }}
                            secondaryAction={
                                isAdmin && onDeleteInvitation ? (
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => onDeleteInvitation(invitation.membershipId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                ) : null
                            }
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'info.light' }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {`${invitation.firstname} ${invitation.lastname} `}
                                        </Typography>
                                        <Chip label="Invité" size="small" color="info" />
                                    </Box>
                                }
                                secondary={`@${invitation.username} `}
                            />
                        </ListItem>
                    ))}

                    {/* Declined Invitations */}
                    {declined.map((invitation) => (
                        <ListItem
                            key={`declined - ${invitation.membershipId} `}
                            sx={{ px: 0, borderBottom: 'none' }}
                            secondaryAction={
                                isAdmin && onDeleteInvitation ? (
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => onDeleteInvitation(invitation.membershipId)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                ) : null
                            }
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'error.light' }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {`${invitation.firstname} ${invitation.lastname} `}
                                        </Typography>
                                        <Chip label="Refusé" size="small" color="error" />
                                    </Box>
                                }
                                secondary={`@${invitation.username} `}
                            />
                        </ListItem>
                    ))}

                    {/* Regular Members */}
                    {members.map((member) => (
                        <ListItem key={`member - ${member.id} `} sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {`${member.firstname} ${member.lastname} `}
                                        </Typography>
                                        <Chip label="Membre" size="small" color="default" />
                                    </Box>
                                }
                                secondary={`@${member.username} `}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default TribeDetails;
