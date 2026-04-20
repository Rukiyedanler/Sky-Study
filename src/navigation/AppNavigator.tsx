import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ActiveFlightScreen from '../screens/ActiveFlightScreen';
import LandingSuccessScreen from '../screens/LandingSuccessScreen';

// Types for Navigation
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainStackParamList = {
    Home: undefined;
    ActiveFlight: {
        route: string;
        duration: number;
    };
    LandingSuccess: {
        route: string;
        duration: number;
    };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'fade',
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
            animation: 'fade',
            gestureEnabled: true,
            gestureDirection: 'horizontal'
        }}
    >
        <MainStack.Screen name="Home" component={HomeScreen} options={{ title: 'Sky Study' }} />
        <MainStack.Screen name="ActiveFlight" component={ActiveFlightScreen} />
        <MainStack.Screen name="LandingSuccess" component={LandingSuccessScreen} options={{ animation: 'fade' }} />
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
