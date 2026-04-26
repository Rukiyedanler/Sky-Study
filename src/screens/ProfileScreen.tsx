import React, { useContext, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ImageBackground,
  SafeAreaView,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

import { auth, db } from '../services/firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';

export default function ProfileScreen() {
    const { theme } = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { user } = useContext(AuthContext);

    const [totalXP, setTotalXP] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchProfileData = async () => {
                if (!user) return;
                setLoading(true);
                try {
                    const qAll = query(collection(db, 'flights'), where('userId', '==', user.uid));
                    const allSnapshot = await getDocs(qAll);
                    let sumXP = 0;
                    let sumDuration = 0;
                    
                    allSnapshot.forEach(doc => {
                        const data = doc.data();
                        sumXP += (data.xp || 0);
                        sumDuration += (data.duration || 0);
                    });

                    if (isActive) {
                        setTotalXP(sumXP);
                        setTotalMinutes(sumDuration);
                    }
                } catch (error) {
                    console.error("Profil bilgileri çekilirken hata:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchProfileData();

            return () => { isActive = false; };
        }, [user])
    );

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            Alert.alert("Çıkış Hatası", error.message);
        }
    };

    const getRankInfo = (xp: number) => {
        if (xp >= 2000) return "Kaptan Pilot";
        if (xp >= 500) return "İkinci Kaptan";
        return "Öğrenci Pilot";
    };

    const getRankIcon = (xp: number) => {
        if (xp >= 2000) return "airplane";
        if (xp >= 500) return "paper-plane";
        return "school";
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0 && m > 0) return `${h} Saat ${m} Dk`;
        if (h > 0) return `${h} Saat`;
        return `${m} Dakika`;
    };

    return (
        <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.content}>
                            {/* Üst Profil Kartı */}
                            <BlurView intensity={70} tint="dark" style={styles.profileCard}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarCircle}>
                                        <Ionicons name="person" size={50} color="#E5E7EB" />
                                    </View>
                                </View>
                                
                                <Text style={styles.emailText}>{user?.email}</Text>
                                
                                <View style={styles.rankBadge}>
                                    <Ionicons name={getRankIcon(totalXP)} size={16} color="#0F172A" style={styles.rankIcon} />
                                    <Text style={styles.rankText}>{getRankInfo(totalXP)}</Text>
                                </View>
                            </BlurView>

                            {/* İstatistikler */}
                            <View style={styles.statsContainer}>
                                <BlurView intensity={60} tint="dark" style={styles.statCard}>
                                    <Ionicons name="star" size={32} color="#FBBF24" />
                                    <Text style={styles.statValue}>{totalXP} XP</Text>
                                    <Text style={styles.statLabel}>Toplam Uçuş Puanı</Text>
                                </BlurView>
                                
                                <BlurView intensity={60} tint="dark" style={styles.statCard}>
                                    <Ionicons name="time" size={32} color="#6EE7B7" />
                                    <Text style={[styles.statValue, { color: '#6EE7B7' }]}>{formatDuration(totalMinutes)}</Text>
                                    <Text style={styles.statLabel}>Toplam Odaklanma</Text>
                                </BlurView>
                            </View>

                            {/* Alt Çıkış Butonu */}
                            <View style={styles.bottomSection}>
                                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                                    <Ionicons name="log-out-outline" size={24} color="#0F172A" />
                                    <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: theme.spacing.xl,
        paddingBottom: 130, // Yüzen alt menüye çarpmasını önlemek için.
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileCard: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: 'rgba(31, 41, 55, 0.85)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        marginTop: theme.spacing.m,
    },
    avatarContainer: {
        marginBottom: theme.spacing.m,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    emailText: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6EE7B7', // Nane yeşili bg
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.round,
        marginTop: theme.spacing.xs,
    },
    rankIcon: {
        marginRight: 6,
    },
    rankText: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xl,
        gap: theme.spacing.l,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    statValue: {
        ...theme.typography.h2,
        // Default text scaling for long values (if needed) but font size handles it mostly
        color: '#FBBF24',
        marginTop: theme.spacing.s,
        marginBottom: 2,
        textAlign: 'center',
    },
    statLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    bottomSection: {
        marginTop: 'auto',
        paddingVertical: theme.spacing.xl,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6EE7B7', // Pastel Nane Yeşili
        paddingVertical: 18,
        borderRadius: theme.borderRadius.round,
    },
    logoutButtonText: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    }
});
