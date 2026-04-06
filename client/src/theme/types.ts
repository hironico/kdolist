import { ReactNode } from 'react';

enum Themes {
  DARK = 'dark',
  LIGHT = 'light',
}

type CustomThemeProviderProps = {
  children: ReactNode;
};

export type { CustomThemeProviderProps };
export { Themes };
