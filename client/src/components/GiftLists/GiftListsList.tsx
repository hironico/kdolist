import React, { useContext, useEffect, useState } from 'react';
import { List, Typography } from '@mui/material';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { GiftList, LoginContext } from '@/LoginContext';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FormatListBulleted } from '@mui/icons-material';
import { BottomDialog } from '../BottomDialog';
import ListEditor from '@/components/GiftLists/ListEditorForm';
import GiftListsFAB from './GiftListsFAB';

export type GiftListProps = {
  editable: boolean;
};

const GiftListsList: React.FC<GiftListProps> = ({ editable }) => {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [giftListEditorVisible, setGiftListEditorVisible] = useState(false);
  const navigate = useNavigate();
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const fetchGiftLists = async () => {
    console.log(`Fetching gift lists... Editable is ${editable}.`);
    
    const url = editable ? `${apiBaseUrl}/giftlist/` : `${apiBaseUrl}/giftlist/shared`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${appContext.loginInfo.jwt}`,
        },
      });
      if (response.ok) {
        const myLists = await response.json();
        setGiftLists(myLists);
      }
    } catch (error) {
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
   * Navigates to the list contents editor. Sets the selecte dlist in the list editor context.
   * @param item the selected list to navitge to.
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

  const listEditor = <ListEditor onListSaved={handleListSaved} />;

  return (
    <>
      <List>
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

          const icon = <FormatListBulleted />;

          return (
            <SwipeableListItem
              onClickMain={() => handleNavigateList(item, editable)}
              action1={editable ? deleteAction : undefined}
              action2={editable ? editListAction: undefined}
              primaryText={item.name}
              secondaryText={secondaryText}
              icon={icon}
              keyId={`index-${index}`}
              key={`index-${index}`}
            />
          );
        })}
      </List>

      <BottomDialog
              title="Nouvelle liste"
              open={giftListEditorVisible}
              handleClose={() => setGiftListEditorVisible(false)}
              contents={listEditor}
            />

      <ActionSheet
        open={showConfirmDialog}
        handleClose={() => setShowConfirmDialog(false)}
        entries={actions}
        defaultEntry={defaultAction}
        message="Attention c'est irreversible !"
      />

      <GiftListsFAB handleAdd={() => handleAddGiftList()} />
    </>
  );
};

export default GiftListsList;
