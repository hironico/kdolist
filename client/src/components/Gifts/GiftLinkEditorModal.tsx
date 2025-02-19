import React, { useState, useEffect } from 'react';
import { DialogContentText, TextField, Button, Stack, Paper } from '@mui/material';
import BottomDialog, { BottomDialogAction } from '../BottomDialog/BottomDialog';
import { GiftLink } from '@/LoginContext';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import { Box } from '@mui/system';

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
    // Vérifier si l'API Clipboard est disponible
    const checkClipboardPermission = async () => {
      try {
        // Vérifier si l'API est supportée
        setCanPaste(typeof navigator.clipboard !== 'undefined');
      } catch (error) {
        console.error("Erreur lors de la vérification de l'accès au Clipboard:", error);
        setCanPaste(false);
      }
    };

    checkClipboardPermission();
  }, []);

  const handleNomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNom(event.target.value);
  };

  const handleLienChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLien(event.target.value);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
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
      giftId: '',
    };
    onSave(link);
    onClose();
  };

  const getActions = (): BottomDialogAction[] => {
    return [
      {
        icon: <AutoFixHighIcon/>,
        label: 'Coller',
        onClick: handlePaste
      },
      {
        icon: <CheckIcon/>,
        label: 'OK',
        onClick: handleSubmit
      }
    ];
  };

  const getContents = () => {
    return (
      <Box sx={{marginBottom: '20px'}}>
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
          placeholder="https://..."
          fullWidth
          value={lien}
          onChange={handleLienChange}
        />
      </Box>
    );
  };

  return (
    <BottomDialog
      open={open}
      handleClose={onClose}
      title="Ajouter un lien"
      contents={getContents()}
      actions={getActions()}
    />
  );
};

export default GiftLinkEditorModal;
