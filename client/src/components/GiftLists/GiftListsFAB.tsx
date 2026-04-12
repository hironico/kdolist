import React, { useRef, useState } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InputBase from '@mui/material/InputBase';
import { Box } from '@mui/material';
import { FlexBox } from '../styled';

export type GiftListsFABProps = {
  handleAdd: () => void;
  onSearchChange: (query: string) => void;
};

const GiftListsFAB: React.FC<GiftListsFABProps> = ({ handleAdd, onSearchChange }) => {
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
        {/* Search / Close icon button */}
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
          {searchExpanded ? <CloseIcon /> : <SearchIcon />}
        </Box>

        {/* Text input — only interactive when expanded */}
        <InputBase
          inputRef={inputRef}
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder="Rechercher…"
          inputProps={{ 'aria-label': 'search gift lists' }}
          sx={{
            flex: 1,
            pr: 1.5,
            fontSize: '0.9rem',
            opacity: searchExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: searchExpanded ? 'auto' : 'none',
          }}
        />
      </Box>

      {/* Add FAB */}
      <Fab color="primary" aria-label="add" onClick={handleAdd}>
        <AddIcon />
      </Fab>
    </FlexBox>
  );
};

export default GiftListsFAB;
