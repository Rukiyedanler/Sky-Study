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
    StatusBar,
    ImageBackground
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
        <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            
                            <View style={styles.glassPanel}>
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
                                            <ActivityIndicator color="#FFF" />
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

                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    glassPanel: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    header: {
        marginBottom: theme.spacing.xxl,
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
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
        backgroundColor: 'transparent',
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.l,
        height: 56,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    button: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.m,
    },
    buttonText: {
        ...theme.typography.body,
        color: '#FFF',
        fontWeight: 'bold',
        letterSpacing: 0.5,
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
        padding: theme.spacing.s,
    },
    linkText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
