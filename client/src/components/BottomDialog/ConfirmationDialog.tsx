import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Slide, Toolbar, Typography } from "@mui/material";
import React from "react";
import { TransitionProps } from "notistack";
import { ChevronLeft } from "@mui/icons-material";
import { Box } from "@mui/system";

export interface ConfirmationDialog {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    title: string;
    message: string;
    intent?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    closeLabel?: string;
    confirmLabel?: string;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmDialog: React.FC<ConfirmationDialog> = ({ open, handleClose, handleConfirm, title, message, intent }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth={true}
            maxWidth="xl"
            TransitionComponent={Transition}
            sx={{ top: 'auto', bottom: 0, width: '100hw', marginLeft: '-25px', marginRight: '-25px', marginBottom: '-25px' }}
        >            
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent> 
            <DialogActions>
                <ButtonGroup 
                variant="text"
          orientation="vertical"
          size="large"
          fullWidth
          sx={{
            backgroundColor: 'rgb(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
        }}>
                <Button type="submit" onClick={handleClose} color="info" >
                    Non
                </Button>
                <Button type="submit" onClick={handleConfirm} color={intent ? intent : 'primary'} autoFocus >
                    Oui
                </Button>
                </ButtonGroup>                
                
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDialog;

