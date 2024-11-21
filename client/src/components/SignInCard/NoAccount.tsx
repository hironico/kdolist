import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface NoAccountProps {
  open: boolean;
  handleClose: () => void;
}

export default function NoAccount({ open, handleClose }: NoAccountProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleClose();
        },
      }}
    >
      <DialogTitle>Tu n'as pas de compte...</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Si tu n'as pas de compte, alors utilises un réseau social pour t'identifier.
          Seules les personnes vraiment spéciales ont un compte "à l'ancienne"...
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button variant="contained" onClick={handleClose}>Continuer</Button>
      </DialogActions>
    </Dialog>
  );
}