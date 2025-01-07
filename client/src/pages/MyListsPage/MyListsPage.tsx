import GiftListsList from '@/components/GiftLists/GiftListsList';
import Meta from '@/components/Meta';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Slide } from '@mui/material';

function MyListsPage() { 
  return (
    <ProtectedRoute>
      <Meta title="Mes listes" />
      <Slide direction="right" in={true} timeout={500}>
        <FullSizeTopCenteredFlexBox>
          <GiftListsList editable={true} />
        </FullSizeTopCenteredFlexBox>
      </Slide>

      
    </ProtectedRoute>
  );
}

export default MyListsPage;
