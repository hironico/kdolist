import React, { useContext, useEffect, useState } from 'react';
import { FormControl, TextField, Button } from '@mui/material';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import useNotifications from '@/store/notifications';


export interface ListEditorFormProps {
  onListSaved: (giftList: GiftList) => void
}

const ListEditorForm: React.FC<ListEditorFormProps> = ({ onListSaved }) => {
  const [listName, setListName] = useState('');
  const [listNameError, setListNameError] = useState(false);
  const [listNameErrorMessage, setListNameErrorMessage] = useState('');
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  // init of the form values and title
  useEffect(() => {
    setListName(appContext.giftList !== null ? appContext.giftList.name : '');
  }, []);

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

    const response = await fetch(`${apiBaseUrl}/giftlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
      body: JSON.stringify({
        id: appContext.giftList === null ? null : appContext.giftList.id,
        name: name,
      }),
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
      <Button type="submit" variant="contained" color="primary" sx={{ width: '100%', mb: '15px' }}>
        Créer
      </Button>
    </form>
  );
};

export default ListEditorForm;
