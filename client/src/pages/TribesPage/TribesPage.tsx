import React, { useState, useEffect, useContext } from 'react';
import {
    TextField,
    Autocomplete,
    CircularProgress,
    Button,
    Typography,
    Fab,
    FormControl,
} from '@mui/material';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import Meta from '@/components/Meta';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { FlexBox, FullSizeTopCenteredFlexBox } from '@/components/styled';
import useNotifications from '@/store/notifications';
import { LoginContext } from '@/LoginContext';
import { TribeList, TribeDetails, Group, GroupMembership } from '@/components/Tribes';
import BottomDialog from '@/components/BottomDialog/BottomDialog';
import ActionSheet from '@/components/ActionSheet/ActionSheet';
import { GroupAdd, Check, Close, PersonAdd } from '@mui/icons-material';

export function TribesPage() {
    const [myTribes, setMyTribes] = useState<Group[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTribeName, setNewTribeName] = useState('');
    const api = useAuthenticatedApi();
    const { loginInfo } = useContext(LoginContext);
    const [, notificationsActions] = useNotifications();

    // ActionSheet states
    const [leaveTribeConfirmOpen, setLeaveTribeConfirmOpen] = useState(false);
    const [deleteTribeConfirmOpen, setDeleteTribeConfirmOpen] = useState(false);
    const [deleteInvitationConfirmOpen, setDeleteInvitationConfirmOpen] = useState(false);
    const [pendingTribeId, setPendingTribeId] = useState<string | null>(null);
    const [pendingMembershipId, setPendingMembershipId] = useState<string | null>(null);

    const fetchMyTribes = async () => {
        try {
            const response = await api.get(`${apiBaseUrl}/group`);
            if (response.ok) {
                const data = await response.json();
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

    const handleLeaveTribe = (groupId: string) => {
        setPendingTribeId(groupId);
        setLeaveTribeConfirmOpen(true);
    };

    const confirmLeaveTribe = async () => {
        if (!pendingTribeId) return;
        setLeaveTribeConfirmOpen(false);
        try {
            const response = await api.post(`${apiBaseUrl}/group/${pendingTribeId}/leave`, {});
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
        } finally {
            setPendingTribeId(null);
        }
    };

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteUserQuery, setInviteUserQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedUserToInvite, setSelectedUserToInvite] = useState<any | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState<any | null>(null);

    const handleOpenInvite = async (groupId: string) => {
        setSelectedGroupId(groupId);
        setInviteUserQuery('');
        setUserSearchResults([]);
        setSelectedUserToInvite(null);

        // Fetch group details to get current members and invited users
        try {
            const response = await api.get(`${apiBaseUrl}/group/${groupId}/details`);
            if (response.ok) {
                const data = await response.json();
                setSelectedGroupDetails(data);
            }
        } catch (error) {
            console.error('Failed to fetch group details for invite', error);
        }

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

                // Filter out current user, existing members, and invited users
                const filteredResults = data.filter((user: any) => {
                    // Don't show current user
                    if (user.id === loginInfo?.id) {
                        return false;
                    }

                    // Don't show if already a member or admin
                    if (selectedGroupDetails) {
                        const isMember = selectedGroupDetails.members?.some((m: any) => m.id === user.id);
                        const isAdmin = selectedGroupDetails.admins?.some((a: any) => a.id === user.id);
                        const isInvited = selectedGroupDetails.invited?.some((i: any) => i.id === user.id);

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

    const handleDeleteInvitation = (membershipId: string) => {
        setPendingMembershipId(membershipId);
        setDeleteInvitationConfirmOpen(true);
    };

    const confirmDeleteInvitation = async () => {
        if (!pendingMembershipId) return;
        setDeleteInvitationConfirmOpen(false);
        try {
            const response = await api.delete(`${apiBaseUrl}/group/membership/${pendingMembershipId}`);
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
        } finally {
            setPendingMembershipId(null);
        }
    };

    const handleChangeMembershipStatus = async (membershipId: string, newStatus: 'ADMIN' | 'MEMBER') => {
        try {
            const response = await api.patch(`${apiBaseUrl}/group/membership/${membershipId}/status`, { status: newStatus });
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: newStatus === 'ADMIN' ? 'Membre promu administrateur !' : 'Administrateur rétrogradé en membre.'
                });
                // Refresh the tribe details
                if (selectedTribeDetails) {
                    const detailsResponse = await api.get(`${apiBaseUrl}/group/${selectedTribeDetails.id}/details`);
                    if (detailsResponse.ok) {
                        const data = await detailsResponse.json();
                        setSelectedTribeDetails(data);
                    }
                }
                // Also refresh the tribe list
                fetchMyTribes();
            } else {
                const errorText = await response.text();
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: `Erreur: ${errorText}`
                });
            }
        } catch (error) {
            console.error('Failed to change membership status', error);
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Erreur lors du changement de statut.'
            });
        }
    };

    const handleDeleteTribe = (groupId: string) => {
        setPendingTribeId(groupId);
        setDeleteTribeConfirmOpen(true);
    };

    const confirmDeleteTribe = async () => {
        if (!pendingTribeId) return;
        setDeleteTribeConfirmOpen(false);
        try {
            const response = await api.delete(`${apiBaseUrl}/group/${pendingTribeId}`);
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Tribu supprimée avec succès !'
                });
                // Close details dialog if the deleted tribe was being viewed
                if (selectedTribeDetails?.id === pendingTribeId) {
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
        } finally {
            setPendingTribeId(null);
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
                <FlexBox flexDirection={'row'} justifyContent={'center'} sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, zIndex: 1000 }}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <GroupAdd />
                    </Fab>
                </FlexBox>

                <BottomDialog
                    open={createDialogOpen}
                    handleClose={() => setCreateDialogOpen(false)}
                    title="Créer une nouvelle tribu"
                    contents={
                        <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                            <TextField
                                autoFocus
                                label="Nom de la tribu"
                                fullWidth
                                value={newTribeName}
                                onChange={(e) => setNewTribeName(e.target.value)}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter' && newTribeName.trim()) {
                                        handleCreateTribe();
                                    }
                                }}
                            />
                        </FormControl>
                    }
                    actions={[
                        {
                            icon: <Close />,
                            label: 'Annuler',
                            onClick: () => setCreateDialogOpen(false),
                        },
                        {
                            icon: <Check />,
                            label: 'Créer',
                            onClick: handleCreateTribe,
                            disabled: !newTribeName.trim(),
                        },
                    ]}
                />

                <BottomDialog
                    open={inviteDialogOpen}
                    handleClose={() => setInviteDialogOpen(false)}
                    title="Inviter un utilisateur"
                    contents={
                        <>
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
                                    setSelectedUserToInvite(newValue);
                                }}
                                filterOptions={(x) => x}
                                noOptionsText="Aucun utilisateur trouvé"
                            />
                        </>
                    }
                    actions={[
                        {
                            icon: <Close />,
                            label: 'Annuler',
                            onClick: () => setInviteDialogOpen(false),
                        },
                        {
                            icon: <PersonAdd />,
                            label: 'Inviter',
                            onClick: handleInviteUser,
                            disabled: !selectedUserToInvite || isSearchingUsers,
                        },
                    ]}
                />

                <BottomDialog
                    open={detailsDialogOpen}
                    handleClose={handleCloseDetails}
                    title={selectedTribeDetails?.name || 'Détails de la tribu'}
                    contents={
                        <TribeDetails
                            tribeDetails={selectedTribeDetails}
                            currentUserId={loginInfo?.id}
                            onDeleteInvitation={handleDeleteInvitation}
                            onChangeMembershipStatus={handleChangeMembershipStatus}
                        />
                    }
                />

                {/* Leave Tribe Confirmation */}
                <ActionSheet
                    open={leaveTribeConfirmOpen}
                    handleClose={() => setLeaveTribeConfirmOpen(false)}
                    entries={[
                        {
                            label: 'Oui, quitter la tribu',
                            color: 'error',
                            onAction: confirmLeaveTribe,
                        },
                    ]}
                    defaultEntry={{
                        label: 'En fait, non',
                        color: 'primary',
                        onAction: () => setLeaveTribeConfirmOpen(false),
                    }}
                    message="Vraiment quitter cette tribu ?"
                />

                {/* Delete Invitation Confirmation */}
                <ActionSheet
                    open={deleteInvitationConfirmOpen}
                    handleClose={() => setDeleteInvitationConfirmOpen(false)}
                    entries={[
                        {
                            label: 'Oui, supprimer l\'invitation',
                            color: 'error',
                            onAction: confirmDeleteInvitation,
                        },
                    ]}
                    defaultEntry={{
                        label: 'Oublie ça',
                        color: 'primary',
                        onAction: () => setDeleteInvitationConfirmOpen(false),
                    }}
                    message="Vraiment supprimer cette invitation ?"
                />

                {/* Delete Tribe Confirmation */}
                <ActionSheet
                    open={deleteTribeConfirmOpen}
                    handleClose={() => setDeleteTribeConfirmOpen(false)}
                    entries={[
                        {
                            label: 'Oui, supprimer la tribu',
                            color: 'error',
                            onAction: confirmDeleteTribe,
                        },
                    ]}
                    defaultEntry={{
                        label: 'Laisses tomber',
                        color: 'primary',
                        onAction: () => setDeleteTribeConfirmOpen(false),
                    }}
                    message="Vaiment supprimer cette tribu ? Tous les membres seront retirés et cette action est irréversible."
                />

            </FullSizeTopCenteredFlexBox>
        </ProtectedRoute>
    );
};
