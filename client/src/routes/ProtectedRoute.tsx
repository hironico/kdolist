import { PropsWithChildren, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginContext } from '@/LoginContext';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const appContext = useContext(LoginContext);

  useEffect(() => {
    appContext.checkToken();
  }, []);

  return appContext.loginInfo.jwt !== '' ? children : <Navigate to="/login" replace />;
}
