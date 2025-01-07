import GiftListsList from '@/components/GiftLists/GiftListsList';
import Meta from '@/components/Meta';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Slide } from '@mui/material';

function MyGroupsListsPage() {
  return (
    <ProtectedRoute>
      <Meta title="Listes partagées" />
      <Slide direction="right" in={true} timeout={500}>
        <FullSizeTopCenteredFlexBox>
          <GiftListsList editable={false} />
        </FullSizeTopCenteredFlexBox>
      </Slide>
    </ProtectedRoute>
  );
}

export default MyGroupsListsPage;
