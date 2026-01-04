import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Partner, AuthState } from '../types';
import { validateCredentials } from '../services/boltzApi';

interface AuthContextType extends AuthState {
  login: (apiKey: string, apiSecret: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'boltz_partner_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    partner: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const partner = JSON.parse(stored) as Partner;
        setState({
          isAuthenticated: true,
          partner,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (apiKey: string, apiSecret: string): Promise<boolean> => {
    try {
      // Validate the credentials by making an authenticated request
      const isValid = await validateCredentials(apiKey, apiSecret);
      
      if (!isValid) {
        return false;
      }

      // Create a short display ID from the API key
      const displayId = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);

      const partner: Partner = {
        id: displayId,
        name: 'Boltz Partner',
        apiKey,
        apiSecret,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(partner));
      setState({
        isAuthenticated: true,
        partner,
        isLoading: false,
      });

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAuthenticated: false,
      partner: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
