import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import type { Components, Theme } from '@mui/material/styles';

import { accent, chromeMaterialSx, iosColors, IosMode, iosRadius, textStyle } from './ios27';

/**
 * MUI component overrides giving the iOS 27 look (controls and surfaces).
 * Lists, cards and dialogs are in `iosSurfaceComponents`.
 */
export const iosControlComponents = (mode: IosMode): Components<Theme> => {
  const c = iosColors(mode);
  const isDark = mode === 'dark';
  const segmentSelected = isDark ? 'rgba(255,255,255,0.27)' : '#ffffff';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
      styleOverrides: {
        root: {
          ...chromeMaterialSx,
          color: c.label.primary,
          boxShadow: 'none',
          borderBottom: `0.5px solid ${c.separator.nonOpaque}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: { root: { justifyContent: 'space-between' } },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: c.overlay },
        invisible: { backgroundColor: 'transparent' },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        // Bordered / prominent buttons are pills in iOS 27.
        root: {
          borderRadius: iosRadius.pill,
          padding: '10px 20px',
          transition: 'opacity 0.15s ease, background-color 0.15s ease',
          '&:active': { opacity: 0.6 },
        },
        text: { paddingLeft: 12, paddingRight: 12 },
        outlined: { borderColor: c.separator.opaque },
        sizeSmall: { ...textStyle('subheadline'), padding: '6px 14px' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: 'opacity 0.15s ease', '&:active': { opacity: 0.5 } },
      },
    },
    // Toggle buttons look like the iOS segmented control.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { backgroundColor: c.fill.tertiary, borderRadius: 10, padding: 2, gap: 2 },
        grouped: { border: 'none !important', borderRadius: '8px !important', margin: 0 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: c.label.primary,
          textTransform: 'none',
          padding: '4px 12px',
          '&.Mui-selected, &.Mui-selected:hover': {
            color: c.label.primary,
            backgroundColor: segmentSelected,
            boxShadow: isDark ? 'none' : '0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: iosRadius.pill, ...textStyle('subheadline', 500) },
        outlined: { borderColor: 'transparent', backgroundColor: c.fill.tertiary },
        clickable: { '&:active': { boxShadow: 'none', opacity: 0.7 } },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        icon: <RadioButtonUnchecked />,
        checkedIcon: <CheckCircle />,
        color: 'primary',
      },
    },
    // iOS toggle: 51x31 track, 27px thumb, green when on.
    MuiSwitch: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: { width: 51, height: 31, padding: 0, margin: 8, overflow: 'visible' },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#ffffff',
            '& + .MuiSwitch-track': { backgroundColor: accent('green', mode), opacity: 1 },
          },
          '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.5 },
        },
        thumb: {
          width: 27,
          height: 27,
          boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)',
        },
        track: { borderRadius: 31 / 2, backgroundColor: c.fill.primary, opacity: 1 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          ...textStyle('footnote'),
          borderRadius: 8,
          backgroundColor: isDark ? '#3a3a3c' : 'rgba(30,30,30,0.9)',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: { root: { width: '100%' } },
    },
    // iOS grouped text field: filled grouped-row background, no visible
    // border at rest, accent ring on focus, red ring on error.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: iosRadius.card,
          backgroundColor: c.grouped.secondary,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.separator.nonOpaque },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: accent('blue', mode),
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: accent('red', mode) },
          '&.Mui-readOnly .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: c.label.secondary },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { ...textStyle('footnote'), marginLeft: 16 },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: iosRadius.menu,
          backgroundColor: c.bg.elevated,
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiInputBase: {
      // ≥16px avoids iOS Safari zooming on focus
      styleOverrides: { root: { fontSize: 17 } },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { ...textStyle('caption2', 600), minWidth: 18, height: 18 },
      },
    },
    MuiTypography: {
      styleOverrides: { subtitle2: { fontWeight: 400 } },
    },
  };
};
