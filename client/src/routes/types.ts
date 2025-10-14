import { FC } from 'react';
import { PathRouteProps } from 'react-router-dom';

import type { SvgIconProps } from '@mui/material/SvgIcon';

enum Pages {
  Welcome,
  LoginPage,
  MyLists,
  ListContentsPage,
  SharePage,
  PrivacyPage,
  KeycloakCallback,
  KeycloakError,
  ExternalRedirect,
  NotFound,
}

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: FC<SvgIconProps>;
  inSideBar?: boolean;
};

type Routes = Record<Pages, PathRouteProps & PathRouteCustomProps>;

export type { Routes, PathRouteCustomProps };
export { Pages };
