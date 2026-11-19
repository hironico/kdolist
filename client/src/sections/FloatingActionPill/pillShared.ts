import { keyframes } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import { liquidGlassSx } from '@/theme/ios27';

// Bar height — same for the tab bar and the search button (the iOS 27
// floating tab bar is ~62-64pt tall).
export const PILL_HEIGHT = 64;
// Total vertical space occupied by the fixed pill wrapper: 32px top padding +
// pill + 20px bottom padding (+16px margin). Scrollable content must reserve
// this at its end so the last item is never covered by the pill.
export const FLOATING_ACTION_PILL_CLEARANCE = `${PILL_HEIGHT + 32 + 20 + 16}px`;

// The two bars morph into each other when search opens / closes.
export const MORPH_MS = 350;
export const MORPH_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
export const MORPH_TRANSITION = `flex-basis ${MORPH_MS}ms ${MORPH_EASING}, flex-grow ${MORPH_MS}ms ${MORPH_EASING}`;

// Highlight slide: same duration as the library's Liquid Glass tab indicator
// (--duration-liquid-glass-tab-indicator) with a slight spring overshoot.
export const INDICATOR_SLIDE_MS = 450;
export const INDICATOR_SLIDE_EASING = 'cubic-bezier(0.34, 1.4, 0.5, 1)';
// Gap between the glass bar edge and the active-tab highlight.
export const INDICATOR_INSET = 4;

export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

export const NAV_ITEMS = ['lists', 'tribes'] as const;
export type NavItem = (typeof NAV_ITEMS)[number];
export type ActiveNav = NavItem | 'none';

export const NAV_PATH: Record<NavItem, string> = {
  lists: '/mylists',
  tribes: '/tribes',
};

// The gift list contents screen is "inside" the Lists tab (like a pushed
// screen inside an iOS tab), so the Lists tab stays highlighted there.
export const detectActiveNav = (pathname: string): ActiveNav => {
  if (pathname.startsWith('/mylists') || pathname.startsWith('/listcontents')) return 'lists';
  if (pathname.startsWith('/tribes')) return 'tribes';
  return 'none';
};

// While the highlight slides to another tab it stretches in the direction of
// travel and then settles back, like the iOS Liquid Glass "droplet".
export const dropletStretch = keyframes`
  0% { transform: scale(1, 1); }
  35% { transform: scale(1.14, 0.93); }
  100% { transform: scale(1, 1); }
`;

// Liquid Glass material (see theme/ios27, follows light/dark mode and the
// transparency setting) + a thin specular edge on top.
export const glassBarSx = (theme: Theme) => ({
  ...liquidGlassSx,
  boxShadow: `${liquidGlassSx.boxShadow}, inset 0 1px 0 ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)'
  }`,
});
