import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        Keyboard.dismiss();

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
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Pilot Ol</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="E-posta Adresi"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            returnKeyType="next"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Şifreyi Onayla"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Kayıt Ol</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton} activeOpacity={0.6}>
                            <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ebf4f6', // Açık tema
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24, // good spacing for mobile screens
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
        padding: 15, // Creates a 44px+ touch target height
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#b2dfdb',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#ff9800', // Dikkat çekici renk
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        minHeight: 50, // minimum height constraint
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10, // Added padding to expand touch target
    },
    linkText: {
        color: '#007bff',
        fontSize: 15,
    },
});
