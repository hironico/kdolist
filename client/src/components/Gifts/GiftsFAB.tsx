import React, { useRef, useState } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { Box } from '@mui/material';
import { FlexBox } from '../styled';

export type GiftFABProps = {
  /** Called when the user taps the add (+) button. If omitted, the add button is not shown. */
  handleAdd?: () => void;
  onSearchChange: (query: string) => void;
};

export const GiftsFAB: React.FC<GiftFABProps> = ({ handleAdd, onSearchChange }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = () => {
    if (searchExpanded) {
      setSearchExpanded(false);
      setSearchQuery('');
      onSearchChange('');
    } else {
      setSearchExpanded(true);
      // Focus input after expansion animation
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  return (
    <FlexBox
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      gap={1}
      sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, zIndex: 1000 }}
    >
      {/* Expandable search pill */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: searchExpanded ? 'background.paper' : 'primary.main',
          borderRadius: '28px',
          height: 56,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
          width: searchExpanded ? '220px' : '56px',
          boxShadow: 6,
        }}
      >
        {/* Search icon — always visible, clicking toggles the pill */}
        <Box
          onClick={handleSearchToggle}
          sx={{
            minWidth: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: searchExpanded ? 'primary.main' : 'common.white',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label={searchExpanded ? 'close search' : 'open search'}
        >
          <SearchIcon />
        </Box>

        {/* Text input with inline clear button — only interactive when expanded */}
        <InputBase
          inputRef={inputRef}
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder="Rechercher…"
          inputProps={{ 'aria-label': 'search gifts' }}
          endAdornment={
            searchExpanded ? (
              <IconButton size="small" onClick={handleSearchToggle} sx={{ color: 'text.secondary', mr: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
          sx={{
            flex: 1,
            fontSize: '1rem',   // ≥ 16px prevents iOS Safari from zooming on focus
            opacity: searchExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: searchExpanded ? 'auto' : 'none',
          }}
        />
      </Box>

      {/* Add FAB — only rendered when the list is editable */}
      {handleAdd && (
        <Fab color="primary" aria-label="add" onClick={handleAdd}>
          <AddIcon />
        </Fab>
      )}
    </FlexBox>
  );
};
