import isMobile from '@/utils/is-mobile';

import type { Notifications } from './types';

const title = 'KDO list';

const email = 'hironico@hironico.net';

const repository = 'https://github.com/hironico/kdolist';

const messages = {
  app: {
    crash: {
      title: 'Oooops... Sorry, I guess, something went wrong. You can:',
      options: {
        email: `contact with author by this email - ${email}`,
        reset: 'Press here to reset the application',
      },
    },
  },
  loader: {
    fail: 'Hmmmmm, there is something wrong with this component loading process... Maybe trying later would be the best idea',
  },
  images: {
    failed: 'something went wrong during image loading :(',
  },
  404: 'Hey bro? What are you looking for?',
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
  description: "Hironico's KDO List is a gift list management app",
};
const giphy404 = 'https://giphy.com/embed/xTiN0L7EW5trfOvEk0';

const url = new URL(window.location.href);
const apiBaseUrl =
  url.hostname === 'localhost'
    ? `https://${url.hostname}:2020/api/v1`
    : `${url.protocol}//${url.hostname}/api/v1`;

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
};
