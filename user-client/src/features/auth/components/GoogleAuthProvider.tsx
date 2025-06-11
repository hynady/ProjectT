import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleAuthProvider = ({ children }: GoogleAuthProviderProps) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};
