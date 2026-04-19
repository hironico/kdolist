import { createContext, FC, PropsWithChildren, useState } from 'react';
import { apiBaseUrl } from './config';

export interface LoginProfile {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
}

export interface LoginInfoProps {
  id: string | undefined;
  username: string | undefined;
  firstname?: string;
  lastname?: string;
  password?: string;
  email: string | undefined;
  accessToken?: string;
  accessTokenProvider?: string;
  jwt?: string;
  profile?: LoginProfile | null;
}

export interface GiftListAccess {
  groupId: string;
}

export interface GiftList {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner?: LoginInfoProps;
  showTakenToOwner?: boolean;
  isCollaborative?: boolean;
  groupAccesses?: GiftListAccess[];
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  isHidden?: boolean;
  isFavorite?: boolean;
  selectedAt?: Date | null;
  selectedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  giftListId?: string;

  links: GiftLink[];
  images: GiftImage[];
}

export interface GiftLink {
  id: string;
  url: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  giftId: string;
}

export interface GiftImage {
  id?: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  giftId: string;
}

export interface AppContext {
  loginInfo: LoginInfoProps;
  setLoginInfo: (info: LoginInfoProps) => void;
  checkToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;

  giftList: GiftList | null;
  setGiftList: (list: GiftList | null) => void;

  giftListContents: Gift[];
  setGiftListContents: (contents: Gift[]) => void;

  // PWA update status
  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;
}

const defaultLoginInfo: LoginInfoProps = {
  username: '',
  email: '',
  accessToken: '',
  accessTokenProvider: '',
  id: '',
  jwt: '',
};

const defaultListInfo: GiftList = {
  id: '-1',
  name: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerId: '',
};
const defaultListContent: Gift[] = [];

const defaultAppContext: AppContext = {
  loginInfo: defaultLoginInfo,
  setLoginInfo: (_loginInfo: LoginInfoProps) => {},
  checkToken: () => {
    return new Promise<boolean>((accept) => {
      accept(false);
    });
  },
  refreshToken: () => {
    return new Promise<boolean>((accept) => {
      accept(false);
    });
  },

  giftList: defaultListInfo,
  setGiftList: (_list: GiftList | null) => {},

  giftListContents: defaultListContent,
  setGiftListContents: (_contents: Gift[]) => {},

  updateAvailable: false,
  setUpdateAvailable: (_available: boolean) => {},
};

export const LoginContext = createContext<AppContext>(defaultAppContext);

export const LoginContextProvider: FC<PropsWithChildren> = (props) => {
  // Initialize login info from localStorage if available
  const [loginInfo, setLoginInfoState] = useState<AppContext['loginInfo']>(() => {
    try {
      const stored = localStorage.getItem('kdolist_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultLoginInfo, ...parsed };
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
    return defaultLoginInfo;
  });

  const [giftList, setGiftList] = useState<AppContext['giftList']>(defaultListInfo);
  const [giftListContents, setGiftListContents] = useState<AppContext['giftListContents']>([]);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Wrapper to persist login info to localStorage
  const setLoginInfo = (info: LoginInfoProps) => {
    setLoginInfoState(info);
    
    // Persist to localStorage
    try {
      if (info.jwt) {
        localStorage.setItem('kdolist_auth', JSON.stringify(info));
      } else {
        // Clear auth if JWT is empty
        localStorage.removeItem('kdolist_auth');
      }
    } catch (error) {
      console.error('Error saving auth to localStorage:', error);
    }
  };

  const checkToken = async () => {
    if (!loginInfo.jwt) {
      return false;
    }

    const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${loginInfo.jwt}`,
      },
    });

    if (!response.ok) {
      // Clear invalid token
      setLoginInfo({ ...loginInfo, jwt: '' });
    }

    return response.ok;
  };

  const refreshToken = async () => {
    if (!loginInfo.jwt || !loginInfo.accessToken) {
      console.error('No JWT or refresh token available');
      return false;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginInfo.jwt}`,
        },
        body: JSON.stringify({ token: loginInfo.accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newJwt = data.accessToken;

        // Update login info with new JWT
        const updatedInfo = { ...loginInfo, jwt: newJwt };
        setLoginInfo(updatedInfo);

        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Token refresh failed:', response.status);
        // Clear auth on refresh failure
        setLoginInfo({ ...loginInfo, jwt: '', accessToken: '' });
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  return (
    <LoginContext.Provider
      value={{
        loginInfo,
        setLoginInfo,
        checkToken,
        refreshToken,
        giftList,
        setGiftList,
        giftListContents,
        setGiftListContents,
        updateAvailable,
        setUpdateAvailable,
      }}
    >
      {props.children}
    </LoginContext.Provider>
  );
};
