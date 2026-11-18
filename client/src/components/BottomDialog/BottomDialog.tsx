import React, { ReactNode } from 'react';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Sheet } from '@ios27_design_system/react';

export type BottomDialogAction = {
  icon: ReactNode,
  label: string,
  onClick: () => void,
  disabled?: boolean,
  /** When true the button is rendered with a filled primary background to stand out as the main action */
  isPrimary?: boolean,
}

export type BottomDialogProps = {
  open: boolean;
  handleClose: () => void;
  title: string;
  contents: ReactNode;
  actions?: BottomDialogAction[];
  /** Prevents dismissing by tapping outside / dragging down (e.g. while editing or saving). */
  disableBackdropClick?: boolean;
};

// Glass circular bar button (iOS 27 toolbar items are glass pills/circles).
const barButtonSx = {
  width: 36,
  height: 36,
  bgcolor: 'action.selected',
  color: 'text.primary',
  '&:hover': { bgcolor: 'action.selected' },
} as const;

const primaryBarButtonSx = {
  ...barButtonSx,
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': { bgcolor: 'primary.main' },
  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
} as const;

/**
 * iOS 27 bottom sheet (large detent) built on the `Sheet` component of
 * @ios27_design_system/react: grabber, drag-to-dismiss, focus trap, Escape.
 *
 * The header follows the iOS sheet toolbar: a close button on the leading side,
 * the title in the middle and the actions as glass circular buttons on the
 * trailing side (the primary one filled with the accent colour).
 */
const BottomDialog: React.FC<BottomDialogProps> = ({
  open,
  handleClose,
  title,
  contents,
  actions,
  disableBackdropClick = false,
}) => {
  const handleOpenChange = (next: boolean) => {
    if (!next && !disableBackdropClick) {
      handleClose();
    }
  };

  return (
    <Sheet
      open={open}
      onChange={handleOpenChange}
      detent="large"
      className="kdo-sheet"
      aria-label={title}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 1,
          px: 2,
          pb: 1.5,
        }}
      >
        <Box>
          <Tooltip title="Fermer">
            <IconButton aria-label="fermer" onClick={handleClose} sx={barButtonSx}>
              <CloseGlyph />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="subtitle1" component="h2" noWrap sx={{ textAlign: 'center' }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {actions?.map((a, index) => (
            <Tooltip key={`bottom-dlg-key-${a.label}-${index}`} title={a.label}>
              <span>
                <IconButton
                  aria-label={a.label}
                  onClick={a.onClick}
                  disabled={a.disabled}
                  sx={a.isPrimary ? primaryBarButtonSx : { ...barButtonSx, color: 'primary.main' }}
                >
                  {a.icon}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto' }}>{contents}</Box>
    </Sheet>
  );
};

/** SF-Symbols-like "xmark" glyph, thinner than the Material close icon. */
const CloseGlyph: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M1.5 1.5l11 11M12.5 1.5l-11 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default BottomDialog;
