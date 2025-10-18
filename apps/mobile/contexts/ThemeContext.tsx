import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/ApiService';

interface ThemeContextType {
  isDarkMode: boolean;
  soundEnabled: boolean;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    success: string;
    danger: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (user?.sub) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      if (user?.sub) {
        const profile = await apiService.getUserProfile(user.sub);
        setIsDarkMode(profile.dark_mode);
        setSoundEnabled(profile.sound_enabled);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      if (user?.sub) {
        await apiService.updateUserProfile(user.sub, {
          dark_mode: isDarkMode,
          sound_enabled: soundEnabled,
          default_template: 'pomodoro',
        });
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    setTimeout(saveUserProfile, 100);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
    setTimeout(saveUserProfile, 100);
  };

  const lightColors = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#3b82f6',
    border: '#dddddd',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
  };

  const darkColors = {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    primary: '#60a5fa',
    border: '#444444',
    success: '#34d399',
    danger: '#f87171',
    warning: '#fbbf24',
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        soundEnabled,
        toggleDarkMode,
        toggleSound,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
