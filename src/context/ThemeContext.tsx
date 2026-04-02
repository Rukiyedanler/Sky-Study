import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme } from '../theme';

interface ThemeContextProps {
    theme: Theme;
    isNightMode: boolean;
    toggleNightMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
    theme: lightTheme,
    isNightMode: false,
    toggleNightMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isNightMode, setIsNightMode] = useState(false);

    const toggleNightMode = () => {
        setIsNightMode(prev => !prev);
    };

    const theme = isNightMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isNightMode, toggleNightMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
