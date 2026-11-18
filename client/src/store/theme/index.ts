import { useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Themes } from '@/theme/types';

import type { Actions } from './types';

// atomWithStorage automatically syncs with localStorage. A new key is used so that
// users who never chose a mode follow the system appearance (the previous key
// always stored 'light' by default).
const themeModeState = atomWithStorage<Themes>('kdolist-theme-mode', Themes.SYSTEM);

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Resolves the effective 'light' | 'dark' appearance for a stored mode. */
export const resolveThemeMode = (mode: Themes): Themes.LIGHT | Themes.DARK => {
  if (mode === Themes.SYSTEM) return systemPrefersDark() ? Themes.DARK : Themes.LIGHT;
  return mode;
};

function useTheme(): [Themes, Actions] {
  const [themeMode, setThemeMode] = useAtom(themeModeState);

  // Toggle switches to the opposite of what is currently displayed.
  const toggle = useCallback(() => {
    setThemeMode((mode: Themes) =>
      resolveThemeMode(mode) === Themes.DARK ? Themes.LIGHT : Themes.DARK,
    );
  }, [setThemeMode]);

  const setMode = useCallback((mode: Themes) => setThemeMode(mode), [setThemeMode]);

  const memoizedActions = useMemo(() => ({ toggle, setMode }), [toggle, setMode]);

  return [themeMode, memoizedActions];
}

export default useTheme;
