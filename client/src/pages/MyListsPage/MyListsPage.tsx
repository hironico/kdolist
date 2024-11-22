import GiftListsList from '@/components/GiftLists/GiftListsList';
import Meta from '@/components/Meta';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useContext, useEffect, useState } from 'react';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import BottomDialog from '@/components/BottomDialog/BottomDialog';

import ListEditor from '@/components/GiftLists/ListEditorForm';
import useNotifications from '@/store/notifications';
import { GiftListsFAB } from '@/components/GiftLists';
import ActionSheet, { ActionSheetEntries } from '@/components/ActionSheet/ActionSheet';

function MyListsPage() {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [createListFormOpen, setCreateListFormOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const fetchGiftLists = async () => {
    console.log('Fetching my gift lists...');
    try {
      const response = await fetch(`${apiBaseUrl}/giftlist/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${appContext.loginInfo.jwt}`
        }
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
        message: 'Impossible de récupérer les listes pour le moment.'
      });
    }
  };

  useEffect(() => {
    fetchGiftLists();
    appContext.setGiftList(null);
  }, [appContext, fetchGiftLists]);

  const handleCreateGiftList = async (name: string) => {    
    const response = await fetch(`${apiBaseUrl}/giftlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
      body: JSON.stringify({
        name: name
      }),
    });

    if (!response.ok) {
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Impossible de créer cette liste pour le moment.'
      });
    } else {
      fetchGiftLists();
    }

    setCreateListFormOpen(false);
  };

  const handleDeleteGiftList = async () => {
    if (!appContext.giftList) {
      console.warn('The handleDeleteGiftList should have not been called without a selected list in the context');
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
        message: 'Impossible de SUPPRIMER cette liste pour le moment.'
      });
    } else {
      fetchGiftLists();
      appContext.setGiftList(null);
    }
  }

  const showCreateListForm = () => {
    setCreateListFormOpen(true);
  }

  const closeCreateListForm = () => {
    setCreateListFormOpen(false);
  }

  const listEditor = <ListEditor onCreateList={handleCreateGiftList}/>

  const actions:ActionSheetEntries[] = [
    {
      label: 'Oui, effacer la liste',
      color: 'secondary',
      onAction: () => handleDeleteGiftList()
    }
  ];

  const defaultAction: ActionSheetEntries = {
    label: 'Non, laisse tomber',
    color: 'primary',
    onAction: () => setShowConfirmDialog(false)
  }

  return (
    <ProtectedRoute>
      <Meta title="Mes listes" />
      <FullSizeTopCenteredFlexBox>
        <GiftListsList giftLists={giftLists} editable={true} />
        <GiftListsFAB handleAdd={showCreateListForm} handleDelete={() => setShowConfirmDialog(true)}/>
      </FullSizeTopCenteredFlexBox>

      <BottomDialog title="Nouvelle liste" 
                    open={createListFormOpen} 
                    handleClose={closeCreateListForm}
                    contents={listEditor}
      />

      <ActionSheet open={showConfirmDialog} handleClose={() => setShowConfirmDialog(false)} entries={actions} defaultEntry={defaultAction}/>

    </ProtectedRoute>
  );
}

export default MyListsPage;

