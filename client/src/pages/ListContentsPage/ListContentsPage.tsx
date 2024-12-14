import GifsList from '@/components/Gifts/GiftsList';
import Meta from '@/components/Meta';
import { FullSizeTopCenteredFlexBox } from '@/components/styled';
import { LoginContext } from '@/LoginContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Slide } from '@mui/material';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';

const ListContentsPage: React.FC = () => {
  const appContext = useContext(LoginContext);
  const { state } = useLocation();

  return (
    <ProtectedRoute>
      <Meta title={appContext.giftList?.name} />
      <Slide direction="left" in={true} timeout={500}>
        <FullSizeTopCenteredFlexBox>
          <GifsList editable={state.editable} />
        </FullSizeTopCenteredFlexBox>
      </Slide>
    </ProtectedRoute>
  );
};

export default ListContentsPage;
