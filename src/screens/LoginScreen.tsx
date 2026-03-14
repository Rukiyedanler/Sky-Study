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
import { theme } from '../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        Keyboard.dismiss();
        setErrorMsg('');

        if (!email || !password) {
            setErrorMsg('Lütfen e-posta ve şifrenizi girin.');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            let errorMessage = 'Giriş Başarısız.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'E-posta veya şifre hatalı.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi formatı.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.';
            }
            setErrorMsg(`Hata: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>

                        <View style={styles.header}>
                            <Text style={styles.title}>Sky Study</Text>
                            <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {errorMsg ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            ) : null}

                            <TextInput
                                style={styles.input}
                                placeholder="E-posta Adresi"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Şifre"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color={theme.colors.surface} />
                                ) : (
                                    <Text style={styles.buttonText}>Giriş Yap</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.6} style={styles.linkTouch}>
                                    <Text style={styles.linkText}>Kayıt Ol</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    formContainer: {
        width: '100%',
    },
    errorContainer: {
        backgroundColor: theme.colors.error + '15', // 15 is hex for ~8% opacity
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.l,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        fontWeight: '600',
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.l,
        height: 56, // Large touch target
        ...theme.typography.body,
        color: theme.colors.text,
    },
    button: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.s,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        ...theme.typography.body,
        color: theme.colors.surface,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    linkTouch: {
        padding: theme.spacing.s, // Expands touch target
    },
    linkText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
