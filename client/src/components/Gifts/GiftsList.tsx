import { Box, List } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Gift, LoginContext } from '@/LoginContext';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import GiftForm from './GiftForm';
import { GiftsFAB } from './GiftsFAB';
import { EmptyStateCard, FacebookLikeCircularProgress } from '../EmptyStateCard';
import { useNavigate } from 'react-router-dom';
import GiftsListItem from './GiftsListItem';

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

      appContext.setGiftListContents([]);
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

  useEffect(() => {
    appContext.setGiftListContents([]);
    setLoading(true);
    fetchListContents();
    setGift(newEmptyGift());    
  }, []);

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
    }).catch(error => {
        console.error(`Cannot delete gift item from the list: ${error}`);
        showError(`Impossible de supprimer l'entrée dans la liste.`);
    }).finally(()=> {
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

  if (loading) {
    return <EmptyStateCard title="Patience..." caption="La liste se charge. Ca ne devrait pas être très long." icon=<FacebookLikeCircularProgress/> />;
  }

  if (appContext.giftListContents.length === 0) {
    return <EmptyStateCard title="C'est vide par ici ..." caption="Pour ajouter un cadeau à la liste, appuie sur le bouton '+'."/>;
  }

  return (
    <Box display="grid" gridTemplateColumns="auto" p={2} width="100%">
    <List sx={{ m: '0px', mt: '10px' }}>
      {appContext.giftListContents?.map((oneGift, index) => {
        return <GiftsListItem key={`kdo-${index}`} 
                              oneGift={oneGift} 
                              editable={editable} 
                              onDelete={() => handleConfirmDeleteGift(oneGift)} 
                              onTake={() => toggleSelectGift(oneGift)} 
                              onEdit={() => handleEditGift(oneGift)}/>
        
      })}
    </List>

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
