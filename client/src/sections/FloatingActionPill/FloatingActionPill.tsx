import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, InputBase, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AppsIcon from '@mui/icons-material/Apps';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';

import { LoginContext } from '@/LoginContext';
import { useFloatingActionPill } from './FloatingActionPillContext';

// Pill height — gives ~14px of vertical breathing room around the 40px icon
// buttons + their tiny label.
const PILL_HEIGHT = 68;
const ICON_BTN_SX = { width: 40, height: 40 } as const;
// "Liquid glass" Apple-style effect shared by both pills. Two ingredients:
//  1) a strong backdrop-filter (blur + saturate + slight brightness boost)
//     to make whatever is behind ripple through the surface.
//  2) a translucent gradient overlay that fakes a refracted highlight on top
//     and a softer base at the bottom, just like a drop of liquid lens.
// Together they replace the previous flat tinted background and the visible
// border — the rim-light is now produced by an inset box-shadow instead.
const BACKDROP_FILTER = 'saturate(180%) brightness(1.05)';
const COLLAPSED_ICON_FONT_SIZE = 22;

// Returns the layered background + rim-lighting that gives the pill its
// liquid-glass look. Colours are theme-aware so the effect works in both
// light and dark mode.
const liquidGlassSx = (theme: any) => {
  const isDark = theme.palette.mode === 'dark';
  // Transparency halved compared to the previous values: opacity doubled.
  const baseAlpha = isDark ? 0.64 : 0.90;
  const topHighlight = isDark
    ? 'rgba(255,255,255,0.18)'
    : 'rgba(255,255,255,0.30)';
  const midHighlight = isDark
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(255,255,255,0.05)';
  const bottomShade = isDark
    ? 'rgba(0,0,0,0.10)'
    : 'rgba(255,255,255,0.0)';

  // Inset rim-light replaces a hard border for a more tactile glass edge.
  const rimLight = isDark
    ? 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.25)'
    : 'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.06)';

  return {
    background: `
      linear-gradient(
        180deg,
        ${topHighlight} 0%,
        ${midHighlight} 45%,
        ${bottomShade} 100%
      ),
      ${alpha(theme.palette.background.paper, baseAlpha)}
    `,
    backdropFilter: BACKDROP_FILTER,
    WebkitBackdropFilter: BACKDROP_FILTER,
    boxShadow: rimLight,
  };
};

type ActiveNav = 'lists' | 'tribes' | 'none';

const detectActiveNav = (pathname: string): ActiveNav => {
  if (pathname.startsWith('/mylists')) return 'lists';
  if (pathname.startsWith('/tribes')) return 'tribes';
  return 'none';
};

/**
 * Global Floating Action Pill, mounted once at the application level.
 *
 * It is composed of two pills of equal height:
 *  - the navigation pill (left) with Listes / Tribus buttons and an "add" button
 *  - the search pill (right) with a text input
 *
 * Tapping the collapsed icon of one expands it to fill the remaining width
 * while the other collapses to a circular icon (PILL_HEIGHT × PILL_HEIGHT).
 *
 * The contextual callbacks (onAdd / onSearchChange / etc.) are provided by the
 * currently visible page through the `usePageActions` hook.
 */
