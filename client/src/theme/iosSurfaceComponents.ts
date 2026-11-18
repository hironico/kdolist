import type { Components, Theme } from '@mui/material/styles';

import { accent, iosColors, IosMode, iosRadius, textStyle } from './ios27';

/**
 * MUI overrides for surfaces: inset grouped lists, cards, dialogs, drawers, menus.
 */
export const iosSurfaceComponents = (mode: IosMode): Components<Theme> => {
  const c = iosColors(mode);

  return {
    MuiList: {
      styleOverrides: {
        padding: { paddingTop: 0, paddingBottom: 0 },
        root: {
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          // Inset grouped list. Only top/bottom margins: horizontal margins
          // combined with width:100% overflowed narrow screens; the parent
          // containers provide their own horizontal padding.
          margin: '16px 0',
          borderRadius: iosRadius.group,
          backgroundColor: c.grouped.secondary,
          // No separator under the last row, whether rows are direct children
          // or wrapped (e.g. SwipeableListItem wraps each ListItem in a Box).
          '& > .MuiListItem-root:last-child::after, & > :last-child > .MuiListItem-root::after': {
            display: 'none',
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          ...textStyle('footnote'),
          textTransform: 'uppercase',
          color: c.label.secondary,
          backgroundColor: c.grouped.primary,
          paddingTop: 24,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          width: 'auto',
          gap: 0,
          padding: 0,
          backgroundColor: c.grouped.secondary,
          position: 'relative',
          // iOS hairline separator, inset by 16px and hidden on the last row.
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 16,
            right: 0,
            bottom: 0,
            borderBottom: `0.5px solid ${c.separator.nonOpaque}`,
            pointerEvents: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { minHeight: 52, '&:active': { backgroundColor: c.fill.tertiary } },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: textStyle('body'),
        secondary: { ...textStyle('subheadline'), color: c.label.secondary },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { color: accent('blue', mode) } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: iosRadius.card + 4, backgroundColor: c.grouped.secondary },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: c.fill.tertiary } },
    },
    MuiDialog: {
      defaultProps: { PaperProps: { elevation: 0 } },
      styleOverrides: {
        paper: { borderRadius: iosRadius.alert, backgroundColor: c.bg.elevated, margin: 24 },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { ...textStyle('headline', 600), paddingBottom: 0 } },
    },
    MuiDialogContent: {
      styleOverrides: { root: { paddingBottom: 0 } },
    },
    MuiDialogContentText: {
      styleOverrides: { root: { ...textStyle('body'), color: c.label.secondary } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: 8 } },
    },
    MuiDrawer: {
      defaultProps: { PaperProps: { elevation: 0 } },
      styleOverrides: { paper: { backgroundColor: c.grouped.primary } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: iosRadius.menu,
          backgroundColor: c.bg.elevated,
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: c.separator.nonOpaque },
        inset: { marginLeft: 16 },
      },
    },
  };
};
