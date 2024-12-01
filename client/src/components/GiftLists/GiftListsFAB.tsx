import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import { FlexBox } from '../styled';
import { useContext } from 'react';
import { LoginContext } from '@/LoginContext';

export type GiftListsFABProps = {
    handleAdd: () => void;
}

const GiftListsFAB: React.FC<GiftListsFABProps> = ({ handleAdd }) => {
    const listEditorContext = useContext(LoginContext);
    return (
        <FlexBox flexDirection={'row-reverse'} sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Fab color="primary" aria-label="add" onClick={handleAdd}>
                <AddIcon />
            </Fab>
        </FlexBox>
    );
}

export default GiftListsFAB;