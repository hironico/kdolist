import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { List, Typography, useTheme } from '@mui/material';
import { accent } from '@/theme/ios27';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { GiftList, LoginContext } from '@/LoginContext';
import ConfirmAlert from '../ConfirmAlert';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Diversity3, FormatListBulleted, Group } from '@mui/icons-material';
import ListEditor from '@/components/GiftLists/ListEditorForm';
import AddActionSection from '../AddActionSection';
import { nestedListSx } from '../styled';
import FilterBar, { Filter } from '../FilterBar/FilterBar';
import { usePageActions, FLOATING_ACTION_PILL_CLEARANCE } from '@/sections/FloatingActionPill';
import { Box } from '@mui/system';
import { EmptyStateCard, FacebookLikeCircularProgress } from '../EmptyStateCard';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

const GiftListsList: React.FC = () => {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [userTribes, setUserTribes] = useState<any[]>([]);
  const [tribeListsMap, setTribeListsMap] = useState<{ [key: string]: GiftList[] }>({});
  const [activeFilters, setActiveFilters] = useState<Filter<GiftList>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [giftListEditorVisible, setGiftListEditorVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const api = useAuthenticatedApi();

  const fetchGiftLists = async () => {

    const url = `${apiBaseUrl}/giftlist/all`;

    setLoading(true);

    try {
      const response = await api.get(url);

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        setGiftLists(data.myLists || []);
        setUserTribes(data.userTribes || []);
        setTribeListsMap(data.tribeListsMap || {});
      }
    } catch (error) {
      setLoading(false);
      console.error(`Failed to fetch gift lists: ${error}`);
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Impossible de récupérer les listes pour le moment.',
      });
    }
  };

  useEffect(() => {
    fetchGiftLists();
    appContext.setGiftList(null);
  }, []);

  /**
   * Navigates to the list contents editor. Sets the selected list in the list editor context.
   * @param item the selected list to navigate to.
   */
  const handleNavigateList = (item: GiftList, editable: boolean) => {
    appContext.setGiftList(item);

    const opts: NavigateOptions = {
      state: { list: item, editable: editable },
      replace: true,
    };

    navigate('/listcontents', opts);
  };

  const handleSelectAndConfirmDelete = (giftList: GiftList) => {
    appContext.setGiftList(giftList);
    setShowConfirmDialog(true);
  };

  const handleEditGiftList = (giftList: GiftList) => {
    appContext.setGiftList(giftList);
    setGiftListEditorVisible(true);
  }

  const handleAddGiftList = () => {
    appContext.setGiftList(null);
    setGiftListEditorVisible(true);
  }

  // Register page-level actions for the global FloatingActionPill
  // (navigation + search only: adding a list is done from the first row below).
  usePageActions(
    {
      onSearchChange: setSearchQuery,
      searchPlaceholder: 'Rechercher une liste…',
    },
    [],
  );

  const handleDeleteGiftList = async () => {
    if (!appContext.giftList) {
      console.warn(
        'The handleDeleteGiftList should have not been called without a selected list in the context',
      );
      return;
    }

    setShowConfirmDialog(false);

    const response = await fetch(`${apiBaseUrl}/giftlist/${appContext.giftList?.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
    });

    if (!response.ok) {
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Impossible de SUPPRIMER cette liste pour le moment.',
      });
    } else {
      fetchGiftLists();
      appContext.setGiftList(null);
    }
  };

  const handleListSaved = (giftList: GiftList) => {
    setGiftListEditorVisible(false);
    fetchGiftLists();
  }

  // Build filters dynamically based on user's tribes
  const giftListsFilters: Filter<GiftList>[] = [
    {
      id: 'my-lists',
      label: 'Mes Listes',
      filterFn: function (item: GiftList): boolean {
        return item.ownerId === appContext.loginInfo.profile?.id;
      }
    },
    ...userTribes.map(tribe => ({
      id: `tribe-${tribe.id}`,
      label: tribe.name,
      filterFn: function (item: GiftList): boolean {
        // Check if this list is in the tribe's lists
        const tribeLists = tribeListsMap[tribe.id] || [];
        return tribeLists.some(tribeList => tribeList.id === item.id);
      }
    }))
  ];

  // Scroll back to the top whenever the active filters or search query change
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, activeFilters]);

  const onGiftFilterChange = useCallback((activeFilterIds: string[]) => {
    const newActiveFilters = giftListsFilters.filter(f => activeFilterIds.includes(f.id));
    setActiveFilters(newActiveFilters);
  }, [userTribes, tribeListsMap]);


  const filteredLists = (() => {
    // Combine all unique lists from giftLists and tribeListsMap
    const allLists = [...giftLists];
    Object.values(tribeListsMap).forEach(tribeLists => {
      tribeLists.forEach(list => {
        if (!allLists.find(l => l.id === list.id)) {
          allLists.push(list);
        }
      });
    });

    // Apply chip filters first
    let result = allLists;
    if (activeFilters.length > 0) {
      const matchingListIds = new Set<string>();

      activeFilters.forEach(filter => {
        if (filter.id === 'my-lists') {
          giftLists.forEach(list => {
            if (filter.filterFn(list)) {
              matchingListIds.add(list.id);
            }
          });
        } else if (filter.id.startsWith('tribe-')) {
          const tribeId = filter.id.replace('tribe-', '');
          const tribeLists = tribeListsMap[tribeId] || [];
          tribeLists.forEach(list => {
            matchingListIds.add(list.id);
          });
        }
      });

      result = result.filter(list => matchingListIds.has(list.id));
    }

    // Apply text search filter on list name and owner name
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(list => {
        const nameMatch = list.name.toLowerCase().includes(q);
        const ownerFirstname = list.owner?.firstname?.toLowerCase() ?? '';
        const ownerLastname = list.owner?.lastname?.toLowerCase() ?? '';
        const ownerUsername = list.owner?.username?.toLowerCase() ?? '';
        const ownerMatch = ownerFirstname.includes(q) || ownerLastname.includes(q) || ownerUsername.includes(q);
        return nameMatch || ownerMatch;
      });
    }

    return result;
  })();

  /**
   * One gift list as an iOS grouped row: coloured icon tile (indigo for
   * collaborative lists, accent blue otherwise), name, then a single secondary
   * line "Prénom · date". Owners can swipe to edit / delete.
   */
  const renderListRow = (item: GiftList, index: number) => {
    const modifDate = new Date(item.updatedAt.toString());
    const owner = item.owner?.firstname;
    const secondaryText = (
      <Typography variant="caption" color="text.secondary">
        {[owner, `modifiée le ${modifDate.toLocaleDateString()}`].filter(Boolean).join(' · ')}
      </Typography>
    );

    const deleteAction: SwipeableListItemAction = {
      icon: <DeleteIcon />,
      color: 'error',
      onAction: () => handleSelectAndConfirmDelete(item),
      ariaLabel: 'Supprimer la liste',
    };

    const editListAction: SwipeableListItemAction = {
      icon: <EditIcon />,
      color: 'default',
      onAction: () => handleEditGiftList(item),
      ariaLabel: 'Modifier la liste',
    };

    const isOwner = item.ownerId === appContext.loginInfo.profile?.id;
    const isCollaborativeMember =
      item.isCollaborative === true &&
      (item.groupAccesses ?? []).some(ga =>
        userTribes.some((t: any) => t.id === ga.groupId)
      );
    const editable = isOwner || isCollaborativeMember;

    return (
      <SwipeableListItem
        onClickMain={() => handleNavigateList(item, editable)}
        action1={isOwner ? deleteAction : undefined}
        action2={isOwner ? editListAction : undefined}
        primaryText={item.name}
        secondaryText={secondaryText}
        icon={item.isCollaborative ? <Diversity3 /> : <FormatListBulleted />}
        iconTint={item.isCollaborative ? accent('indigo', theme.palette.mode) : undefined}
        keyId={`index-${index}`}
        key={`index-${index}`}
      />
    );
  };

  return (
    <Box display="grid" gridTemplateColumns="1fr" gridTemplateRows="auto 1fr" p={2} width="100%" height="calc(100vh - 64px)" position="relative" sx={{ overflowX: 'hidden' }}>
      {/* minWidth:0 is required on this grid item so the column stays at 1fr
          and the FilterBar's own overflowX:auto scroll container can function
          (without it the grid item expands to chip intrinsic width and the
          overflowX:hidden parent clips the scrollable area). */}
      <Box sx={{ mb: 2, minWidth: 0 }}>
        <FilterBar<GiftList> onFiltersChange={onGiftFilterChange} filters={giftListsFilters} />
      </Box>
      {loading ? (
        <EmptyStateCard
          title="Patience..."
          caption="Les listes de cadeaux sont en train d'être récupérées. Ca ne devrait pas être long."
          icon={<FacebookLikeCircularProgress />}
        />
      ) : (
        <Box
          ref={listRef}
          sx={{ mt: '10px', pb: FLOATING_ACTION_PILL_CLEARANCE, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, minWidth: 0 }}
        >
          {/* Creating a list is done from here, not from the floating pill. */}
          <AddActionSection label="Nouvelle liste" onClick={handleAddGiftList} />

          {userTribes.length === 0 && activeFilters.length === 0 ? (
            // Show empty state when user has no tribes and no filters are active
            <>
              <EmptyStateCard
                title="Rejoins une tribu !"
                caption="Tu ne fais partie d'aucune tribu pour le moment. Rejoins ou crée une tribu pour voir les listes des autres membres."
                icon={<Group />}
              />
              {giftLists.length > 0 && (
                <>
                  <Typography variant="overline" color="text.secondary" component="h2" sx={{ display: 'block', mt: 3, px: 2 }}>
                    Mes listes
                  </Typography>
                  <List sx={{ m: '0px', mt: 1, ...nestedListSx }}>
                    {giftLists.map(renderListRow)}
                  </List>
                </>
              )}
            </>
          ) : filteredLists.length > 0 ? (
            <List sx={{ m: '0px', ...nestedListSx }}>
              {filteredLists.map(renderListRow)}
            </List>
          ) : (
            <EmptyStateCard
              title="C'est vide par ici ..."
              caption="Pour ajouter une liste, utilise « Nouvelle liste » ci-dessus."
              icon={<SentimentVeryDissatisfiedIcon />}
            />
          )}
        </Box>
      )}

      {/* ListEditor now owns its own BottomDialog */}
      <ListEditor
        open={giftListEditorVisible}
        onClose={() => setGiftListEditorVisible(false)}
        onListSaved={handleListSaved}
        userTribes={userTribes}
      />

      <ConfirmAlert
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteGiftList}
        title="Effacer cette liste ?"
        message="Attention c'est irréversible !"
        confirmLabel="Effacer"
      />
    </Box>
  );
};

export default GiftListsList;
