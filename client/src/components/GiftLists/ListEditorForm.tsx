import React, { useContext, useEffect, useState } from 'react';
import {
  FormControl,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
  Collapse,
} from '@mui/material';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import useNotifications from '@/store/notifications';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { VerticalFlexBox } from '../styled';

export interface TribeOption {
  id: string;
  name: string;
}

export interface ListEditorFormProps {
  onListSaved: (giftList: GiftList) => void;
  userTribes?: TribeOption[];
}

const ListEditorForm: React.FC<ListEditorFormProps> = ({ onListSaved, userTribes = [] }) => {
  const [listName, setListName] = useState('');
  const [listNameError, setListNameError] = useState(false);
  const [listNameErrorMessage, setListNameErrorMessage] = useState('');
  const [showTakenToOwner, setShowTakenToOwner] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();
  const api = useAuthenticatedApi();

  // Initialise form values when the selected list changes
  useEffect(() => {
    const list = appContext.giftList;
    setListName(list?.name ?? '');
    setShowTakenToOwner(list?.showTakenToOwner ?? false);
    setIsCollaborative(list?.isCollaborative ?? false);
    setSelectedGroupIds(list?.groupAccesses?.map(ga => ga.groupId) ?? []);
  }, [appContext.giftList]);

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

  const saveList = async (name: string) => {
    if (appContext.loginInfo.id === null) {
      throw new Error('Must be logged in to save gift list.');
    }

    const giftList = appContext.giftList ?? newGiftList();
    giftList.name = name;
    giftList.showTakenToOwner = showTakenToOwner;
    giftList.isCollaborative = isCollaborative;

    const response = await api.post(`${apiBaseUrl}/giftlist`, {
      id: appContext.giftList?.id ?? null,
      name,
      showTakenToOwner,
      isCollaborative,
      groupIds: isCollaborative ? selectedGroupIds : [],
    });

    if (!response.ok) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Impossible de créer cette liste pour le moment.',
      });
    }

    onListSaved(giftList);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (listName.trim() === '') {
      setListNameError(true);
      setListNameErrorMessage('Il faut saisir un nom...');
      return;
    }

    saveList(listName);
    setListName('');
  };

  const onListNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListNameError(false);
    setListNameErrorMessage('');
    setListName(event.target.value);
  };

  return (
    <Box sx={{ px: 2 }}>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Nom de la liste:"
            value={listName}
            onChange={(e) => onListNameChange(e)}
            error={listNameError}
            helperText={listNameErrorMessage}
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

        <Button type="submit" variant="contained" color="primary" sx={{ width: '100%', mb: '15px' }}>
          Enregistrer
        </Button>
      </form>
    </Box>
  );
};

export default ListEditorForm;
