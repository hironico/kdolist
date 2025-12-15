import React, { useState, useEffect, useContext } from 'react';
import { TextField, Autocomplete, CircularProgress, Typography, Box } from '@mui/material';
import BottomDialog from '@/components/BottomDialog/BottomDialog';
import { PersonAdd, Close } from '@mui/icons-material';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import { LoginContext } from '@/LoginContext';

interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}

interface InviteUserDialogProps {
    open: boolean;
    groupId: string | null;
    onClose: () => void;
    onUserInvited?: () => void;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
    open,
    groupId,
    onClose,
    onUserInvited,
}) => {
    const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [groupDetails, setGroupDetails] = useState<any | null>(null);
    const api = useAuthenticatedApi();
    const [, notificationsActions] = useNotifications();
    const { loginInfo } = useContext(LoginContext);

    // Fetch group details when dialog opens
    useEffect(() => {
        if (open && groupId) {
            const fetchGroupDetails = async () => {
                try {
                    const response = await api.get(`${apiBaseUrl}/group/${groupId}/details`);
                    if (response.ok) {
                        const data = await response.json();
                        setGroupDetails(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch group details for invite', error);
                    notificationsActions.push({
                        options: { variant: 'error' },
                        message: 'Erreur lors de la récupération des tribus!'
                    });
                }
            };
            fetchGroupDetails();
        }
    }, [open, groupId, api]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setUserSearchResults([]);
            setSelectedUser(null);
            setGroupDetails(null);
        }
    }, [open]);

    const handleSearchUsers = async (query: string) => {
        if (query.length < 3) {
            setUserSearchResults([]);
            return;
        }

        setIsSearchingUsers(true);
        try {
            const response = await api.get(`${apiBaseUrl}/auth/users/search?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();

                // Filter out current user, existing members, and invited users
                const filteredResults = data.filter((user: User) => {
                    // Don't show current user
                    if (user.id === loginInfo?.id) {
                        return false;
                    }

                    // Don't show if already a member or admin
                    if (groupDetails) {
                        const isMember = groupDetails.members?.some((m: any) => m.id === user.id);
                        const isAdmin = groupDetails.admins?.some((a: any) => a.id === user.id);
                        const isInvited = groupDetails.invited?.some((i: any) => i.id === user.id);

                        if (isMember || isAdmin || isInvited) {
                            return false;
                        }
                    }

                    return true;
                });

                setUserSearchResults(filteredResults);
            }
        } catch (error) {
            console.error('Failed to search users', error);
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Impossible de recercher un utilisateur!'
            });    
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleInviteUser = async () => {
        if (!selectedUser || !groupId) return;

        try {
            const response = await api.post(`${apiBaseUrl}/group/${groupId}/invite`, { userId: selectedUser.id });
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Invitation envoyée !'
                });
                if (onUserInvited) {
                    onUserInvited();
                }
            } else {
                const errorText = await response.text();
                console.error(`Cannot invite user: ${errorText}`);
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: Impossible d'inviter cette personne.`
                });
            }
        } catch (error) {
            console.error('Failed to invite user', error);
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Erreur lors de l\'invitation.'
            });
        }
    };

    return (
        <BottomDialog
            open={open}
            handleClose={onClose}
            title="Inviter un utilisateur"
            contents={
                <Box sx={{ px: 2 }}>
                    <Typography variant="caption" gutterBottom sx={{ display: 'block', mb: 2 }}>
                        Recherchez un utilisateur par nom, prénom, email ou nom d'utilisateur.
                    </Typography>
                    <Autocomplete
                        sx={{ mb: 2 }}
                        options={userSearchResults}
                        getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`}
                        loading={isSearchingUsers}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Rechercher un utilisateur"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {isSearchingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        onInputChange={(_, newInputValue) => {
                            handleSearchUsers(newInputValue);
                        }}
                        onChange={(_, newValue) => {
                            setSelectedUser(newValue);
                        }}
                        filterOptions={(x) => x}
                        noOptionsText="Aucun utilisateur trouvé"
                    />
                </Box>
            }
            actions={[
                {
                    icon: <PersonAdd />,
                    label: 'Inviter',
                    onClick: handleInviteUser,
                    disabled: !selectedUser || isSearchingUsers,
                },
                {
                    icon: <Close />,
                    label: 'Annuler',
                    onClick: onClose,
                },
            ]}
        />
    );
};

export default InviteUserDialog;
