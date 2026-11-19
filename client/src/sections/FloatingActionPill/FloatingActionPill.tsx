import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { LoginContext } from '@/LoginContext';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { apiBaseUrl } from '@/config';
import { useFloatingActionPill } from './FloatingActionPillContext';
import PillSearch from './PillSearch';
import PillTabBar from './PillTabBar';
import { ActiveNav, detectActiveNav, FLOATING_ACTION_PILL_CLEARANCE } from './pillShared';

export { FLOATING_ACTION_PILL_CLEARANCE };

/**
 * Global Floating Action Pill, mounted once at the application level.
 *
 * Since the iOS 27 redesign it only serves for navigation (and search):
 *  - a Liquid Glass tab bar (left) with the Listes / Tribus tabs
 *  - a round Liquid Glass search button (right)
 *
 * The active tab is marked by a glass highlight that slides (with a droplet
 * stretch) from one tab to the other. Tapping the search button morphs the
 * tab bar into a round button showing the active tab, while the search button
 * grows into a search field.
 *
 * Context-relative actions (new list, new gift, new tribe…) are NOT in the pill
 * anymore: they are rows at the beginning of the related pages (see
 * AddActionSection). The page only provides its search callback through the
 * `usePageActions` hook.
 */
const FloatingActionPill: React.FC = () => {
  const { actions, registered } = useFloatingActionPill();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginInfo } = useContext(LoginContext);

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const api = useAuthenticatedApi();
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const isLoggedIn = Boolean(loginInfo?.jwt);

  const {
    onSearchChange,
    searchPlaceholder = 'Rechercher…',
    hidden,
    activeNav: activeNavOverride,
  } = actions;

  const activeNav: ActiveNav = activeNavOverride ?? detectActiveNav(location.pathname);
  const searchEnabled = Boolean(onSearchChange);

  // Poll tribes to display the pending invitations badge on the Tribus tab.
  useEffect(() => {
    if (!isLoggedIn) {
      setPendingInvitationsCount(0);
      return;
    }

    const fetchTribes = async () => {
      try {
        const response = await api.get(`${apiBaseUrl}/group`);
        if (response.ok) {
          const tribes: Array<{ groupMemberships?: Array<{ status: string }> }> =
            await response.json();
          setPendingInvitationsCount(
            tribes.filter((tribe) => tribe.groupMemberships?.[0]?.status === 'INVITED').length,
          );
        }
      } catch (error) {
        console.error('Failed to fetch tribes for badge', error);
      }
    };

    fetchTribes();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTribes, 30000);
    return () => clearInterval(interval);
  }, [api, isLoggedIn]);

  // Reset internal state whenever the page (and therefore the page actions) change.
  useEffect(() => {
    setSearchExpanded(false);
    setSearchQuery('');
  }, [location.pathname]);

  // The pill is shown only when the active page has explicitly registered
  // its actions, the user is logged in, and the page didn't ask for it to be
  // hidden. Public pages (Welcome / Login / Privacy / Share / KeycloakCallback /
  // NotFound) either don't register actions or register `{ hidden: true }`.
  if (!registered || hidden || !isLoggedIn) return null;

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

  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        // Soft fade at the bottom of the screen so the glass bars stand out
        // from the list items scrolling underneath, without a heavy halo.
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.3) 32px)'
            : 'linear-gradient(to bottom, rgba(242,242,247,0) 0px, rgba(242,242,247,0.55) 32px)',
        pt: '32px',
        pb: 'max(20px, env(safe-area-inset-bottom))',
        pl: '20px',
        pr: '20px',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none', // the bars re-enable pointer events themselves
      })}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.25,
          width: '100%',
          maxWidth: 520,
        }}
      >
        <PillTabBar
          activeNav={activeNav}
          collapsed={searchExpanded}
          pendingInvitationsCount={pendingInvitationsCount}
          onNavigate={navigate}
          onExpand={toggleSearch}
        />
        <PillSearch
          expanded={searchExpanded}
          enabled={searchEnabled}
          query={searchQuery}
          placeholder={searchPlaceholder}
          inputRef={inputRef}
          onToggle={toggleSearch}
          onQueryChange={handleQueryChange}
        />
      </Box>
    </Box>
  );
};

export default FloatingActionPill;
