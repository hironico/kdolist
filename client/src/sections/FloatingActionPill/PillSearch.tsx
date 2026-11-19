import React from 'react';
import { Box, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import { glassBarSx, MORPH_TRANSITION, PILL_HEIGHT, REDUCED_MOTION } from './pillShared';

const SEARCH_ICON_FONT_SIZE = 22;

type PillSearchProps = {
  expanded: boolean;
  /** When false the button is greyed-out and not clickable. */
  enabled: boolean;
  query: string;
  placeholder: string;
  inputRef: React.Ref<HTMLInputElement>;
  onToggle: () => void;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Round Liquid Glass search button that grows into a search field while the
 * tab bar collapses into a circle (the two bars share the available width).
 */
const PillSearch: React.FC<PillSearchProps> = ({
  expanded,
  enabled,
  query,
  placeholder,
  inputRef,
  onToggle,
  onQueryChange,
}) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      height: PILL_HEIGHT,
      borderRadius: `${PILL_HEIGHT / 2}px`,
      overflow: 'hidden',
      transition: MORPH_TRANSITION,
      flexGrow: expanded ? 1 : 0,
      flexShrink: 0,
      flexBasis: expanded ? 0 : `${PILL_HEIGHT}px`,
      width: expanded ? undefined : PILL_HEIGHT,
      minWidth: PILL_HEIGHT,
      pointerEvents: 'auto',
      ...glassBarSx(theme),
      [REDUCED_MOTION]: { transition: 'none' },
    })}
  >
    <Box
      component="button"
      type="button"
      onClick={onToggle}
      disabled={!enabled}
      aria-label={
        !enabled
          ? 'recherche indisponible'
          : expanded
            ? 'fermer la recherche'
            : 'ouvrir la recherche'
      }
      sx={{
        minWidth: PILL_HEIGHT,
        height: PILL_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        border: 'none',
        background: 'transparent',
        color: enabled ? 'text.primary' : 'action.disabled',
        cursor: enabled ? 'pointer' : 'default',
        flexShrink: 0,
        transition: 'opacity 0.15s ease',
        '&:active': enabled ? { opacity: 0.5 } : undefined,
      }}
    >
      <SearchIcon sx={{ fontSize: SEARCH_ICON_FONT_SIZE }} />
    </Box>

    <InputBase
      inputRef={inputRef}
      value={query}
      onChange={onQueryChange}
      placeholder={placeholder}
      inputProps={{ 'aria-label': 'recherche', tabIndex: expanded ? 0 : -1 }}
      endAdornment={
        expanded ? (
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label="fermer la recherche"
            sx={{ color: 'text.secondary', mr: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null
      }
      sx={{
        flex: 1,
        fontSize: '1rem', // ≥16px to avoid iOS Safari zooming on focus
        opacity: expanded ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: expanded ? 'auto' : 'none',
      }}
    />
  </Box>
);

export default PillSearch;
