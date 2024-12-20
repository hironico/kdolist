import GiftListsList from '@/components/GiftLists/GiftListsList';
import Meta from '@/components/Meta';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useContext, useEffect, useState } from 'react';
import { apiBaseUrl } from '@/config';
import { GiftList, LoginContext } from '@/LoginContext';
import useNotifications from '@/store/notifications';
import { Slide } from '@mui/material';

function MyGroupsListsPage() {
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const fetchGiftLists = async () => {
    console.log('Fetching SHARED gift lists...');
    try {
      const response = await fetch(`${apiBaseUrl}/giftlist/shared`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${appContext.loginInfo.jwt}`,
        },
      });
      if (response.ok) {
        const myLists = await response.json();
        setGiftLists(myLists);
      } else {
        notificationsActions.push({
          options: {
            variant: 'error',
          },
          message: 'Impossible de récupérer les listes partagées.',
        });
      }
    } catch (error) {
      console.error(`Failed to fetch gift lists: ${error}`);
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Impossible de récupérer les listes partagées.',
      });
    }
  };

  useEffect(() => {
    fetchGiftLists();
    appContext.setGiftList(null);
  }, []);

  return (
    <ProtectedRoute>
      <Meta title="Listes partagées" />
      <Slide direction="right" in={true} timeout={500}>
        <FullSizeTopCenteredFlexBox>
          <GiftListsList giftLists={giftLists} editable={false} handleFetch={fetchGiftLists} />
        </FullSizeTopCenteredFlexBox>
      </Slide>
    </ProtectedRoute>
  );
}

export default MyGroupsListsPage;
