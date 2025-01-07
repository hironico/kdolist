import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { ChevronLeft } from '@mui/icons-material';
import { Box } from '@mui/system';

export type BottomDialogProps = {
  open: boolean;
  handleClose: () => void;
  title: string;
  contents: ReactNode;
  actions?: ReactNode;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BottomDialog: React.FC<BottomDialogProps> = ({
  open,
  handleClose,
  title,
  contents,
  actions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      TransitionComponent={Transition}
      sx={{
        top: 'auto',
        bottom: 0,
        width: '100hw',
        marginLeft: '-45px',
        marginRight: '-45px',
        marginBottom: '-45px',
      }}
    >
      <Toolbar>
        <IconButton color="inherit" aria-label="open drawer" onClick={() => handleClose()}>
          <ChevronLeft />
        </IconButton>
        <Typography fontSize={16}>{title}</Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
      <DialogTitle></DialogTitle>
      <DialogContent>{contents}</DialogContent>
      <DialogActions>{actions ? actions : <></>}</DialogActions>
    </Dialog>
  );
};

export default BottomDialog;
