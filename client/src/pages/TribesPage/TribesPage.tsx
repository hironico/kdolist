import React, { useState, useEffect, useContext } from 'react';
import { Slide } from '@mui/material';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import Meta from '@/components/Meta';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import useNotifications from '@/store/notifications';
import { LoginContext } from '@/LoginContext';
import {
    TribeList,
    TribesFAB,
    Group,
    CreateTribeDialog,
    InviteUserDialog,
    TribeDetailsDialog
} from '@/components/Tribes';
import ActionSheet from '@/components/ActionSheet/ActionSheet';

export function TribesPage() {
    const [myTribes, setMyTribes] = useState<Group[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const api = useAuthenticatedApi();
    const { loginInfo } = useContext(LoginContext);
    const [, notificationsActions] = useNotifications();

    // ActionSheet states
    const [leaveTribeConfirmOpen, setLeaveTribeConfirmOpen] = useState(false);
    const [deleteTribeConfirmOpen, setDeleteTribeConfirmOpen] = useState(false);
    const [pendingTribeId, setPendingTribeId] = useState<string | null>(null);

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
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleViewDetails = (groupId: string) => {
        setSelectedGroupId(groupId);
        setDetailsDialogOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsDialogOpen(false);
        setSelectedGroupId(null);
    };

    useEffect(() => {
        fetchMyTribes();
    }, []);

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

    // Invite dialog state
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);

    const handleOpenInvite = (groupId: string) => {
        setInviteGroupId(groupId);
        setInviteDialogOpen(true);
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
                if (selectedGroupId === pendingTribeId) {
                    setDetailsDialogOpen(false);
                    setSelectedGroupId(null);
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
            <Slide direction="left" in={true} timeout={500}>
                <FullSizeTopCenteredFlexBox>
                    <TribeList
                        tribes={
                          searchQuery.trim()
                            ? myTribes.filter(t =>
                                t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
                              )
                            : myTribes
                        }
                        currentUserId={loginInfo?.id}
                        onAcceptInvite={handleAcceptInvite}
                        onRejectInvite={handleRejectInvite}
                        onLeaveTribe={handleLeaveTribe}
                        onInviteUser={handleOpenInvite}
                        onDeleteTribe={handleDeleteTribe}
                        onViewDetails={handleViewDetails}
                    />
                    <TribesFAB
                        handleAdd={() => setCreateDialogOpen(true)}
                        onSearchChange={setSearchQuery}
                    />

                    <CreateTribeDialog
                        open={createDialogOpen}
                        onClose={() => setCreateDialogOpen(false)}
                        onTribeCreated={fetchMyTribes}
                    />

                    <InviteUserDialog
                        open={inviteDialogOpen}
                        groupId={inviteGroupId}
                        onClose={() => setInviteDialogOpen(false)}
                        onUserInvited={fetchMyTribes}
                    />

                    <TribeDetailsDialog
                        open={detailsDialogOpen}
                        groupId={selectedGroupId}
                        currentUserId={loginInfo?.id}
                        onClose={handleCloseDetails}
                        onDetailsChanged={fetchMyTribes}
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
            </Slide>
        </ProtectedRoute>
    );
};
