import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ActiveFlightScreen from '../screens/ActiveFlightScreen';
import LandingSuccessScreen from '../screens/LandingSuccessScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Types for Navigation
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type DrawerParamList = {
    HomeDrawer: undefined;
    LeaderboardDrawer: undefined;
    ProfileDrawer: undefined;
};

export type MainStackParamList = {
    MainDrawer: undefined;
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

const Drawer = createDrawerNavigator<DrawerParamList>();

const AppDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                drawerStyle: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    width: 250,
                },
                drawerActiveTintColor: '#3B82F6', // Canlı Mavi (Aktif)
                drawerInactiveTintColor: '#9CA3AF', // Gri (Pasif)
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginLeft: -15, // İkon ile yazı arasını biraz kapatmak için
                },
                drawerIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'HomeDrawer') {
                        iconName = focused ? 'airplane' : 'airplane-outline';
                    } else if (route.name === 'LeaderboardDrawer') {
                        iconName = focused ? 'trophy' : 'trophy-outline';
                    } else {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Drawer.Screen name="HomeDrawer" component={HomeScreen} options={{ drawerLabel: 'Uçuş Planı' }} />
            <Drawer.Screen name="LeaderboardDrawer" component={LeaderboardScreen} options={{ drawerLabel: 'Sıralama' }} />
            <Drawer.Screen name="ProfileDrawer" component={ProfileScreen} options={{ drawerLabel: 'Profil' }} />
        </Drawer.Navigator>
    );
};

const MainNavigator = () => (
    <MainStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: true,
            gestureDirection: 'horizontal'
        }}
    >
        <MainStack.Screen name="MainDrawer" component={AppDrawerNavigator} />
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
