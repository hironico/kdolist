import React, { useContext, useEffect, useState } from 'react';
import {
  FormControl,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
  Collapse,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import useNotifications from '@/store/notifications';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { VerticalFlexBox } from '../styled';
import BottomDialog, { BottomDialogAction } from '../BottomDialog/BottomDialog';

export interface TribeOption {
  id: string;
  name: string;
}

export interface ListEditorFormProps {
  open: boolean;
  onClose: () => void;
  onListSaved: (giftList: GiftList) => void;
  userTribes?: TribeOption[];
}

const ListEditorForm: React.FC<ListEditorFormProps> = ({
  open,
  onClose,
  onListSaved,
  userTribes = [],
}) => {
  const [listName, setListName] = useState('');
  const [listNameError, setListNameError] = useState(false);
  const [listNameErrorMessage, setListNameErrorMessage] = useState('');
  const [showTakenToOwner, setShowTakenToOwner] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();
  const api = useAuthenticatedApi();

  // Initialise form values when the selected list changes or the dialog opens
  useEffect(() => {
    const list = appContext.giftList;
    setListName(list?.name ?? '');
    setShowTakenToOwner(list?.showTakenToOwner ?? false);
    setIsCollaborative(list?.isCollaborative ?? false);
    setSelectedGroupIds(list?.groupAccesses?.map(ga => ga.groupId) ?? []);
    setListNameError(false);
    setListNameErrorMessage('');
  }, [appContext.giftList, open]);

  const isEditing = Boolean(appContext.giftList?.id && appContext.giftList.id !== '');
  const dialogTitle = isEditing ? (appContext.giftList?.name ?? 'Modifier la liste') : 'Nouvelle liste';

  const newGiftList = (): GiftList => ({
    id: '',
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: '',
  });

  const toggleTribe = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    if (listName.trim() === '') {
      setListNameError(true);
      setListNameErrorMessage('Il faut saisir un nom...');
      return;
    }

    if (appContext.loginInfo.id === null || isSaving) return;

    setIsSaving(true);

    try {
      const giftList = appContext.giftList ?? newGiftList();
      giftList.name = listName;
      giftList.showTakenToOwner = showTakenToOwner;
      giftList.isCollaborative = isCollaborative;

      const response = await api.post(`${apiBaseUrl}/giftlist`, {
        id: appContext.giftList?.id ?? null,
        name: listName,
        showTakenToOwner,
        isCollaborative,
        groupIds: isCollaborative ? selectedGroupIds : [],
      });

      if (!response.ok) {
        notificationsActions.push({
          options: { variant: 'error' },
          message: 'Impossible de créer cette liste pour le moment.',
        });
      } else {
        onListSaved(giftList);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onListNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListNameError(false);
    setListNameErrorMessage('');
    setListName(event.target.value);
  };

  const actions: BottomDialogAction[] = [
    {
      icon: isSaving ? <CircularProgress size={24} /> : <CheckIcon />,
      label: 'OK',
      onClick: handleSave,
      disabled: isSaving,
      isPrimary: true,
    },
  ];

  const formContent = (
    <Box sx={{ px: 2 }}>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Nom de la liste:"
          value={listName}
          onChange={onListNameChange}
          error={listNameError}
          helperText={listNameErrorMessage}
          autoFocus
        />
      </FormControl>

      {/* Show taken to owner toggle */}
      <FormControlLabel
        sx={{ mb: '10px', ml: '0px' }}
        control={
          <Switch
            sx={{ height: '42px', width: '64px' }}
            checked={showTakenToOwner}
            onChange={(e) => setShowTakenToOwner(e.target.checked)}
            color="primary"
          />
        }
        label={
          <VerticalFlexBox sx={{ height: 'auto', ml: '5px' }}>
            <Typography variant="subtitle1">Voir les cadeaux rayés</Typography>
            <Typography variant="caption">Pour les séries et les collections, mais ca gâche la surprise!</Typography>
          </VerticalFlexBox>
        }
      />

      {/* Collaborative toggle */}
      <FormControlLabel
        sx={{ mb: '10px', ml: '0px' }}
        control={
          <Switch
            sx={{ height: '42px', width: '64px' }}
            checked={isCollaborative}
            onChange={(e) => {
              setIsCollaborative(e.target.checked);
              if (!e.target.checked) setSelectedGroupIds([]);
            }}
            color="primary"
          />
        }
        label={
          <VerticalFlexBox sx={{ height: 'auto', ml: '5px' }}>
              <Typography variant="subtitle1">Liste collaborative</Typography>
              <Typography variant="caption">Permets à des tribus d'ajouter et modifier des cadeaux.</Typography>
            </VerticalFlexBox>
        }
      />

      {/* Tribe selector — visible only when collaborative is on */}
      <Collapse in={isCollaborative}>
        {userTribes.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Tu ne fais partie d'aucune tribu pour le moment.
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Tribus autorisées à modifier cette liste :
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userTribes.map(tribe => (
                <Chip
                  key={tribe.id}
                  label={tribe.name}
                  onClick={() => toggleTribe(tribe.id)}
                  color={selectedGroupIds.includes(tribe.id) ? 'primary' : 'default'}
                  variant={selectedGroupIds.includes(tribe.id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );

  return (
    <BottomDialog
      open={open}
      handleClose={onClose}
      title={dialogTitle}
      actions={actions}
      contents={formContent}
      disableBackdropClick={isSaving}
    />
  );
};

export default ListEditorForm;
