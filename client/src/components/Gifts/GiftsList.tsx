import { Box, List, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import { Gift, LoginContext } from '@/LoginContext';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import GiftForm from './GiftForm';
import { GiftsFAB } from './GiftsFAB';
import { EmptyStateCard, FacebookLikeCircularProgress } from '../EmptyStateCard';
import { useNavigate } from 'react-router-dom';
import GiftsListItem from './GiftsListItem';
import GiftGridItem from './GiftGridItem';
import { FilterBar } from '../FilterBar';
import { Filter } from '../FilterBar/FilterBar';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const newEmptyGift = (): Gift => {
  return {
    id: '',
    name: '',
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    links: [],
    images: [],
    selectedAt: null,
    selectedById: null,
  };
};

type GiftsListProps = {
  editable: boolean;
};

const GifsList: React.FC<GiftsListProps> = ({ editable }) => {
  const appContext = useContext(LoginContext);
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const [gift, setGift] = useState<Gift>(newEmptyGift());
  const [giftEditorOpen, setGiftEditorOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Filter<Gift>[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    // Load view mode from localStorage, default to 'list' if not found
    const savedViewMode = localStorage.getItem('kdolist_gift_view_mode');
    return (savedViewMode === 'list' || savedViewMode === 'grid') ? savedViewMode : 'list';
  });

  const api = useAuthenticatedApi();

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'grid' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      // Save preference to localStorage
      localStorage.setItem('kdolist_gift_view_mode', newViewMode);
    }
  };

  const showError = useCallback((message: string) => {
    notificationsActions.push({
      options: {
        variant: 'error',
      },
      message: message,
    });
  }, []);

  const fetchListContents = () => {
    try {
      if (!appContext.giftList) {
        console.log('Cannot fetch list contents since no list is defined in the context.');
        return;
      }

      appContext.setGiftListContents([]);
      setLoading(true);

      const url = `${apiBaseUrl}/giftlist/contents/${appContext.giftList.id}`;

      api.get(url)
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              appContext.setGiftListContents(data);
            }).finally(() => setLoading(false));
          } else {
            showError('Impossible de récupérer le contenu de la liste.');
            console.error('Failed to fetch details', JSON.stringify(response, null, 2));
            navigate('/login');
            setLoading(false);
          }
        });
    } catch (error) {
      showError(`Erreur technique: ${error}`);
      console.error('Error fetching details:', error);
      setLoading(false);
    }

    // do not use finally block here because of threading issue
    // the json transform of response is async and finally block will 
    // execute before json promise is finished leading to display inconsistencies
  };

  useEffect(() => {
    console.log('USe effect, set loading to true');
    setLoading(true);
    appContext.setGiftListContents([]);
    fetchListContents();
    setGift(newEmptyGift());
  }, []);

  const deleteGift = () => {
    api.delete(`${apiBaseUrl}/gift/${gift.id}`)
      .then((response) => {
        if (!response.ok) {
          console.error(JSON.stringify(response));
          showError(`Impossible de supprimer l'entrée dans la liste.`);
        } else {
          fetchListContents();
          setGift(newEmptyGift);
        }
      }).catch(error => {
        console.error(`Cannot delete gift item from the list: ${error}`);
        showError(`Impossible de supprimer l'entrée dans la liste.`);
      }).finally(() => {
        setConfirmDeleteOpen(false);
      });
  };

  const handleDeleteGift = () => {
    deleteGift();
    setConfirmDeleteOpen(false);
  };

  const handleConfirmDeleteGift = (gift: Gift) => {
    setGift(gift);
    setConfirmDeleteOpen(true);
  }

  const toggleSelectGift = (gift: Gift) => {
    const url = gift.selectedById !== null ? `${apiBaseUrl}/gift/untake/${gift.id}` : `${apiBaseUrl}/gift/take/${gift.id}`;

    api.post(url, {}).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        showError(`Impossible de marquer ce cadeau comme étant offert/réservé.`);
      } else {
        fetchListContents();
        setGift(newEmptyGift);
      }
    });
  };

  const toggleFavorite = (gift: Gift) => {
    api.post(`${apiBaseUrl}/gift/favorite/${gift.id}`, {}).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        showError(`Impossible de marquer ce cadeau comme favori.`);
      } else {
        fetchListContents();
      }
    });
  };

  const handleAddGift = () => {
    setGift(newEmptyGift());
    setGiftEditorOpen(true);
  };

  const handleEditGift = (giftToEdit: Gift) => {
    setGift({ ...giftToEdit });
    setGiftEditorOpen(true);
  };

  const handleCloseGiftForm = (refresh: boolean) => {
    setGiftEditorOpen(false);

    if (refresh) {
      fetchListContents();
    }
  }

  const actions: ActionSheetEntry[] = [
    {
      label: 'Oui, effacer ce cadeau de la liste',
      color: 'error',
      onAction: handleDeleteGift,
    },
  ];

  const defaultAction: ActionSheetEntry = {
    label: 'Non, laisse tomber',
    color: 'primary',
    onAction: () => setConfirmDeleteOpen(false),
  };

  // Check if current user owns this list and list settings
  const isOwner = appContext.giftList?.ownerId === appContext.loginInfo.id;
  const showTakenToOwner = appContext.giftList?.showTakenToOwner ?? false;

  // Sort gifts: favorites first, then by update date
  const sortedGifts = loading ? [] : [...appContext.giftListContents].sort((a, b) => {
    // Favorites come first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    // If both are favorites or both are not, sort by update date (most recent first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredGifts = sortedGifts.filter(g => {
    if (activeFilters.length === 0) {
      return true;
    }

    let matching = false;
    activeFilters.forEach(filter => {
      matching = matching || filter.filterFn(g);
    });

    return matching;
  });

  // Render content based on view mode
  let listContents;

  if (loading) {
    const fbIcon = <FacebookLikeCircularProgress />;
    listContents = <EmptyStateCard title="Patience..." caption="La liste se charge. Ca ne devrait pas être très long." icon={fbIcon} />;
  } else if (filteredGifts.length === 0) {
    listContents = <EmptyStateCard title="C'est vide par ici ..." caption="Pour ajouter un cadeau à la liste, appuie sur le bouton '+' ou retire des filtres" />;
  } else if (viewMode === 'grid') {
    // Grid view
    listContents = filteredGifts.map((oneGift, index) => (
      <Grid xs={6} sm={4} md={3} lg={2.4} key={`kdo-grid-${index}`}>
        <GiftGridItem
          oneGift={oneGift}
          isOwner={isOwner}
          showTakenToOwner={showTakenToOwner}
          editable={editable}
          onClick={() => handleEditGift(oneGift)}
          onDelete={() => handleConfirmDeleteGift(oneGift)}
          onTake={() => toggleSelectGift(oneGift)}
          onFavorite={() => toggleFavorite(oneGift)}
        />
      </Grid>
    ));
  } else {
    // List view
    listContents = filteredGifts.map((oneGift) => (
      <GiftsListItem
        key={`gift-${oneGift.id}`}
        oneGift={oneGift}
        editable={editable}
        isOwner={isOwner}
        showTakenToOwner={showTakenToOwner}
        onDelete={() => handleConfirmDeleteGift(oneGift)}
        onTake={() => toggleSelectGift(oneGift)}
        onEdit={() => handleEditGift(oneGift)}
        onFavorite={() => toggleFavorite(oneGift)}
      />
    ));
  }

  // Build filters based on user role
  const giftFilters: Filter<Gift>[] = [];

  // Favorites filter - available for everyone
  giftFilters.push({
    id: 'gifts-favorites',
    label: 'Favoris',
    filterFn: function (item: Gift): boolean {
      return item.isFavorite === true;
    }
  });

  // Taken/non-taken filters - only if not owner or owner wants to see taken gifts
  if (!isOwner || showTakenToOwner) {
    giftFilters.push({
      id: 'gifts-non-taken',
      label: 'Non rayés',
      filterFn: function (item: Gift): boolean {
        return item.selectedById === null;
      }
    });
    giftFilters.push({
      id: 'gifts-taken',
      label: 'Rayés',
      filterFn: function (item: Gift): boolean {
        return item.selectedById !== null;
      }
    });
  }

  const onGiftFilterChange = useCallback((activeFilterIds: string[]) => {
    const newActiveFilters = giftFilters.filter(f => activeFilterIds.includes(f.id));
    setActiveFilters(newActiveFilters);
  }, []);

  return (
    <Box display="grid" gridTemplateColumns="auto" gridTemplateRows="auto 1fr" p={2} width="100%" height="calc(100vh - 64px)" position="relative">
      {/* Filter bar and view toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <FilterBar<Gift> onFiltersChange={onGiftFilterChange} filters={giftFilters} />
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content area */}
      {viewMode === 'list' ? (
        <List sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
          {listContents}
        </List>
      ) : (
        <Box sx={{ m: '0px', mt: '10px', overflowY: 'auto', minHeight: 0 }}>
          <Grid container spacing={2}>
            {listContents}
          </Grid>
        </Box>
      )}

      <GiftForm gift={gift} editable={editable} open={giftEditorOpen} onClose={handleCloseGiftForm} />

      <ActionSheet
        open={confirmDeleteOpen}
        handleClose={() => setConfirmDeleteOpen(false)}
        entries={actions}
        defaultEntry={defaultAction}
        message="Attention c'est irréversible !"
      />

      {editable ? <GiftsFAB handleAdd={handleAddGift} /> : <></>}
    </Box>
  );
};

export default GifsList;
