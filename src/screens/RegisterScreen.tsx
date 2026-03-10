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
    Keyboard,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const handleRegister = async () => {
        Keyboard.dismiss();

        if (!email || !password || !confirmPassword) {
            const msg = 'Lütfen uçuş biletiniz için tüm alanları doldurun.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Eksik Bilgi', msg);
            return;
        }

        if (password !== confirmPassword) {
            const msg = 'Rezerve edilen şifreler eşleşmiyor.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Güvenlik İhlali', msg);
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            let errorMessage = 'Kayıt Başarısız';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu pilot adresi zaten kayıtlı.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz rota (e-posta adresi hatalı).';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf (en az 6 karakter olmalı).';
            }
            const msg = errorMessage;
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Kayıt Reddedildi', msg);
            console.error('Firebase Auth Hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
            <LinearGradient
                colors={['#FAFAF9', '#f3f4f6']}
                style={styles.gradientBackground}
            >
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>

                            <View style={styles.header}>
                                <Ionicons name="compass" size={60} color="#93C5FD" style={styles.logoIcon} />
                                <Text style={styles.title}>Pilot Ol</Text>
                                <Text style={styles.subtitle}>Sky Study Ekibine Katıl</Text>
                            </View>

                            <View style={styles.formContainer}>

                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Ionicons name="mail-outline" size={20} color="#C084FC" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pilot E-posta Adresi"
                                        placeholderTextColor="rgba(30, 58, 138, 0.4)"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputGroup}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#C084FC" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Erişim Şifresi"
                                        placeholderTextColor="rgba(30, 58, 138, 0.4)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!isPasswordVisible}
                                        returnKeyType="next"
                                    />
                                    <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIconBtn}>
                                        <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#C084FC" />
                                    </TouchableOpacity>
                                </View>

                                {/* Confirm Password Input */}
                                <View style={styles.inputGroup}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#C084FC" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Şifreyi Onayla"
                                        placeholderTextColor="rgba(30, 58, 138, 0.4)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!isPasswordVisible}
                                        returnKeyType="done"
                                        onSubmitEditing={handleRegister}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#93C5FD', '#C084FC']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Biniş Kartını Oluştur</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.linkContainer}>
                                    <Text style={styles.questionText}>Pilot Ehliyetin var mı? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.6}>
                                        <Text style={styles.linkText}>Giriş Yap</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAF9',
    },
    gradientBackground: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        marginBottom: 5,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#1E3A8A',
        letterSpacing: 1.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#1E3A8A',
        opacity: 0.7,
        marginTop: 8,
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#93C5FD',
        paddingHorizontal: 15,
        height: 58,
        shadowColor: '#93C5FD',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#1E3A8A',
        fontSize: 16,
        height: '100%',
    },
    eyeIconBtn: {
        padding: 10,
    },
    registerButton: {
        marginTop: 10,
        borderRadius: 14,
        shadowColor: '#C084FC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    buttonGradient: {
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        alignItems: 'center',
        padding: 10,
    },
    questionText: {
        color: '#1E3A8A',
        opacity: 0.8,
        fontSize: 15,
    },
    linkText: {
        color: '#6EE7B7', // Nane yeşili
        fontSize: 16,
        fontWeight: 'bold',
    },
});
