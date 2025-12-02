import Button from '@mui/material/Button';
import { Key as KeyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/config';

interface LoginButtonProps {
    text?: string;
    variant?: 'text' | 'outlined' | 'contained';
}

export default function LoginButton({ text = 'Entrer', variant = 'outlined' }: LoginButtonProps) {
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
        <Button
            fullWidth
            variant={variant}
            onClick={handleKeycloakLogin}
            startIcon={<KeyIcon />}
        >
            {text}
        </Button>
    );
}
