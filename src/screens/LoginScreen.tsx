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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email || !password) {
            const msg = 'Lütfen uçuş bilgilerinizdeki tüm alanları doldurun.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Eksik Bilgi', msg);
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            let errorMessage = 'Giriş Başarısız';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'Biniş kartı onayı başarısız (E-posta veya şifre hatalı).';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi formatı.';
            }
            const msg = errorMessage;
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Giriş Reddedildi', msg);
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
                                <Ionicons name="airplane" size={60} color="#93C5FD" style={styles.logoIcon} />
                                <Text style={styles.title}>Sky Study</Text>
                                <Text style={styles.subtitle}>Uçuş Merkezine Hoş Geldiniz</Text>
                            </View>

                            <View style={styles.formContainer}>
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

                                <View style={styles.inputGroup}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#C084FC" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Erişim Şifresi"
                                        placeholderTextColor="rgba(30, 58, 138, 0.4)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!isPasswordVisible}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIconBtn}>
                                        <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#C084FC" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={handleLogin}
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
                                            <Text style={styles.buttonText}>Kule Bağlantısı Kur (Giriş Yap)</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.linkContainer}>
                                    <Text style={styles.questionText}>Henüz uçuş biletin yok mu? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
                                        <Text style={styles.linkText}>Kayıt Ol</Text>
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
        marginBottom: 50,
    },
    logoIcon: {
        marginBottom: 10,
        transform: [{ rotate: '-45deg' }]
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
    loginButton: {
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
        color: '#6EE7B7',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
