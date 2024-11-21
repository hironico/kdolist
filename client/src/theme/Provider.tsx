import { ThemeProvider, createTheme } from '@mui/material/styles';

import useTheme from '@/store/theme';
import type { CustomThemeProviderProps } from './types';

import iostheme from './muios';

function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const [theme] = useTheme();

  // return <ThemeProvider theme={createTheme(themes[theme])}>{children}</ThemeProvider>;
  return <ThemeProvider theme={iostheme}>{children}</ThemeProvider>;
}

export default CustomThemeProvider;
