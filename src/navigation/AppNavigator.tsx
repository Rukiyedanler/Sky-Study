import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

// Types for Navigation
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainStackParamList = {
    Home: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal'
        }}
    >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

const MainNavigator = () => (
    <MainStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal'
        }}
    >
        <MainStack.Screen name="Home" component={HomeScreen} options={{ title: 'Sky Study' }} />
    </MainStack.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    // Loading state is already handled by AuthProvider, but keeping this as a safeguard
    if (loading) return null;

    return (
        <NavigationContainer>
            {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
