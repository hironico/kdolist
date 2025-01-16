import { Box, List, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { Gift, LoginContext } from '@/LoginContext';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import { Redeem } from '@mui/icons-material';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import { BottomDialog } from '../BottomDialog';
import GiftForm from './GiftForm';
import { GiftsFAB } from './GiftsFAB';
import { EmptyStateCard } from '../EmptyStateCard';

const newEmptyGift = (): Gift => {
  return {
    id: '',
    name: '',
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
  const [, notificationsActions] = useNotifications();
  const [gift, setGift] = useState<Gift>(newEmptyGift());
  const [giftEditorOpen, setGiftEditorOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchListContents = () => {
    try {
      if (!appContext.giftList) {
        console.log('Cannot fetch list contents since no list is defined in the context.');
        return;
      }

      console.log('Fetching list contents: ', appContext.giftList.id);

      fetch(`${apiBaseUrl}/giftlist/contents/${appContext.giftList.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${appContext.loginInfo.jwt}`,
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => appContext.setGiftListContents(data));
        } else {
          console.error('Failed to fetch details', JSON.stringify(response, null, 2));
        }
      });
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const deleteGift = () => {
    fetch(`${apiBaseUrl}/gift/${gift.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
    }).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        notificationsActions.push({
          options: {
            variant: 'error',
          },
          message: `Impossible de supprimer l'entrée dans la liste.`,
        });
      } else {
        fetchListContents();
        setGift(newEmptyGift);
      }
    });
  };

  const toggleSelectGift = (gift: Gift) => {
    const url = gift.selectedById !== null ? `${apiBaseUrl}/gift/untake/${gift.id}` : `${apiBaseUrl}/gift/take/${gift.id}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
    }).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        notificationsActions.push({
          options: {
            variant: 'error',
          },
          message: `Impossible de marquer ce cadeau comme étant offert.`,
        });
      } else {
        fetchListContents();
        setGift(newEmptyGift);
      }
    });
  };

  const handleSaveGift = (giftToSave: Gift) => {
    setGiftEditorOpen(false);

    if (!appContext.giftList) {
      console.error('When calling handleSaveGift, the gift list must be set in app context.');
      return;
    }

    giftToSave.giftListId = appContext.giftList.id;

    fetch(`${apiBaseUrl}/gift/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
      body: JSON.stringify(giftToSave),
    }).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        notificationsActions.push({
          options: {
            variant: 'error',
          },
          message: `Impossible de sauver la liste pour le moment.`,
        });
      } else {
        fetchListContents(); //may be useless !
        setGift(newEmptyGift);
      }
    });
  };

  const handleDeleteGift = () => {
    deleteGift();
    setConfirmDeleteOpen(false);
  };

  const handleAddGift = () => {
    setGift(newEmptyGift());
    setGiftEditorOpen(true);
  };

  const handleEditGift = (giftToEdit: Gift) => {
    setGift(giftToEdit);
    setGiftEditorOpen(true);
  };

  useEffect(() => {
    fetchListContents();
    setGift(newEmptyGift());
  }, []);

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

  return (
    <Box display="grid" gridTemplateColumns="auto" m={2} p={0} width="100%">
    {appContext.giftListContents.length > 0 ? (
      <List>
        {appContext.giftListContents?.map((oneGift, index) => {

          const isTaken = oneGift.selectedById !== null;
          const decoration = isTaken ? 'line-through' : 'none';
          const primaryText = (
            <Typography sx={{textDecoration: decoration}}>{`${oneGift.name}`}</Typography>
          );

          const modifDate = new Date(oneGift.updatedAt.toString());
          const secondaryText = (
            <Typography variant="caption">
              {`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}
            </Typography>
          );

          const deleteAction: SwipeableListItemAction = {
            icon: <DeleteIcon />,
            color: 'error',
            onAction: () => {
              setGift(oneGift);
              setConfirmDeleteOpen(true);
            },
          };

          const takeAction : SwipeableListItemAction = {
            icon: <CheckIcon />,
            color: isTaken ? 'success' : 'default',
            onAction: () => {
              toggleSelectGift(oneGift);
            }
          }

          return (
            <SwipeableListItem
              key={`kdo-${index}`}
              keyId={`kdo-${index}`}
              onClickMain={() => handleEditGift(oneGift)}
              primaryText={primaryText}
              secondaryText={secondaryText}
              action1={editable ? deleteAction : undefined}
              action2={takeAction}
              icon={<Redeem />}
            />
          );
        })}
      </List>
    ) : (
      <EmptyStateCard title="C'est vide par ici ..." caption="Pour ajouter un cadeau à la liste, appuie sur le bouton '+'."/>
    )}

      <BottomDialog
        open={giftEditorOpen}
        handleClose={() => setGiftEditorOpen(false)}
        title="Editer un cadeau"
        contents={<GiftForm gift={gift} handleSave={handleSaveGift} editable={editable} />}
      />

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
