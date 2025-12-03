import React, { useState, useEffect } from 'react';
import BottomDialog from '@/components/BottomDialog/BottomDialog';
import ActionSheet from '@/components/ActionSheet/ActionSheet';
import TribeDetails from './TribeDetails';
import { TribeDetailsData } from './types';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';

interface TribeDetailsDialogProps {
    open: boolean;
    groupId: string | null;
    currentUserId?: string;
    onClose: () => void;
    onDetailsChanged?: () => void;
}

const TribeDetailsDialog: React.FC<TribeDetailsDialogProps> = ({
    open,
    groupId,
    currentUserId,
    onClose,
    onDetailsChanged,
}) => {
    const [tribeDetails, setTribeDetails] = useState<TribeDetailsData | null>(null);
    const [deleteInvitationConfirmOpen, setDeleteInvitationConfirmOpen] = useState(false);
    const [pendingMembershipId, setPendingMembershipId] = useState<string | null>(null);
    const api = useAuthenticatedApi();
    const [, notificationsActions] = useNotifications();

    // Fetch tribe details when dialog opens or groupId changes
    useEffect(() => {
        if (open && groupId) {
            fetchTribeDetails();
        }
    }, [open, groupId]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setTribeDetails(null);
            setPendingMembershipId(null);
        }
    }, [open]);

    const fetchTribeDetails = async () => {
        if (!groupId) return;

        try {
            const response = await api.get(`${apiBaseUrl}/group/${groupId}/details`);
            if (response.ok) {
                const data = await response.json();
                setTribeDetails(data);
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
                // Refresh tribe details
                await fetchTribeDetails();
                if (onDetailsChanged) {
                    onDetailsChanged();
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
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Erreur lors de la suppression.'
            });
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
                // Refresh tribe details
                await fetchTribeDetails();
                if (onDetailsChanged) {
                    onDetailsChanged();
                }
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

    return (
        <>
            <BottomDialog
                open={open}
                handleClose={onClose}
                title={tribeDetails?.name || 'Détails de la tribu'}
                contents={
                    <TribeDetails
                        tribeDetails={tribeDetails}
                        currentUserId={currentUserId}
                        onDeleteInvitation={handleDeleteInvitation}
                        onChangeMembershipStatus={handleChangeMembershipStatus}
                    />
                }
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
        </>
    );
};

export default TribeDetailsDialog;
