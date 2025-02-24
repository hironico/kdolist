import React, { ReactNode } from 'react';
import {
  Dialog,
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

export type BottomDialogAction = {
  icon: ReactNode,
  label: string,
  onClick: () => void
}

export type BottomDialogProps = {
  open: boolean;
  handleClose: () => void;
  title: string;
  contents: ReactNode;
  actions?: BottomDialogAction[];
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
        marginBottom: '-35px',
      }}
    >
      <DialogTitle sx={{padding: '0px'}}>
        <Toolbar sx={{padding: '0px', margin: '0px'}}>
          <IconButton color="primary" aria-label="open drawer" onClick={() => handleClose()} sx={{padding: '0px', marginLeft: '0px'}}>
            <ChevronLeft />
          </IconButton>
          <Typography fontSize={16}>{title}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {actions ? actions.map( (a,index) => {
            return <IconButton key={`bottom-dlg-key-${a.label}-${index}`} color="primary" aria-label="open drawer" onClick={a.onClick} sx={{ml: '10px', padding: '0px'}}>
                    {a.icon}
                  </IconButton>
          }): <></>}
        </Toolbar>
      </DialogTitle>            
      <DialogContent>{contents}</DialogContent>
    </Dialog>
  );
};

export default BottomDialog;
