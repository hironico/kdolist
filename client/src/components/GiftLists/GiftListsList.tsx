import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { List, Typography } from '@mui/material';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { GiftList, LoginContext } from '@/LoginContext';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Diversity3, FormatListBulleted, Group } from '@mui/icons-material';
import ListEditor from '@/components/GiftLists/ListEditorForm';
import GiftListsFAB from './GiftListsFAB';
import FilterBar, { Filter } from '../FilterBar/FilterBar';
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
  const listRef = useRef<HTMLUListElement>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [giftListEditorVisible, setGiftListEditorVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
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

  const actions: ActionSheetEntry[] = [
    {
      label: 'Oui, effacer la liste',
      color: 'error',
      onAction: () => handleDeleteGiftList(),
    },
  ];

  const defaultAction: ActionSheetEntry = {
    label: 'Non, laisse tomber',
    color: 'primary',
    onAction: () => setShowConfirmDialog(false),
  };

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

  return (
    <Box display="grid" gridTemplateColumns="auto" gridTemplateRows="auto 1fr" p={2} width="100%" height="calc(100vh - 64px)" position="relative">
      <FilterBar<GiftList> onFiltersChange={onGiftFilterChange} filters={giftListsFilters} />
      {loading ? (
        <EmptyStateCard
          title="Patience..."
          caption="Les listes de cadeaux sont en train d'être récupérées. Ca ne devrait pas être long."
          icon={<FacebookLikeCircularProgress />}
        />
      ) : userTribes.length === 0 && activeFilters.length === 0 ? (
        // Show empty state when user has no tribes and no filters are active
        <Box sx={{ overflowY: 'auto', alignSelf: 'start' }}>
          <EmptyStateCard
            title="Rejoins une tribu !"
            caption="Tu ne fais partie d'aucune tribu pour le moment. Rejoins ou crée une tribu pour voir les listes des autres membres."
            icon={<Group />}
          />
          {giftLists.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2, px: 1 }}>
                Mes Listes
              </Typography>
              <List sx={{ m: '0px' }}>
                {giftLists.map((item, index) => {
                  const modifDate = new Date(item.updatedAt.toString());
                  const secondaryText = (
                    <>
                      <Typography variant="caption">{`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}</Typography>
                      <br />
                      <Typography variant="caption">{`Par: ${item.owner?.firstname}`}</Typography>
                    </>
                  );

                  const deleteAction: SwipeableListItemAction = {
                    icon: <DeleteIcon />,
                    color: 'error',
                    onAction: () => handleSelectAndConfirmDelete(item),
                  };

                  const editListAction: SwipeableListItemAction = {
                    icon: <EditIcon />,
                    color: 'default',
                    onAction: () => handleEditGiftList(item),
                  };

                  const isOwner = item.ownerId === appContext.loginInfo.profile?.id;
                  const isCollaborativeMember =
                    item.isCollaborative === true &&
                    (item.groupAccesses ?? []).some(ga =>
                      userTribes.some((t: any) => t.id === ga.groupId)
                    );
                  const editable = isOwner || isCollaborativeMember;

                  const icon = item.isCollaborative
                    ? <Diversity3 />
                    : <FormatListBulleted />;

                  return (
                    <SwipeableListItem
                      onClickMain={() => handleNavigateList(item, editable)}
                      action1={isOwner ? deleteAction : undefined}
                      action2={isOwner ? editListAction : undefined}
                      primaryText={item.name}
                      secondaryText={secondaryText}
                      icon={icon}
                      keyId={`index-${index}`}
                      key={`index-${index}`}
                    />
                  );
                })}
              </List>
            </>
          )}
        </Box>
      ) : filteredLists.length > 0 ? (
          <List ref={listRef} sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
          {filteredLists.map((item, index) => {
            const modifDate = new Date(item.updatedAt.toString());
            const secondaryText = (
              <>
                <Typography variant="caption">{`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}</Typography>
                <br />
                <Typography variant="caption">{`Par: ${item.owner?.firstname}`}</Typography>
              </>
            );

            const deleteAction: SwipeableListItemAction = {
              icon: <DeleteIcon />,
              color: 'error',
              onAction: () => handleSelectAndConfirmDelete(item),
            };

            const editListAction: SwipeableListItemAction = {
              icon: <EditIcon />,
              color: 'default',
              onAction: () => handleEditGiftList(item),
            };

            const isOwner = item.ownerId === appContext.loginInfo.profile?.id;
            const isCollaborativeMember =
              item.isCollaborative === true &&
              (item.groupAccesses ?? []).some(ga =>
                userTribes.some((t: any) => t.id === ga.groupId)
              );
            const editable = isOwner || isCollaborativeMember;

            const icon = item.isCollaborative
              ? <Diversity3 />
              : <FormatListBulleted />;

            return (
              <SwipeableListItem
                onClickMain={() => handleNavigateList(item, editable)}
                action1={isOwner ? deleteAction : undefined}
                action2={isOwner ? editListAction : undefined}
                primaryText={item.name}
                secondaryText={secondaryText}
                icon={icon}
                keyId={`index-${index}`}
                key={`index-${index}`}
              />
            );
          })}
        </List>
      ) : (
        <EmptyStateCard
          title="C'est vide par ici ..."
          caption="Pour ajouter une liste, appuie sur le bouton '+'."
          icon={<SentimentVeryDissatisfiedIcon />}
        />
      )}

      {/* ListEditor now owns its own BottomDialog */}
      <ListEditor
        open={giftListEditorVisible}
        onClose={() => setGiftListEditorVisible(false)}
        onListSaved={handleListSaved}
        userTribes={userTribes}
      />

      <ActionSheet
        open={showConfirmDialog}
        handleClose={() => setShowConfirmDialog(false)}
        entries={actions}
        defaultEntry={defaultAction}
        message="Attention c'est irreversible !"
      />

      <GiftListsFAB handleAdd={() => handleAddGiftList()} onSearchChange={setSearchQuery} />
    </Box>
  );
};

export default GiftListsList;
