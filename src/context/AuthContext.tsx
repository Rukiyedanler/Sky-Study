import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { View, ActivityIndicator } from 'react-native';
import { useThemeContext } from './ThemeContext';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { theme } = useThemeContext();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
    });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
