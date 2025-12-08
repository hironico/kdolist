import React, { useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button, FormControlLabel, Switch, Typography, Box, Grid } from '@mui/material';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import useNotifications from '@/store/notifications';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { CenteredVerticalFlexBox, VerticalFlexBox } from '../styled';


export interface ListEditorFormProps {
  onListSaved: (giftList: GiftList) => void
}

const ListEditorForm: React.FC<ListEditorFormProps> = ({ onListSaved }) => {
  const [listName, setListName] = useState('');
  const [listNameError, setListNameError] = useState(false);
  const [listNameErrorMessage, setListNameErrorMessage] = useState('');
  const [showTakenToOwner, setShowTakenToOwner] = useState(false);
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();
  const api = useAuthenticatedApi();

  // init of the form values and title
  useEffect(() => {
    setListName(appContext.giftList !== null ? appContext.giftList.name : '');
    setShowTakenToOwner(appContext.giftList?.showTakenToOwner ?? false);
  }, [appContext.giftList]);

  const newGiftList = (): GiftList => {
    const list: GiftList = {
      id: '',
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: '' // useless in this case because we use the JWT to get recognized by the server
    };
    return list;
  }

  const saveList = async (name: string) => {
    if (appContext.loginInfo.id === null) {
      console.error('Cannot save gift list since user seems not to be logged in.');
      throw new Error('Must be logged in to save gift list.');
    }

    // if appcontext list is null then we create a new one else we use that list to update
    const giftList = appContext.giftList === null ? newGiftList() : appContext.giftList;
    giftList.name = name;
    giftList.showTakenToOwner = showTakenToOwner;

    const response = await api.post(`${apiBaseUrl}/giftlist`, {
      id: appContext.giftList === null ? null : appContext.giftList.id,
      name: name,
      showTakenToOwner: showTakenToOwner,
    });

    if (!response.ok) {
      notificationsActions.push({
        options: {
          variant: 'error',
        },
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
          label={<VerticalFlexBox sx={{ height: 'auto', ml: '5px' }}>
            <Typography variant='subtitle1'>Voir les cadeaux rayés</Typography>
            <Typography variant='caption'>Pour les séries et les collections, mais ca gâche la surprise!</Typography>
          </VerticalFlexBox>

          } />

        <Button type="submit" variant="contained" color="primary" sx={{ width: '100%', mb: '15px' }}>
          Enregistrer
        </Button>
      </form>
    </Box>
  );
};

export default ListEditorForm;
