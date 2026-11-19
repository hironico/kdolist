import React, { useEffect, useRef, useState } from 'react';
import { Badge, Box, ButtonBase } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';

import {
  ActiveNav,
  dropletStretch,
  glassBarSx,
  INDICATOR_INSET,
  INDICATOR_SLIDE_EASING,
  INDICATOR_SLIDE_MS,
  MORPH_EASING,
  MORPH_MS,
  MORPH_TRANSITION,
  NAV_ITEMS,
  NAV_PATH,
  NavItem,
  PILL_HEIGHT,
  REDUCED_MOTION,
} from './pillShared';

const BAR_ICON_FONT_SIZE = 24;

const TAB_LABEL: Record<NavItem, string> = { lists: 'Listes', tribes: 'Tribus' };
const TAB_ARIA_LABEL: Record<NavItem, string> = {
  lists: 'aller aux listes',
  tribes: 'aller aux tribus',
};

type PillTabBarProps = {
  activeNav: ActiveNav;
  /** True while the search field is open: the bar collapses into a circle. */
  collapsed: boolean;
  pendingInvitationsCount: number;
  onNavigate: (path: string) => void;
  /** Called when the collapsed circle is tapped (closes the search). */
  onExpand: () => void;
};

/**
 * Liquid Glass navigation tab bar (Listes / Tribus).
 *
 * The active tab is marked by a glass highlight that slides to the new tab
 * with a droplet stretch, and is magnified while pressed. When `collapsed`,
 * the bar shrinks into a round button showing the active tab icon.
 */
