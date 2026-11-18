import { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';

import useTheme, { resolveThemeMode } from '@/store/theme';
import { iosColors } from './ios27';
import { darkTheme, lightTheme } from './muios';
import { Themes, type CustomThemeProviderProps } from './types';

/**
 * Provides the iOS 27 MUI theme in light or dark mode.
 *
 * - Follows the OS appearance when the stored mode is 'system' (default) and
 *   reacts live to OS changes.
 * - Sets `data-theme` on <html> so the --ios27-* CSS tokens use the same mode
 *   as MUI, and updates the browser/PWA `theme-color`.
 */
function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const [mode] = useTheme();
  const [resolved, setResolved] = useState(() => resolveThemeMode(mode));

  useEffect(() => {
    setResolved(resolveThemeMode(mode));
    if (mode !== Themes.SYSTEM) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(resolveThemeMode(Themes.SYSTEM));
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', iosColors(resolved).grouped.primary);
  }, [resolved]);

  return (
    <ThemeProvider theme={resolved === Themes.DARK ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
}

export default CustomThemeProvider;
