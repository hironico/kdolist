import React, { useState } from 'react';
import { FormControl, TextField, Button } from '@mui/material';

export interface ListEditorFormProps {
  onCreateList: (name: string) => void;
}

const ListEditorForm: React.FC<ListEditorFormProps> = ({ onCreateList }) => {
  const [listName, setListName] = useState('');
  const [listNameError, setListNameError] = useState(false);
  const [listNameErrorMessage, setListNameErrorMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (listName.trim() === '') {
      setListNameError(true);
      setListNameErrorMessage('Il faut saisir un nom...');
      return;
    }

    onCreateList(listName);
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
      <Button type="submit" variant="contained" color="primary" sx={{ width: '100%' }}>
        Créer
      </Button>
    </form>
  );
};

export default ListEditorForm;
