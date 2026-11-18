import { createTheme, Theme } from '@mui/material/styles';

import { accent, IOS_FONT_FAMILY, iosColors, IosMode, iosRadius, textStyle } from './ios27';
import { iosControlComponents } from './iosComponents';
import { iosSurfaceComponents } from './iosSurfaceComponents';

/** Soft iOS card shadow, kept for components that want a raised card. */
export const iOSBoxShadow = '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)';

/**
 * Builds the MUI theme from the iOS 27 design tokens (@ios27_design_system/tokens)
 * for one appearance mode. Light and dark are generated from the same tokens.
 */
export const createIosTheme = (mode: IosMode): Theme => {
  const c = iosColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: { main: accent('blue', mode), contrastText: '#ffffff' },
      secondary: { main: c.gray, contrastText: '#ffffff' },
      error: { main: accent('red', mode), contrastText: '#ffffff' },
      warning: { main: accent('orange', mode), contrastText: '#ffffff' },
      success: { main: accent('green', mode), contrastText: '#ffffff' },
      info: { main: accent('cyan', mode), contrastText: '#ffffff' },
      background: {
        // iOS grouped backgrounds: grey page + white rows (light),
        // black page + dark grey rows (dark).
        default: c.grouped.primary,
        paper: c.grouped.secondary,
      },
      text: {
        primary: c.label.primary,
        secondary: c.label.secondary,
        disabled: c.label.tertiary,
      },
      divider: c.separator.nonOpaque,
      action: {
        hover: c.fill.quaternary,
        selected: c.fill.tertiary,
        disabledBackground: c.fill.tertiary,
        disabled: c.label.tertiary,
      },
    },
    shape: { borderRadius: iosRadius.card },
    typography: {
      fontFamily: IOS_FONT_FAMILY,
      h1: textStyle('largeTitle', 700),
      h2: textStyle('largeTitle', 700),
      h3: textStyle('title1', 700),
      h4: textStyle('title1', 700),
      h5: textStyle('title2', 700),
      h6: textStyle('title3', 600),
      subtitle1: textStyle('headline', 600),
      subtitle2: textStyle('subheadline'),
      body1: textStyle('body'),
      body2: textStyle('subheadline'),
      caption: textStyle('footnote'),
      overline: { ...textStyle('footnote'), textTransform: 'uppercase' },
      button: { ...textStyle('body'), textTransform: 'none' },
    },
    components: {
      ...iosControlComponents(mode),
      ...iosSurfaceComponents(mode),
    },
  });
};

export const lightTheme = createIosTheme('light');
export const darkTheme = createIosTheme('dark');

export default lightTheme;
