import React, { useState, useEffect } from 'react';
import { DialogContentText, TextField, Button } from '@mui/material';
import BottomDialog from '../BottomDialog/BottomDialog';
import { GiftLink } from '@/LoginContext';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: GiftLink) => void; 
}

const GiftLinkEditorModal: React.FC<ModalProps> = ({ open, onClose, onSave }) => {
  const [nom, setNom] = useState('');
  const [lien, setLien] = useState('');
  const [canPaste, setCanPaste] = useState(false);

  useEffect(() => {
    const testClipboard = async () => {
      try {
        await navigator.clipboard.readText();
        setCanPaste(true);
      } catch (err) {
        setCanPaste(false);
        console.log(`Access to clipboard not supported on this browser! ${err}`);
      }
    };

    testClipboard();
  }, []);

  const handleNomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNom(event.target.value);
  };

  const handleLienChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLien(event.target.value);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      setLien(text);
    });
  };

  const handleSubmit = () => {
    const link: GiftLink = {
      id: '',
      url: lien,
      description: nom,
      createdAt: new Date(),
      updatedAt: new Date(),
      giftId: ''
    }
    onSave(link);
    onClose(); 
  };

  const getActions = () => {
    return <>
      {canPaste && (
          <Button onClick={handlePaste} variant="contained" color="primary">
            Coller
          </Button>
        )}
        <Button onClick={handleSubmit} variant="contained" color="primary" autoFocus>
          Ajouter
        </Button>
    </>
  }

  const getContents = () => {
    return <>
    <DialogContentText>Renseigner le nouveau lien:</DialogContentText>
    <TextField
      autoFocus
      margin="dense"
      id="nom"
      label="Nom"
      type="text"
      fullWidth
      value={nom}
      onChange={handleNomChange}
    />
    <TextField
      margin="dense"
      id="lien"
      label="Addresse du lien:"
      type="url"
      placeholder='https://...'
      fullWidth
      value={lien}
      onChange={handleLienChange}
    />
  </>
  }

  return (
    <BottomDialog open={open} handleClose={onClose} title="Ajouter un lien" contents={getContents()} actions={getActions()} />
  );
};

export default GiftLinkEditorModal;