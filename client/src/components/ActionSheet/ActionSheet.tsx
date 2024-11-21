import { Box, Button, ButtonGroup, Drawer, SwipeableDrawer, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';

export interface ActionSheetEntries {
    label: string;
    color: 'primary' | 'secondary'
    onAction: MouseEventHandler<HTMLButtonElement> | undefined;
}

export interface ActionSheetProps {
    handleClose:() => void;
    open: boolean;
    entries: ActionSheetEntries[];
    defaultEntry?: ActionSheetEntries;
}

const iOS =
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);


const ActionSheet: React.FC<ActionSheetProps> = ({handleClose, open, entries: actions, defaultEntry: defaultAction}) => {

    const buttonStyle = {
        backgroundColor: 'rgba(255,255,255, 0.65)',
        boxShadow: 'none',
        backdropFilter: 'blur(10px)',
        margin: '8px',
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