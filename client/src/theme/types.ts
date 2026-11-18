import { ReactNode } from 'react';

enum Themes {
  DARK = 'dark',
  LIGHT = 'light',
  /** Follow the operating system appearance (prefers-color-scheme). */
  SYSTEM = 'system',
}

type CustomThemeProviderProps = {
  children: ReactNode;
};

export type { CustomThemeProviderProps };
export { Themes };
