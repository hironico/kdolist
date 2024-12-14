import { ThemeProvider } from '@mui/material/styles';
import type { CustomThemeProviderProps } from './types';

import iostheme from './muios';

function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  // return <ThemeProvider theme={createTheme(themes[theme])}>{children}</ThemeProvider>;
  return <ThemeProvider theme={iostheme}>{children}</ThemeProvider>;
}

export default CustomThemeProvider;
