import React, { useState } from 'react';
import { TextField, FormControl, Box } from '@mui/material';
import BottomDialog from '@/components/BottomDialog/BottomDialog';
import { Check } from '@mui/icons-material';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';

interface CreateTribeDialogProps {
    open: boolean;
    onClose: () => void;
    onTribeCreated?: () => void;
}

const CreateTribeDialog: React.FC<CreateTribeDialogProps> = ({
    open,
    onClose,
    onTribeCreated,
}) => {
    const [tribeName, setTribeName] = useState('');
    const api = useAuthenticatedApi();
    const [, notificationsActions] = useNotifications();

    const handleCreateTribe = async () => {
        if (!tribeName.trim()) return;

        try {
            const response = await api.post(`${apiBaseUrl}/group`, { name: tribeName });
            if (response.ok) {
                notificationsActions.push({
                    options: { variant: 'success' },
                    message: 'Tribu créée avec succès !'
                });
                setTribeName('');
                onClose();
                if (onTribeCreated) {
                    onTribeCreated();
                }
            } else {
                notificationsActions.push({
                    options: { variant: 'error' },
                    message: 'Erreur lors de la création de la tribu.'
                });
            }
        } catch (error) {
            console.error('Failed to create tribe', error);
            notificationsActions.push({
                options: { variant: 'error' },
                message: 'Erreur lors de la création de la tribu.'
            });
        }
    };

    const handleClose = () => {
        setTribeName('');
        onClose();
    };

    return (
        <BottomDialog
            open={open}
            handleClose={handleClose}
            title="Créer une nouvelle tribu"
            contents={
                <Box sx={{ px: 2 }}>
                    <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                        <TextField
                            autoFocus
                            label="Nom de la tribu"
                            fullWidth
                            value={tribeName}
                            onChange={(e) => setTribeName(e.target.value)}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter' && tribeName.trim()) {
                                    handleCreateTribe();
                                }
                            }}
                        />
                    </FormControl>
                </Box>
            }
            actions={[
                {
                    icon: <Check />,
                    label: 'Créer',
                    onClick: handleCreateTribe,
                    disabled: !tribeName.trim(),
                    isPrimary: true,
                },
            ]}
        />
    );
};

export default CreateTribeDialog;
