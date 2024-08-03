import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, darkMode } from '../Colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load the theme mode from AsyncStorage on component mount
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem('themeMode');
        if (storedMode !== null) {
          setIsDarkMode(storedMode === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme mode', e);
      }
    };

    loadThemeMode();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme mode', e);
    }
  };

  const theme = isDarkMode ? darkMode : colors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
