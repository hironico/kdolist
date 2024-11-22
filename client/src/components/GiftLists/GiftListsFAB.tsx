import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import { FlexBox } from '../styled';
import { useContext } from 'react';
import { LoginContext } from '@/LoginContext';

export type GiftListsFABProps = {
    handleAdd: () => void;
    handleDelete?: () => void;
}

const GiftListsFAB: React.FC<GiftListsFABProps> = ({ handleAdd, handleDelete }) => {
    const listEditorContext = useContext(LoginContext);

    const displayHandleDelete = listEditorContext.giftList ? 'inherit' : 'none';

    return (
        <FlexBox flexDirection={'row-reverse'} sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Fab color="primary" aria-label="add" onClick={handleAdd}>
                <AddIcon />
            </Fab>

            <Fab color="error" aria-label="remove" onClick={handleDelete} sx={{marginRight: '16px', display: displayHandleDelete}}>
                <DeleteIcon />
            </Fab>
        </FlexBox>
    );
}

export default GiftListsFAB;