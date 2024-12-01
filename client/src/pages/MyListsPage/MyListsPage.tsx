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

function MyListsPage() {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [createListFormOpen, setCreateListFormOpen] = useState(false);

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
  }, []);

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

  const showCreateListForm = () => {
    setCreateListFormOpen(true);
  }

  const closeCreateListForm = () => {
    setCreateListFormOpen(false);
  }

  const listEditor = <ListEditor onCreateList={handleCreateGiftList}/>

  return (
    <ProtectedRoute>
      <Meta title="Mes listes" />
      <FullSizeTopCenteredFlexBox>
        <GiftListsList giftLists={giftLists} editable={true} handleFetch={fetchGiftLists} />
        <GiftListsFAB handleAdd={showCreateListForm} />
      </FullSizeTopCenteredFlexBox>

      <BottomDialog title="Nouvelle liste" 
                    open={createListFormOpen} 
                    handleClose={closeCreateListForm}
                    contents={listEditor}
      />

    </ProtectedRoute>
  );
}

export default MyListsPage;

