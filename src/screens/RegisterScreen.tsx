import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            const msg = 'Lütfen tüm alanları doldurun.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
            return;
        }

        if (password !== confirmPassword) {
            const msg = 'Şifreler eşleşmiyor.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Başarılı kayıtta otomatik giriş yapılır, AppNavigator MainStack'e yönlendirir.
        } catch (error: any) {
            let errorMessage = 'Kayıt Başarısız';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu e-posta adresi zaten kullanımda.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf (en az 6 karakter olmalı).';
            }
            const msg = `Kayıt Başarısız: ${errorMessage} (${error.code || error.message})`;
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
            console.error('Firebase Auth Hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pilot Ol</Text>

            <TextInput
                style={styles.input}
                placeholder="E-posta Adresi"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Kayıt Ol</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
                <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#ebf4f6', // Açık tema, gökyüzüne gönderme
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#b2dfdb',
    },
    button: {
        backgroundColor: '#ff9800', // Uçuş temasına uygun dikkat çekici renk
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#007bff',
        fontSize: 14,
    },
});
