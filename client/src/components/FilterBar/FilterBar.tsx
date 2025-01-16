import { useState, useEffect } from 'react';
import { Chip, Box } from '@mui/material';

// Generic type for the data item
export type DataItem = Record<string, any>;

// Filter structure
export interface Filter<T extends DataItem> {
  id: string;
  label: string;
  filterFn: (item: T) => boolean;
}

// Props interface for the FilterBar component
interface FilterBarProps<T extends DataItem> {
  filters: Filter<T>[];
  onFiltersChange: (activeFilterIds: string[]) => void;
}

const FilterBar = <T extends DataItem>({
  filters,
  onFiltersChange
}: FilterBarProps<T>) => {
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>([]);

  const handleFilterClick = (filterId: string) => {
    setActiveFilterIds(prevActiveFilters => {
      if (prevActiveFilters.includes(filterId)) {
        return prevActiveFilters.filter(id => id !== filterId);
      }
      return [...prevActiveFilters, filterId];
    });
  };

  useEffect(() => {
    onFiltersChange(activeFilterIds);
  }, [activeFilterIds, onFiltersChange]);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {filters.map((filter) => (
        <Chip
          key={filter.id}
          label={filter.label}
          onClick={() => handleFilterClick(filter.id)}
          color={activeFilterIds.includes(filter.id) ? 'primary' : 'default'}
          variant={activeFilterIds.includes(filter.id) ? 'filled' : 'outlined'}
          sx={{
            '&:hover': {
              backgroundColor: activeFilterIds.includes(filter.id) 
                ? undefined 
                : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        />
      ))}
    </Box>
  );
};

export default FilterBar;