const PillTabBar: React.FC<PillTabBarProps> = ({
  activeNav,
  collapsed,
  pendingInvitationsCount,
  onNavigate,
  onExpand,
}) => {
  const [pressedTab, setPressedTab] = useState<NavItem | null>(null);
  const activeIndex = activeNav === 'none' ? -1 : NAV_ITEMS.indexOf(activeNav);

  // Restart the droplet stretch each time the highlight moves to another tab
  // (not on first render).
  const [slideCount, setSlideCount] = useState(0);
  const previousIndexRef = useRef(activeIndex);
  useEffect(() => {
    const previous = previousIndexRef.current;
    if (previous !== activeIndex && previous !== -1 && activeIndex !== -1) {
      setSlideCount((count) => count + 1);
    }
    previousIndexRef.current = activeIndex;
  }, [activeIndex]);

  const tabIcon = (item: NavItem) =>
    item === 'lists' ? (
      <ViewListIcon sx={{ fontSize: BAR_ICON_FONT_SIZE }} />
    ) : (
      <Badge badgeContent={pendingInvitationsCount} color="error">
        <GroupIcon sx={{ fontSize: BAR_ICON_FONT_SIZE }} />
      </Badge>
    );

  // Inactive tabs use the same colour as the page title (text.primary) so they
  // don't look disabled; only the active tab's icon and label are tinted with
  // the primary colour. The glass highlight behind it is drawn by the indicator.
  const renderTab = (item: NavItem) => {
    const active = activeNav === item;
    return (
      <ButtonBase
        key={`nav-${item}`}
        onClick={() => onNavigate(NAV_PATH[item])}
        onPointerDown={() => setPressedTab(item)}
        onPointerUp={() => setPressedTab(null)}
        onPointerLeave={() => setPressedTab(null)}
        onPointerCancel={() => setPressedTab(null)}
        aria-label={TAB_ARIA_LABEL[item]}
        aria-current={active ? 'page' : undefined}
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minWidth: 0,
          height: '100%',
          borderRadius: `${PILL_HEIGHT / 2}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          color: active ? 'primary.main' : 'text.primary',
          transition: 'color 0.25s ease, transform 0.2s ease',
          // Inactive tabs get a subtle press feedback; the active one is
          // magnified through its highlight instead.
          '&:active': { transform: active ? 'none' : 'scale(0.94)' },
          [REDUCED_MOTION]: { transition: 'none', '&:active': { transform: 'none' } },
        }}
      >
        {tabIcon(item)}
        <Box
          component="span"
          sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.1, letterSpacing: '0.01em' }}
        >
          {TAB_LABEL[item]}
        </Box>
      </ButtonBase>
    );
  };

  return (
    <Box
      component="nav"
      aria-label="navigation principale"
      sx={(theme) => ({
        position: 'relative',
        height: PILL_HEIGHT,
        borderRadius: `${PILL_HEIGHT / 2}px`,
        overflow: 'hidden',
        transition: MORPH_TRANSITION,
        flexGrow: collapsed ? 0 : 1,
        flexShrink: 0,
        flexBasis: collapsed ? `${PILL_HEIGHT}px` : 0,
        minWidth: PILL_HEIGHT,
        pointerEvents: 'auto',
        ...glassBarSx(theme),
        [REDUCED_MOTION]: { transition: 'none' },
      })}
    >
      {/* Collapsed layer — active tab icon, visible while searching. Tapping
          it closes the search and restores the tab bar. */}
      <Box
        component="button"
        type="button"
        onClick={onExpand}
        aria-label="fermer la recherche"
        tabIndex={collapsed ? 0 : -1}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: PILL_HEIGHT,
          height: PILL_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          border: 'none',
          background: 'transparent',
          color: 'primary.main',
          cursor: 'pointer',
          opacity: collapsed ? 1 : 0,
          transform: collapsed ? 'scale(1)' : 'scale(0.6)',
          transition: `opacity 0.2s ease ${collapsed ? '0.1s' : '0s'}, transform ${MORPH_MS}ms ${MORPH_EASING}`,
          zIndex: 2,
          pointerEvents: collapsed ? 'auto' : 'none',
          [REDUCED_MOTION]: { transition: 'none' },
        }}
      >
        {tabIcon(activeNav === 'tribes' ? 'tribes' : 'lists')}
      </Box>

      {/* Tabs layer — fades out while the bar collapses. */}
      <Box
        sx={{
          position: 'absolute',
          inset: `${INDICATOR_INSET}px`,
          display: 'flex',
          alignItems: 'stretch',
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? 'scale(0.85)' : 'scale(1)',
          transition: `opacity 0.15s ease, transform ${MORPH_MS}ms ${MORPH_EASING}`,
          pointerEvents: collapsed ? 'none' : 'auto',
          [REDUCED_MOTION]: { transition: 'none' },
        }}
      >
        {/* Glass highlight behind the active tab. Three nested layers so the
            slide, the press magnification and the droplet stretch each own
            their own transform. */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `calc(100% / ${NAV_ITEMS.length})`,
            opacity: activeIndex === -1 ? 0 : 1,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
            transition: `transform ${INDICATOR_SLIDE_MS}ms ${INDICATOR_SLIDE_EASING}, opacity 0.2s ease`,
            pointerEvents: 'none',
            [REDUCED_MOTION]: { transition: 'none' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              transform:
                pressedTab !== null && pressedTab === activeNav ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              [REDUCED_MOTION]: { transition: 'none' },
            }}
          >
            <Box
              key={slideCount}
              sx={(theme) => ({
                width: '100%',
                height: '100%',
                borderRadius: `${(PILL_HEIGHT - 2 * INDICATOR_INSET) / 2}px`,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.14)'
                    : 'rgba(120,120,128,0.16)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? 'inset 0 0 0 0.5px rgba(255,255,255,0.18), 0 1px 4px rgba(0,0,0,0.25)'
                    : 'inset 0 0 0 0.5px rgba(255,255,255,0.6), 0 1px 4px rgba(0,0,0,0.08)',
                animation:
                  slideCount > 0 ? `${dropletStretch} ${INDICATOR_SLIDE_MS}ms ease-out` : 'none',
                [REDUCED_MOTION]: { animation: 'none' },
              })}
            />
          </Box>
        </Box>

        {NAV_ITEMS.map(renderTab)}
      </Box>
    </Box>
  );
};

export default PillTabBar;
