import Diversity1Icon from '@mui/icons-material/Diversity1';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

const routes: Routes = {
  [Pages.Welcome]: {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: 'Welcome',
    icon: HomeIcon,
    inSideBar: true,
  },
  [Pages.LoginPage]: {
    component: asyncComponentLoader(() => import('@/pages/LoginPage')),
    path: '/login',
    title: 'Qui es-tu?',
    icon: VpnKeyIcon,
    inSideBar: false
  },
  [Pages.MyLists]: {
    component: asyncComponentLoader(() => import('@/pages/MyListsPage')),
    path: '/mylists',
    title: 'Mes listes',
    icon: CardGiftcardIcon,
    inSideBar: true
  },
  [Pages.ListContentsPage]: {
    component: asyncComponentLoader(() => import('@/pages/ListContentsPage')),
    path: '/listcontents',
    icon: CardGiftcardIcon,
    inSideBar: false
  },
  [Pages.MyGroupsListsPage]: {
    component: asyncComponentLoader(() => import('@/pages/MyGroupsListsPage')),
    path: '/mygroupslists',
    title: 'Listes partagées',
    icon: Diversity1Icon,
    inSideBar: true
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
