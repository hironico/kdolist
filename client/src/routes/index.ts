import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

const routes: Routes = {
  [Pages.Welcome]: {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: 'Welcome',
    icon: HomeIcon,
    inSideBar: false,
  },
  [Pages.LoginPage]: {
    component: asyncComponentLoader(() => import('@/pages/LoginPage')),
    path: '/login',
    title: 'Qui es-tu?',
    icon: VpnKeyIcon,
    inSideBar: false,
  },
  [Pages.MyLists]: {
    component: asyncComponentLoader(() => import('@/pages/MyListsPage')),
    path: '/mylists',
    title: 'Listes',
    icon: HomeIcon,
    inSideBar: true,
  },
  [Pages.ListContentsPage]: {
    component: asyncComponentLoader(() => import('@/pages/ListContentsPage')),
    path: '/listcontents',
    icon: CardGiftcardIcon,
    inSideBar: false,
  },
  [Pages.SharePage]: {
    component: asyncComponentLoader(() => import('@/pages/SharePage')),
    path: '/share',
    icon: CardGiftcardIcon,
    inSideBar: false,
  },
  [Pages.PrivacyPage]: {
    component: asyncComponentLoader(() => import('@/pages/PrivacyPage')),
    path: '/privacy',
    title: 'Confidentialité',
    icon: PrivacyTipIcon,
    inSideBar: true,
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
