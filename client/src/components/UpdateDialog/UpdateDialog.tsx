import { useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { SystemUpdate } from '@mui/icons-material';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { LoginContext } from '@/LoginContext';

interface UpdateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UpdateDialog({ open, onClose }: UpdateDialogProps) {
  const { setUpdateAvailable } = useContext(LoginContext);
  const {
    updateServiceWorker,
  } = useRegisterSW();

  const handleUpdate = async () => {
    try {
      // Call updateServiceWorker which will reload the page
      await updateServiceWorker(true);
      // Reset the update available flag (though page will reload)
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SystemUpdate color="primary" />
        <span>Mise à jour de l'application disponible !</span>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          Bonne nouvelle ! Une nouvelle version de l'application est prête à être installée.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Finis ce que tu es en train de faire, puis cliques sur "mettre à jour"
          pour profiter des améliorations. 
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Promis, ca ne prendra que quelques secondes. La page se recharge automatiquement.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, mt: '5px' }}>
        <Button onClick={handleLater} color="inherit">
          Plus tard
        </Button>
        <Button 
          onClick={handleUpdate} 
          variant="contained"
          startIcon={<SystemUpdate />}
          autoFocus
        >
          Mettre à jour
        </Button>
      </DialogActions>
    </Dialog>
  );
}
