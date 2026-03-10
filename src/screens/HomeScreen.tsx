import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Sky-Study Uçuş Merkezine Hoş Geldiniz</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#333',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#f44336',
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
