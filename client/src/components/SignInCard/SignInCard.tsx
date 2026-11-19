import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { liquidGlassSx } from '@/theme/ios27';
import LoginButton from './LoginButton';

/**
 * Sign-in card shown over the login page photo: iOS 27 Liquid Glass panel
 * (readable over any picture, in light and dark mode), title, filled button.
 */
export default function SignInCard() {
  return (
    <Box
      sx={{
        ...liquidGlassSx,
        borderRadius: '34px',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 360,
        color: 'text.primary',
      }}
    >
      <Typography variant="h5" component="h2">
        Le saviez-vous ?
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        // Links in the iOS accent colour (the browser default blue is unreadable in dark mode).
        sx={{ '& a': { color: 'primary.main', textDecoration: 'none', fontWeight: 600 } }}
      >
        Le compte hironico.net permet aussi d'utiliser{' '}
        <Link to="/redirect?url=https://bkp.hironico.net&newTab=true">
          Nico's Drive !
        </Link>
      </Typography>
      <LoginButton text="Se connecter" variant="contained" />
    </Box>
  );
}
