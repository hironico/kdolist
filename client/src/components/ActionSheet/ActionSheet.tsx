import { Button, ButtonGroup, Divider, SwipeableDrawer, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';
import { CenteredFlexBox } from '../styled';

export interface ActionSheetEntries {
    label: string;
    color: 'primary' | 'secondary' | 'error' | 'info'
    onAction: MouseEventHandler<HTMLButtonElement> | undefined;
}

export interface ActionSheetProps {
    handleClose:() => void;
    open: boolean;
    entries: ActionSheetEntries[];
    defaultEntry?: ActionSheetEntries;
    message?: string;
}

const iOS =
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);


const ActionSheet: React.FC<ActionSheetProps> = ({handleClose, open, entries: actions, defaultEntry: defaultAction, message}) => {

    const buttonStyle = {
        backgroundColor: 'rgba(255,255,255, 0.65)',
        boxShadow: 'none',
        backdropFilter: 'blur(10px)',
        marginLeft: '8px',
        marginRight: '8px',
        marginBottom: '10px',
        borderRadius: '16px'
      }

  return (    
    <SwipeableDrawer disableBackdropTransition={!iOS} disableDiscovery={iOS}  onOpen={() => console.log('On open')} 
        anchor="bottom"
        open={open}
        onClose={handleClose}
        aria-label="action sheet" 
        PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
      >        
        <ButtonGroup sx={buttonStyle} orientation='vertical' variant='text'>
            {message ? <CenteredFlexBox>
                       <Typography variant='body2' align="center" sx={{width: '100%', padding: '5px'}}>{message}
                       <Divider orientation='horizontal' sx={{marginTop: '5px'}}/>   
                       </Typography>                                     
                       </CenteredFlexBox> : <></>}
            {actions.map((actionItem, index) => {
                return <Button key={`key-${index}-${actionItem.label}`} color={actionItem.color} onClick={actionItem.onAction}>
                    {actionItem.label}
              </Button>
            })}
        </ButtonGroup> 
        {defaultAction ? 
        <ButtonGroup sx={buttonStyle} orientation='vertical' variant='text'>
            <Button color={defaultAction.color} onClick={defaultAction.onAction}>
                    {defaultAction.label}
              </Button>
        </ButtonGroup>
        : <></>
        }        
        
      </SwipeableDrawer>
  );
}

export default ActionSheet;