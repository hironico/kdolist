import { Box, List, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { Gift, LoginContext } from '@/LoginContext';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import { Redeem } from '@mui/icons-material';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import GiftForm from './GiftForm';
import { GiftsFAB } from './GiftsFAB';
import { EmptyStateCard, FacebookLikeCircularProgress } from '../EmptyStateCard';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const [gift, setGift] = useState<Gift>(newEmptyGift());
  const [giftEditorOpen, setGiftEditorOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

      setLoading(true);

      fetch(`${apiBaseUrl}/giftlist/contents/${appContext.giftList.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${appContext.loginInfo.jwt}`,
        },
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            appContext.setGiftListContents(data);
          });
        } else {
          showError('Impossible de récupérer le contenu de la liste.');
          console.error('Failed to fetch details', JSON.stringify(response, null, 2));
          navigate('/login');
        }
      });
    } catch (error) {
      showError(`Erreur technique: ${error}`);
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
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
        showError(`Impossible de supprimer l'entrée dans la liste.`);
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
        showError(`Impossible de marquer ce cadeau comme étant offert.`);
      } else {
        fetchListContents();
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
    setGift({...giftToEdit});
    setGiftEditorOpen(true);
  };

  const handleCloseGiftForm = () => {
    setGiftEditorOpen(false);
    fetchListContents();
  }

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
    <Box display="grid" gridTemplateColumns="auto" p={2} width="100%">
    {appContext.giftListContents.length > 0 ? (
      <List sx={{ m: '0px', mt: '10px' }}>
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
    ) : 
        loading ? (<EmptyStateCard title="Patience..." caption="La liste se charge. Ca ne devrait pas être très long." icon=<FacebookLikeCircularProgress/> />)
        : (<EmptyStateCard title="C'est vide par ici ..." caption="Pour ajouter un cadeau à la liste, appuie sur le bouton '+'."/>)     
    }

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
