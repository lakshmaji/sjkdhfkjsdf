import React, { createContext, useContext, useState, useEffect } from 'react';
import Auth0 from 'react-native-auth0';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '../config';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // For development, we'll simulate authentication
      // In production, implement proper Auth0 token checking
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      // For development, simulate login
      // In production, use: const credentials = await auth0.webAuth.authorize({ scope: 'openid profile email' });
      
      const mockUser = {
        sub: 'auth0|123456',
        email: 'user@example.com',
        name: 'Demo User',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // In production, use: await auth0.webAuth.clearSession();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
