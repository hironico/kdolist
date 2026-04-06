import { useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Themes } from '@/theme/types';

import type { Actions } from './types';

// atomWithStorage automatically syncs with localStorage under the key 'theme-mode'
const themeModeState = atomWithStorage<Themes>('theme-mode', Themes.LIGHT);

function useTheme(): [Themes, Actions] {
  const [themeMode, setThemeMode] = useAtom(themeModeState);

  const toggle = useCallback(() => {
    setThemeMode((mode: Themes) => (mode === Themes.DARK ? Themes.LIGHT : Themes.DARK));
  }, [setThemeMode]);

  const memoizedActions = useMemo(() => ({ toggle }), [toggle]);

  return [themeMode, memoizedActions];
}

export default useTheme;
