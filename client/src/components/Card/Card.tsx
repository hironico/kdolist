import { styled } from '@mui/material/styles';
import MuiCard from '@mui/material/Card';
import { iOSBoxShadow } from '@/theme/muios';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow: iOSBoxShadow,
}));

export default Card;
