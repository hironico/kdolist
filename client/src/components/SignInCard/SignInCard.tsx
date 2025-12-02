import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Card from '../Card/Card';
import LoginButton from './LoginButton';

export default function SignInCard() {
  return (
    <Card variant="outlined">
      <Typography variant="subtitle1"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >Le saviez-vous ?
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '250px' }}>
        <Typography variant="subtitle2">
          Le compte hironico.net permet aussi d'utiliser
          <Link to="/redirect?url=https://bkp.hironico.net&newTab=true">
            Nico's Drive !
          </Link>
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LoginButton text="Se connecter" />
      </Box>
    </Card>
  );
}
