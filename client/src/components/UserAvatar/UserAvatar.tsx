import { LoginContext } from '@/LoginContext';
import { Avatar } from '@mui/material';
import { useContext } from 'react';

const UserAvatar = () => {
  const appContext = useContext(LoginContext);

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar() {
    const { username } = appContext.loginInfo;
    const name = username ? username : '';
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}`,
    };
  }

  const { username } = appContext.loginInfo;
  return username === '' ? <></> : <Avatar {...stringAvatar()} />;
};

export default UserAvatar;
