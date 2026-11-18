import { ComponentType, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import ThemeProvider from '@/theme/Provider';

// iOS 27 design tokens (colours, typography, spacing, Liquid Glass materials) as
// --ios27-* CSS variables, plus the iOS 27 React components' stylesheet. Dark
// values follow `data-theme` on <html> (set by the ThemeProvider).
import '@ios27_design_system/tokens/css';
import '@ios27_design_system/tokens/css/materials';
import '@ios27_design_system/react/styles.css';
import '@/theme/ios27-overrides.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

function render(App: ComponentType) {
  root.render(
    <StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </StrictMode>,
  );
}

export default render;
