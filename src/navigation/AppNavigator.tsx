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
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Types for Navigation
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type TabParamList = {
    HomeTab: undefined;
    LeaderboardTab: undefined;
    ProfileTab: undefined;
};

export type MainStackParamList = {
    MainTabs: undefined;
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

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255, 255, 255, 0.1)',
                    position: 'absolute',
                    bottom: 0,
                    elevation: 0,
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'airplane' : 'airplane-outline';
                    } else if (route.name === 'LeaderboardTab') {
                        iconName = focused ? 'trophy' : 'trophy-outline';
                    } else {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Uçuş' }} />
            <Tab.Screen name="LeaderboardTab" component={LeaderboardScreen} options={{ tabBarLabel: 'Sıralama' }} />
            <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
        </Tab.Navigator>
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
        <MainStack.Screen name="MainTabs" component={TabNavigator} />
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
