import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { FlexBox } from '../styled';

export type GiftListsFABProps = {
  handleAdd: () => void;
};

const GiftListsFAB: React.FC<GiftListsFABProps> = ({ handleAdd }) => {
  return (
    <FlexBox flexDirection={'row-reverse'} sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Fab color="primary" aria-label="add" onClick={handleAdd}>
        <AddIcon />
      </Fab>
    </FlexBox>
  );
};

export default GiftListsFAB;
