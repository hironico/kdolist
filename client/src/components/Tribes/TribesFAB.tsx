import React, { useRef, useState } from 'react';
import Fab from '@mui/material/Fab';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AppsIcon from '@mui/icons-material/Apps';
import { FormatListBulleted, GroupAdd } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { Box, Typography, Tooltip } from '@mui/material';
import { FlexBox } from '../styled';
import { useNavigate } from 'react-router-dom';

export type TribesFABProps = {
  handleAdd: () => void;
  onSearchChange: (query: string) => void;
};

type ExpandedPill = 'search' | 'nav' | null;

// Expanded pill dimensions — height matches the 56 px search pill
const EXPANDED_W = 136;
const EXPANDED_H = 56;

const TribesFAB: React.FC<TribesFABProps> = ({ handleAdd, onSearchChange }) => {
  const [expandedPill, setExpandedPill] = useState<ExpandedPill>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const clearSearch = () => {
    setSearchQuery('');
    onSearchChange('');
  };

  const toggleNav = () => {
    if (expandedPill === 'nav') {
      setExpandedPill(null);
    } else {
      if (expandedPill === 'search') clearSearch();
      setExpandedPill('nav');
    }
  };

  const toggleSearch = () => {
    if (expandedPill === 'search') {
      clearSearch();
      setExpandedPill(null);
    } else {
      setExpandedPill('search');
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleAddClick = () => {
    if (expandedPill === 'search') clearSearch();
    setExpandedPill(null);
    handleAdd();
  };

  const isNavExpanded = expandedPill === 'nav';
  const isSearchExpanded = expandedPill === 'search';

  return (
    <FlexBox
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      gap={1}
      sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, zIndex: 1000 }}
    >
      {/* ── Navigation pill ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: 6,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: isNavExpanded ? EXPANDED_W : 56,
          height: isNavExpanded ? EXPANDED_H : 56,
        }}
      >
        {/* Collapsed: AppsIcon — primary circle */}
        <Box
          onClick={toggleNav}
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            width: 56, height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'common.white',
            cursor: 'pointer',
            opacity: isNavExpanded ? 0 : 1,
            transition: 'opacity 0.15s ease',
            zIndex: 2,
            pointerEvents: isNavExpanded ? 'none' : 'auto',
          }}
          aria-label="navigation"
        >
          <AppsIcon />
        </Box>

        {/* Expanded: two round Fab buttons with labels */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            width: EXPANDED_W,
            height: EXPANDED_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            bgcolor: 'background.paper',
            opacity: isNavExpanded ? 1 : 0,
            transition: 'opacity 0.15s ease 0.1s',
            pointerEvents: isNavExpanded ? 'auto' : 'none',
            zIndex: 1,
          }}
        >
          {/* Listes — inactive */}
          <Tooltip title="Mes Listes">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <IconButton
                size="small"
                onClick={() => navigate('/mylists')}
                aria-label="aller aux listes"
                sx={{
                  width: 32, height: 32,
                  bgcolor: 'action.focus',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <FormatListBulleted sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
                Listes
              </Typography>
            </Box>
          </Tooltip>

          {/* Tribus — active */}
          <Tooltip title="Mes Tribus">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <IconButton
                size="small"
                onClick={() => navigate('/tribes')}
                aria-label="aller aux tribus"
                sx={{
                  width: 32, height: 32,
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <GroupIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                Tribus
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Search pill ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: isSearchExpanded ? 'background.paper' : 'primary.main',
          borderRadius: '28px',
          height: 56,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
          width: isSearchExpanded ? '220px' : '56px',
          boxShadow: 6,
        }}
      >
        <Box
          onClick={toggleSearch}
          sx={{
            minWidth: 56, height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isSearchExpanded ? 'primary.main' : 'common.white',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label={isSearchExpanded ? 'close search' : 'open search'}
        >
          <SearchIcon />
        </Box>

        <InputBase
          inputRef={inputRef}
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder="Rechercher…"
          inputProps={{ 'aria-label': 'search tribes' }}
          endAdornment={
            isSearchExpanded ? (
              <IconButton size="small" onClick={toggleSearch} sx={{ color: 'text.secondary', mr: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          sx={{
            flex: 1,
            fontSize: '1rem',
            opacity: isSearchExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: isSearchExpanded ? 'auto' : 'none',
          }}
        />
      </Box>

      {/* ── Create tribe FAB — collapses nav on click ─────────────────────── */}
      <Fab color="primary" aria-label="create tribe" onClick={handleAddClick}>
        <GroupAdd />
      </Fab>
    </FlexBox>
  );
};

export default TribesFAB;