const FloatingActionPill: React.FC = () => {
  const { actions, registered } = useFloatingActionPill();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginInfo } = useContext(LoginContext);

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset internal state whenever the page (and therefore the page actions) change.
  useEffect(() => {
    setSearchExpanded(false);
    setSearchQuery('');
  }, [location.pathname]);

  const {
    onAdd,
    addAriaLabel = 'Ajouter',
    addIcon,
    addLabel = 'Ajouter',
    onSearchChange,
    searchPlaceholder = 'Rechercher…',
    hidden,
    activeNav: activeNavOverride,
    showNav,
  } = actions;

  const showLists = showNav?.lists ?? true;
  const showTribes = showNav?.tribes ?? true;
  const activeNav: ActiveNav = activeNavOverride ?? detectActiveNav(location.pathname);

  const isLogged = Boolean(loginInfo?.jwt);
  const searchEnabled = Boolean(onSearchChange);

  // Memoize visible nav buttons to compute width-related layout
  const navButtonCount = useMemo(() => {
    let count = 0;
    if (showLists) count += 1;
    if (showTribes) count += 1;
    if (onAdd) count += 1;
    return count;
  }, [showLists, showTribes, onAdd]);

  // The pill is shown only when the active page has explicitly registered
  // its actions, the user is logged in, and the page didn't ask for it to be
  // hidden. Public pages (Welcome / Login / Privacy / Share / KeycloakCallback /
  // NotFound) either don't register actions or register `{ hidden: true }`.
  if (!registered || hidden || !isLogged) return null;
  // If the page exposes nothing useful, do not render an empty pill
  if (!searchEnabled && navButtonCount === 0) return null;

  const toggleSearch = () => {
    if (!searchEnabled) return;
    if (searchExpanded) {
      setSearchExpanded(false);
      setSearchQuery('');
      onSearchChange?.('');
    } else {
      setSearchExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  // ─── Nav buttons ────────────────────────────────────────────────────────
  // The pill is intentionally colour-light: only the active page's icon and
  // label are tinted with the primary colour. All other buttons use the
  // default text colour with a transparent background.
  const renderNavButton = (params: {
    key: string;
    active: boolean;
    onClick: () => void;
    ariaLabel: string;
    tooltip: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const { key, active, onClick, ariaLabel, tooltip, icon, label } = params;
    return (
      <Tooltip title={tooltip} key={key}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <IconButton
            size="small"
            onClick={onClick}
            aria-label={ariaLabel}
            sx={{
              ...ICON_BTN_SX,
              bgcolor: 'transparent',
              color: active ? 'primary.main' : 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {icon}
          </IconButton>
          <Typography
            sx={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: active ? 'primary.main' : 'text.secondary',
              lineHeight: 1,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        // Subtle grey backdrop covering the whole bottom navigation area, so
        // the floating pill stands out from the list items above without
        // needing its own outer halo. The grey fades to transparent over the
        // top 16 px to blend smoothly with the page content.
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.18) 32px)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.05) 32px)',
        // The previous left/right/bottom 20 px offsets are now provided by
        // padding so that the grey backdrop reaches all edges.
        pt: '32px',
        pb: '20px',
        pl: '20px',
        pr: '20px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1.25,
        pointerEvents: 'none', // pills below re-enable pointer events themselves
      })}
    >
      {/* ── Navigation pill ───────────────────────────────────────────── */}
      <Box
        sx={(theme) => ({
          position: 'relative',
          height: PILL_HEIGHT,
          borderRadius: `${PILL_HEIGHT / 2}px`,
          overflow: 'hidden',
          transition:
            'flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex-grow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexGrow: searchExpanded ? 0 : 1,
          flexShrink: 0,
          flexBasis: searchExpanded ? `${PILL_HEIGHT}px` : 0,
          width: searchExpanded ? PILL_HEIGHT : undefined,
          minWidth: PILL_HEIGHT,
          pointerEvents: 'auto',
          ...liquidGlassSx(theme),
        })}
      >
        {/* Collapsed layer (AppsIcon) — visible when search is expanded */}
        <Box
          onClick={toggleSearch}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: PILL_HEIGHT,
            height: PILL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'transparent',
            color: 'text.primary',
            cursor: searchEnabled ? 'pointer' : 'default',
            opacity: searchExpanded ? 1 : 0,
            transition: 'opacity 0.15s ease',
            zIndex: 2,
            pointerEvents: searchExpanded ? 'auto' : 'none',
          }}
          aria-label="afficher les actions"
        >
          <AppsIcon sx={{ fontSize: COLLAPSED_ICON_FONT_SIZE }} />
        </Box>

        {/* Expanded layer — buttons (left-justified to align with the
            collapsed AppsIcon position) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: PILL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1.5,
            opacity: searchExpanded ? 0 : 1,
            transition: 'opacity 0.15s ease',
            pointerEvents: searchExpanded ? 'none' : 'auto',
            zIndex: 1,
            pl: 1.5,
            pr: 1,
          }}
        >

          {showLists &&
            renderNavButton({
              key: 'nav-lists',
              active: activeNav === 'lists',
              onClick: () => navigate('/mylists'),
              ariaLabel: 'aller aux listes',
              tooltip: 'Mes Listes',
              icon: <ViewListIcon />,
              label: 'Listes',
            })}

          {showTribes &&
            renderNavButton({
              key: 'nav-tribes',
              active: activeNav === 'tribes',
              onClick: () => navigate('/tribes'),
              ariaLabel: 'aller aux tribus',
              tooltip: 'Mes Tribus',
              icon: <GroupIcon />,
              label: 'Tribus',
            })}

          {onAdd &&
            renderNavButton({
              key: 'nav-add',
              active: false,
              onClick: onAdd,
              ariaLabel: addAriaLabel,
              tooltip: addAriaLabel,
              icon: addIcon ?? <AddCircleIcon />,
              label: addLabel,
            })}
        </Box>
      </Box>

      {/* ── Search pill ──────────────────────────────────────────────── */}
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          height: PILL_HEIGHT,
          borderRadius: `${PILL_HEIGHT / 2}px`,
          overflow: 'hidden',
          transition:
            'flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex-grow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexGrow: searchExpanded ? 1 : 0,
          flexShrink: 0,
          flexBasis: searchExpanded ? 0 : `${PILL_HEIGHT}px`,
          width: searchExpanded ? undefined : PILL_HEIGHT,
          minWidth: PILL_HEIGHT,
          pointerEvents: 'auto',
          ...liquidGlassSx(theme),
        })}
      >
        <Box
          onClick={toggleSearch}
          sx={{
            minWidth: PILL_HEIGHT,
            height: PILL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: searchEnabled ? 'text.primary' : 'action.disabled',
            cursor: searchEnabled ? 'pointer' : 'default',
            flexShrink: 0,
          }}
          aria-label={
            !searchEnabled
              ? 'recherche indisponible'
              : searchExpanded
                ? 'fermer la recherche'
                : 'ouvrir la recherche'
          }
          aria-disabled={!searchEnabled}
        >
          <SearchIcon sx={{ fontSize: COLLAPSED_ICON_FONT_SIZE }} />
        </Box>

        <InputBase
          inputRef={inputRef}
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder={searchPlaceholder}
          inputProps={{ 'aria-label': 'recherche' }}
          endAdornment={
            searchExpanded ? (
              <IconButton
                size="small"
                onClick={toggleSearch}
                sx={{ color: 'text.secondary', mr: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          sx={{
            flex: 1,
            fontSize: '1rem', // ≥16px to avoid iOS Safari zooming on focus
            opacity: searchExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: searchExpanded ? 'auto' : 'none',
          }}
        />
      </Box>
    </Box>
  );
};

export default FloatingActionPill;
