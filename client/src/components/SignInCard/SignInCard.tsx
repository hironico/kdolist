import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Key as KeyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';

import { apiBaseUrl } from '@/config';

export default function SignInCard() {

  const navigate = useNavigate();

  const handleKeycloakLogin = () => {
    // Navigate to the redirect route with the Keycloak login URL as a parameter
    const keycloakLoginUrl = `${apiBaseUrl}/auth/keycloak/login`;

    fetch(keycloakLoginUrl, {
        method: 'GET',
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            navigate(`/redirect?url=${encodeURIComponent(data.authUrl)}`);
          });
        } else {
          console.error('Failed to fetch auth url for KeyCloak.', JSON.stringify(response, null, 2));
        }
      });
  };

  return (
      <Card variant="outlined">

        <Typography
          component="h1"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >Nouveau !
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '250px' }}>
          <Typography>
            Pour accéder à toutes nos applications, vous avez besoin d'un compte hironico.net.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleKeycloakLogin}
            startIcon={<KeyIcon />}
          >
            <Typography sx={{ color: 'text.primary' }}>Compte hironico.net</Typography>
          </Button>
        </Box>
      </Card>
    );
}
