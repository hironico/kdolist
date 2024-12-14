import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { FlexBox } from '../styled';

export type GiftFABProps = {
  handleAdd: () => void;
};

export const GiftsFAB: React.FC<GiftFABProps> = ({ handleAdd }) => {
  // const listEditorContext = useContext(LoginContext);

  return (
    <FlexBox flexDirection={'row-reverse'} sx={{ position: 'absolute', bottom: 16, right: 16 }}>
      <Fab color="primary" aria-label="add" onClick={handleAdd}>
        <AddIcon />
      </Fab>
    </FlexBox>
  );
};
