import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    Autocomplete,
    CircularProgress,
    Button,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import Meta from '@/components/Meta';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import useNotifications from '@/store/notifications';
import { LoginContext } from '@/LoginContext';
import { TribeList, TribeDetails } from '@/components/Tribes';
import BottomDialog from '@/components/BottomDialog/BottomDialog';

interface Group {
    id: string;
    name: string;
    adminId: string;
    admin?: {
        id: string;
        username: string;
        firstname: string;
        lastname: string;
    };
    createdAt: Date;
    updatedAt: Date;
    groupMemberships?: GroupMembership[];
}

interface GroupMembership {
    id: string;
    groupId: string;
    userId: string;
    status: 'INVITED' | 'REQUESTED' | 'MEMBER' | 'REJECTED';
}

export function TribesPage() {
    const [myTribes, setMyTribes] = useState<Group[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTribeName, setNewTribeName] = useState('');
    const api = useAuthenticatedApi();
    const { loginInfo } = useContext(LoginContext);
    const [, notificationsActions] = useNotifications();

    const fetchMyTribes = async () => {
        try {
            const response = await api.get(`${apiBaseUrl}/group`);
            if (response.ok) {
                const data = await response.json();
                console.log(JSON.stringify(data, null, 4));
                setMyTribes(data);
            }
        } catch (error) {
            console.error('Failed to fetch tribes', error);
        }
    };

    // Tribe details state
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedTribeDetails, setSelectedTribeDetails] = useState<any | null>(null);

    const handleViewDetails = async (groupId: string) => {
        try {
            const response = await api.get(`${apiBaseUrl}/group/${groupId}/details`);
            if (response.ok) {
                const data = await response.json();

                console.log(JSON.stringify(data, null, 4));

                setSelectedTribeDetails(data);
                setDetailsDialogOpen(true);
            } else {
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: 'Impossible de charger les détails de la tribu.'
                });
            }
        } catch (error) {
            console.error('Failed to fetch tribe details', error);
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Erreur lors du chargement des détails.'
            });
        }
    };

    const handleCloseDetails = () => {
        setDetailsDialogOpen(false);
        setSelectedTribeDetails(null);
    };

    useEffect(() => {
        fetchMyTribes();
    }, []);

    const handleCreateTribe = async () => {
        if (!newTribeName.trim()) return;
        try {
            const response = await api.post(`${apiBaseUrl}/group`, { name: newTribeName });
            if (response.ok) {
                setCreateDialogOpen(false);
                setNewTribeName('');
                fetchMyTribes();
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Tribu créée avec succès !'
                });
            } else {
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: 'Erreur lors de la création de la tribu.'
                });
            }
        } catch (error) {
            console.error('Failed to create tribe', error);
        }
    };

    const handleAcceptInvite = async (membershipId: string) => {
        try {
            const response = await api.post(`${apiBaseUrl}/group/membership/${membershipId}/accept-invite`, {});
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Invitation acceptée !'
                });
                fetchMyTribes();
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to accept invite', error);
        }
    };

    const handleRejectInvite = async (membershipId: string) => {
        try {
            const response = await api.post(`${apiBaseUrl}/group/membership/${membershipId}/reject-invite`, {});
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'info' },
                    message: 'Invitation refusée.'
                });
                fetchMyTribes();
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to reject invite', error);
        }
    };

    const handleLeaveTribe = async (groupId: string) => {
        if (!confirm('Voulez-vous vraiment quitter cette tribu ?')) return;
        try {
            const response = await api.post(`${apiBaseUrl}/group/${groupId}/leave`, {});
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Vous avez quitté la tribu.'
                });
                fetchMyTribes();
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to leave tribe', error);
        }
    };

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteUserQuery, setInviteUserQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedUserToInvite, setSelectedUserToInvite] = useState<any | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleOpenInvite = (groupId: string) => {
        setSelectedGroupId(groupId);
        setInviteUserQuery('');
        setUserSearchResults([]);
        setSelectedUserToInvite(null);
        setInviteDialogOpen(true);
    };

    const handleSearchUsers = async (query: string) => {
        setInviteUserQuery(query);
        if (query.length < 3) {
            setUserSearchResults([]);
            return;
        }
        setIsSearchingUsers(true);
        try {
            const response = await api.get(`${apiBaseUrl}/auth/users/search?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setUserSearchResults(data);
            }
        } catch (error) {
            console.error('Failed to search users', error);
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleInviteUser = async () => {
        if (!selectedUserToInvite || !selectedGroupId) return;
        try {
            const response = await api.post(`${apiBaseUrl}/group/${selectedGroupId}/invite`, { userId: selectedUserToInvite.id });
            if (response.ok) {
                setInviteDialogOpen(false);
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Invitation envoyée !'
                });
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to invite user', error);
        }
    };

    const handleDeleteInvitation = async (membershipId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette invitation ?')) return;
        try {
            const response = await api.delete(`${apiBaseUrl}/group/membership/${membershipId}`);
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Invitation supprimée !'
                });
                // Refresh both the tribe list and details
                fetchMyTribes();
                if (selectedTribeDetails) {
                    const detailsResponse = await api.get(`${apiBaseUrl}/group/${selectedTribeDetails.id}/details`);
                    if (detailsResponse.ok) {
                        const data = await detailsResponse.json();
                        setSelectedTribeDetails(data);
                    }
                }
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to delete invitation', error);
        }
    };

    const handleDeleteTribe = async (groupId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette tribu ? Tous les membres seront retirés et cette action est irréversible.')) return;
        try {
            const response = await api.delete(`${apiBaseUrl}/group/${groupId}`);
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Tribu supprimée avec succès !'
                });
                // Close details dialog if the deleted tribe was being viewed
                if (selectedTribeDetails?.id === groupId) {
                    setDetailsDialogOpen(false);
                    setSelectedTribeDetails(null);
                }
                // Refresh the tribe list
                fetchMyTribes();
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to delete tribe', error);
        }
    };

    return (
        <ProtectedRoute>
            <Meta title="Tribus" />
            <FullSizeTopCenteredFlexBox>
                <TribeList
                    tribes={myTribes}
                    currentUserId={loginInfo?.id}
                    onAcceptInvite={handleAcceptInvite}
                    onRejectInvite={handleRejectInvite}
                    onLeaveTribe={handleLeaveTribe}
                    onInviteUser={handleOpenInvite}
                    onDeleteTribe={handleDeleteTribe}
                    onViewDetails={handleViewDetails}
                />
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{ position: 'absolute', bottom: 16, right: 16 }}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <AddIcon />
                </Fab>

                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
                    <DialogTitle>Créer une nouvelle tribu</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nom de la tribu"
                            fullWidth
                            variant="standard"
                            value={newTribeName}
                            onChange={(e) => setNewTribeName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateTribe}>Créer</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Inviter un utilisateur</DialogTitle>
                    <DialogContent>
                        <Typography variant="caption" gutterBottom>
                            Recherchez un utilisateur par nom, prénom, email ou nom d'utilisateur.
                        </Typography>
                        <Autocomplete
                            options={userSearchResults}
                            getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`}
                            loading={isSearchingUsers}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Rechercher un utilisateur"
                                    variant="standard"
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
                                setSelectedUserToInvite(newValue);
                            }}
                            filterOptions={(x) => x}
                            noOptionsText="Aucun utilisateur trouvé"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setInviteDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleInviteUser} disabled={!selectedUserToInvite || isSearchingUsers}>Inviter</Button>
                    </DialogActions>
                </Dialog>

                <BottomDialog
                    open={detailsDialogOpen}
                    handleClose={handleCloseDetails}
                    title={selectedTribeDetails?.name || 'Détails de la tribu'}
                    contents={
                        <TribeDetails
                            tribeDetails={selectedTribeDetails}
                            currentUserId={loginInfo?.id}
                            onDeleteInvitation={handleDeleteInvitation}
                        />
                    }
                />

            </FullSizeTopCenteredFlexBox>
        </ProtectedRoute>
    );
};
