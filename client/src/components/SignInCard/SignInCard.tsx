import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon } from '../CustomIcons/CustomIcons';
import FacebookLogin, { ProfileSuccessResponse } from '@greatsumini/react-facebook-login';
import useNotifications from '@/store/notifications';
import { LoginContext, LoginInfoProps } from '@/LoginContext';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';

import { apiBaseUrl } from '@/config';
import NoAccount from './NoAccount';
import { useGoogleLogin } from '@react-oauth/google';

export default function SignInCard() {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [, notificationsActions] = useNotifications();
    const [noAccountOpen, setNoAccountOpen] = React.useState(false);

    const loginContext = React.useContext(LoginContext);
    const navigate = useNavigate();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const authenticateForm = () => {
        if (emailError || passwordError) {
            return;
        }

        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

        const loginInfo = {
            email: email.value,
            password: password.value
        }
        
        const apiUrl = `${apiBaseUrl}/auth/login`;
        
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginInfo)
        })
        .then(response => {
            if (!response.ok) {
                showNotificationLoginError('Mauvaise combinaison identifiant, et mot de passe');
            } else {
                response.json()
                .then(loginInfo => {
                    console.log(`Received token: ${JSON.stringify(loginInfo)}`);       
                    loginContext.setLoginInfo(loginInfo);
                    navigate('/mylists', { replace: true });
                    showNotificationLoginSuccess(loginInfo);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error)
            showNotificationLoginError(error);
        });
    };

    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (isValid) {
            authenticateForm();
        }
    };

    const authenticate = (profile: ProfileSuccessResponse, authProvider: 'GOOGLE' | 'FACEBOOK') => {

        console.log(`Authenticate ${authProvider}: ${profile}`);

        const loginInfo: LoginInfoProps = {
            username: profile.name,
            email: profile.email,
            accessToken: profile.accessToken,
            accessTokenProvider: authProvider,
            id: profile.id,
            jwt: ''
        };        

        // loginContext.setLoginInfo(profile);

        const apiUrl = 'FACEBOOK' === authProvider ? `${apiBaseUrl}/auth/fb` : `${apiBaseUrl}/auth/google`;
        
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginInfo)
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Received token: ${JSON.stringify(data)}`); 
            loginInfo.jwt = data.accessToken;           
            loginContext.setLoginInfo(loginInfo);
            navigate('/mylists', { replace: true });
            showNotificationLoginSuccess(loginInfo);
        })
        .catch(error => {
            console.error('Error:', error)
            showNotificationLoginError(error);
        });
    }

    const fetchGoogleProfile = (accessToken: string) => {
        fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`)
        .then(response => {
            if (response.ok) {
                response.json()
                .then(profileData => {

                    const profile: ProfileSuccessResponse = {
                        id: profileData.sub,
                        email: profileData.email,
                        name: profileData.given_name,
                        accessToken: accessToken
                    }

                    authenticate(profile, 'GOOGLE');
                });
            } else {
                console.log('Cannot fetch google profile. Error code is: ' + response.status);
                showNotificationLoginError('Impossible de récupérer le profil Google!');
            }
        })
        .catch(error => {
            console.log(`Canot fetch google profile: ${error}`);
            showNotificationLoginError('Impossible de récupérer le profil Google!');
        })
    }

    const showNotificationLoginSuccess = (profile: LoginInfoProps) => {
        notificationsActions.push({
          options: {
            // Show fully customized notification
            // Usually, to show a notification, you'll use something like this:
            // notificationsActions.push({ message: ... })
            // `message` accepts string as well as ReactNode
            // If you want to show a fully customized notification, you can define
            // your own `variant`s, see @/sections/Notifications/Notifications.tsx
            variant: 'success',
          },
          message: `Hello ${profile.username} !!`
        });        
    }

    const showNotificationLoginError = (message: string) => {
        notificationsActions.push({
          options: {
            // Show fully customized notification
            // Usually, to show a notification, you'll use something like this:
            // notificationsActions.push({ message: ... })
            // `message` accepts string as well as ReactNode
            // If you want to show a fully customized notification, you can define
            // your own `variant`s, see @/sections/Notifications/Notifications.tsx
            variant: 'error',
          },
          message: message
        });
    }

    const googleLogin = useGoogleLogin({
        onSuccess: tokenResponse => fetchGoogleProfile(tokenResponse.access_token),
      });

    return (
        <Card variant="outlined">
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                S&apos;identifier...
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => googleLogin()}
                    startIcon={<GoogleIcon />}
                >
                    <Typography sx={{ color: 'text.primary' }}>Google</Typography>
                </Button>

                <FacebookLogin
                    appId="8944125668933019"
                    onSuccess={(response) => {
                        console.log('Login Success!', response);
                    }}
                    onFail={(error) => {
                        const errMsg = `Impossible de se connecter avec Facebook. ${JSON.stringify(error)}`;
                        console.error(errMsg)
                        showNotificationLoginError(errMsg);
                    }}
                    onProfileSuccess={(response) => {
                        console.log('Get Profile Success!', response);
                        authenticate(response, 'FACEBOOK');
                    }}
                    render={({ onClick }) => (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onClick}
                            startIcon={<FacebookIcon />}
                        >
                            <Typography sx={{ color: 'text.primary' }}>Facebook</Typography>
                        </Button>
                    )}
                />
            </Box>
            <Divider>ou bien à l&apos;ancienne</Divider>
            <Box
                component="form"
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="mon@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        sx={{ ariaLabel: 'email' }}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Mot de passe</FormLabel>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: 'baseline' }}
                        >
                            Mot de passe oublié ?
                        </Link>
                    </Box>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                    />
                </FormControl>
                <ForgotPassword open={open} handleClose={handleClose} />
                <Button fullWidth variant="contained" onClick={validateInputs}>
                    Entrer
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    <span>
                        <Link                 
                            component="button"
                            type="button"           
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                            onClick={() => setNoAccountOpen(true)}
                        >
                            Je n&apos;ai pas de compte.
                        </Link>
                    </span>
                </Typography>
                <NoAccount open={noAccountOpen} handleClose={() => setNoAccountOpen(false)} />
            </Box>
        </Card>
    );
}