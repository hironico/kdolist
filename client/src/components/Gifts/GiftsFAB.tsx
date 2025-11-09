import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { FlexBox } from '../styled';

export type GiftFABProps = {
  handleAdd: () => void;
};

export const GiftsFAB: React.FC<GiftFABProps> = ({ handleAdd }) => {
  // const listEditorContext = useContext(LoginContext);

  return (
    <FlexBox flexDirection={'row'} justifyContent={'center'} sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, zIndex: 1000 }}>
      <Fab color="primary" aria-label="add" onClick={handleAdd}>
        <AddIcon />
      </Fab>
    </FlexBox>
  );
};
