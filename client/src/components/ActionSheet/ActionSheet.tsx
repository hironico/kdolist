import { Button, ButtonGroup, SwipeableDrawer, Typography } from '@mui/material';
import React, { MouseEventHandler } from 'react';
import { CenteredFlexBox } from '../styled';

export interface ActionSheetEntry {
  label: string;
  color: 'primary' | 'secondary' | 'error' | 'info';
  onAction: MouseEventHandler<HTMLButtonElement> | undefined;
}

export interface ActionSheetProps {
  handleClose: () => void;
  open: boolean;
  entries: ActionSheetEntry[];
  defaultEntry?: ActionSheetEntry;
  message?: string;
}

const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

const mainActionStyle = {
  backgroundColor: 'rgba(255,255,255, 0.65)',
  boxShadow: 'none',
  backdropFilter: 'blur(10px)',
  marginLeft: '8px',
  marginRight: '8px',
  marginBottom: '10px',
  borderRadius: '16px',
};

const defaultActionStyle = {
  backgroundColor: 'rgba(255,255,255, 0.85)',
  boxShadow: 'none',
  backdropFilter: 'blur(10px)',
  marginLeft: '8px',
  marginRight: '8px',
  marginBottom: '10px',
  borderRadius: '16px',
};

const ActionSheet: React.FC<ActionSheetProps> = ({
  handleClose,
  open,
  entries: actions,
  defaultEntry: defaultAction,
  message,
}) => {
  return (
    <SwipeableDrawer
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      onOpen={() => console.log('On open')}
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
      <ButtonGroup sx={mainActionStyle} orientation="vertical" variant="text">
        {message ? (
          <CenteredFlexBox
            flexDirection={'column'}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="body2" align="center" sx={{ width: '100%', padding: '5px' }}>
              {message}
            </Typography>
          </CenteredFlexBox>
        ) : (
          <></>
        )}
        {actions.map((actionItem, index) => {
          return (
            <Button
              key={`key-${index}-${actionItem.label}`}
              color={actionItem.color}
              onClick={actionItem.onAction}
            >
              {actionItem.label}
            </Button>
          );
        })}
      </ButtonGroup>
      {defaultAction ? (
        <ButtonGroup sx={defaultActionStyle} orientation="vertical" variant="text">
          <Button color={defaultAction.color} onClick={defaultAction.onAction}>
            {defaultAction.label}
          </Button>
        </ButtonGroup>
      ) : (
        <></>
      )}
    </SwipeableDrawer>
  );
};

export default ActionSheet;
