import isMobile from '@/utils/is-mobile';

import type { Notifications } from './types';

const title = 'KDO list';

const email = 'hironico@hironico.net';

const repository = 'https://github.com/hironico/kdolist';

const messages = {
  app: {
    crash: {
      title: 'Oooops... Sorry, on dirait que quelque chose ne va pas comme prévu:',
      options: {
        email: `Essazer d'envoyer un email - ${email}`,
        reset: 'Appuyer ici pour tenter de redémarrer.',
      },
    },
  },
  loader: {
    fail: 'Hmmmmm, quelque chose déconne avec le chargement de ce composant... Ressayer plus tard pourrait être une bonne option.',
  },
  images: {
    failed: 'L\'image n\'a pas l\'air de vouloir se charger... :(',
  },
  404: 'Hey bro? Tu cherches quoi exactement?',
};

const dateFormat = 'MMMM DD, YYYY';

const notifications: Notifications = {
  options: {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    autoHideDuration: 1500,
  },
  maxSnack: isMobile ? 3 : 4,
};

const loader = {
  // no more blinking in your app
  delay: 300, // if your asynchronous process is finished during 300 milliseconds you will not see the loader at all
  minimumLoading: 700, // but if it appears, it will stay for at least 700 milliseconds
};

const defaultMetaTags = {
  image: '/cover.png',
  description: "Hironico's KDO List est une app de listes de cadeaux à partager avec ta famille, tes amis, ta tribu...",
};
const giphy404 = 'https://giphy.com/embed/xTiN0L7EW5trfOvEk0';

const url = new URL(window.location.href);
const apiBaseUrl =
  url.hostname === 'localhost'
    ? `https://${url.hostname}:2020/api/v1`
    : `https://kdolist.hironico.net/api/v1`;

// Keycloak configuration
// The Keycloak account management URL
const keycloakAccountUrl =
  url.hostname === 'localhost'
    ? 'https://localhost:9443/realms/hironico.net/account'
    : 'https://auth.hironico.net/realms/hironico.net/account';

export {
  loader,
  notifications,
  dateFormat,
  messages,
  repository,
  email,
  title,
  defaultMetaTags,
  giphy404,
  apiBaseUrl,
  keycloakAccountUrl,
};
