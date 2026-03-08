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
            // Çıkış yapıldığında AppNavigator AuthStack'e geri dönecek.
        } catch (error) {
            Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Sky-Study Uçuş Merkezine Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
                Pilot: {auth.currentUser?.email || 'Bilinmeyen Kullanıcı'}
            </Text>

            <TouchableOpacity
                style={styles.flightButton}
                onPress={() => navigation.navigate('Pomodoro')}
            >
                <Text style={styles.flightButtonText}>Uçuşa (Pomodoro) Başla</Text>
            </TouchableOpacity>

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
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    flightButton: {
        backgroundColor: '#4caf50', // Yeşil / Güvenli Uçuş teması
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 20,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    flightButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 10,
    },
    logoutText: {
        color: '#d32f2f', // Kırmızı çıkış
        fontSize: 16,
        fontWeight: '600',
    },
});
