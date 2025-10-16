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

export interface GiftList {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner?: LoginInfoProps;
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  isHidden?: boolean;
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

  giftList: GiftList | null;
  setGiftList: (list: GiftList | null) => void;

  giftListContents: Gift[];
  setGiftListContents: (contents: Gift[]) => void;
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

  giftList: defaultListInfo,
  setGiftList: (_list: GiftList | null) => {},

  giftListContents: defaultListContent,
  setGiftListContents: (_contents: Gift[]) => {},
};

export const LoginContext = createContext<AppContext>(defaultAppContext);

export const LoginContextProvider: FC<PropsWithChildren> = (props) => {
  const [loginInfo, setLoginInfo] = useState<AppContext['loginInfo']>(defaultLoginInfo);
  const [giftList, setGiftList] = useState<AppContext['giftList']>(defaultListInfo);
  const [giftListContents, setGiftListContents] = useState<AppContext['giftListContents']>([]);

  const checkToken = async () => {
    const response = await fetch(`${apiBaseUrl}/auth/whoami`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${loginInfo.jwt}`,
      },
    });

    if (!response.ok) {
      loginInfo.jwt = '';
      setLoginInfo(loginInfo);
    }

    return response.ok;
  };

  return (
    <LoginContext.Provider
      value={{
        loginInfo,
        setLoginInfo,
        checkToken,
        giftList,
        setGiftList,
        giftListContents,
        setGiftListContents,
      }}
    >
      {props.children}
    </LoginContext.Provider>
  );
};
