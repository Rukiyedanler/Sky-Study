import React, { useState, useContext, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  ImageBackground,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { BlurView } from 'expo-blur';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

interface LeaderboardUser {
    uid: string;
    emailSplit: string;
    xp: number;
    rank: number;
}

export default function LeaderboardScreen({ navigation }: any) {
    const { theme } = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { user } = useContext(AuthContext);

    const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchLeaderboard = async () => {
                setLoading(true);
                try {
                    const snapshot = await getDocs(collection(db, 'flights'));
                    const userStats: Record<string, { email: string, xp: number }> = {};
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const uid = data.userId;
                        if (!uid) return;

                        const xp = data.xp || 0;
                        const email = data.userEmail || data.email || `${uid.substring(0,6)}...`;
                        
                        if (!userStats[uid]) {
                            userStats[uid] = { email, xp: 0 };
                        }
                        userStats[uid].xp += xp;
                        
                        if (data.userEmail && userStats[uid].email.includes('...')) {
                            userStats[uid].email = data.userEmail;
                        }
                    });

                    // Array'e çevir, sırala
                    const allUsers: LeaderboardUser[] = Object.keys(userStats)
                        .map(uid => ({
                            uid,
                            emailSplit: userStats[uid].email.split('@')[0], 
                            xp: userStats[uid].xp,
                            rank: 0, 
                        }))
                        .sort((a, b) => b.xp - a.xp);

                    // Rank ata
                    allUsers.forEach((u, index) => {
                        u.rank = index + 1;
                    });

                    if (isActive) {
                        setTopUsers(allUsers.slice(0, 10)); // Top 10

                        if (user) {
                            const myLog = allUsers.find(u => u.uid === user.uid);
                            if (myLog) {
                                setCurrentUserRank(myLog);
                            } else {
                                setCurrentUserRank({ uid: user.uid, emailSplit: user.email?.split('@')[0] || 'Sen', xp: 0, rank: allUsers.length + 1 });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Leaderboard fetch error:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchLeaderboard();

            return () => { isActive = false; };
        }, [user])
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz uçuş kaydedilmedi.</Text>
            </View>
        );
    };

    const renderItem = ({ item }: { item: LeaderboardUser }) => {
        const isMe = user?.uid === item.uid;
        
        // Ödül ikonları
        let icon = null;
        if (item.rank === 1) icon = <Ionicons name="medal" size={24} color="#FBBF24" />; // Altın
        else if (item.rank === 2) icon = <Ionicons name="medal" size={24} color="#9CA3AF" />; // Gümüş
        else if (item.rank === 3) icon = <Ionicons name="medal" size={24} color="#B45309" />; // Bronz
        else icon = <Text style={styles.rankNumber}>{item.rank}</Text>;

        return (
            <View style={[styles.userRow, isMe && styles.myRow]}>
                <View style={styles.rankWrapper}>
                    {icon}
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, isMe && styles.myUserName]} numberOfLines={1}>
                        {isMe ? 'Sen' : item.emailSplit}
                    </Text>
                </View>
                <View style={styles.xpWrapper}>
                    <Text style={[styles.xpText, isMe && styles.myXpText]}>{item.xp} XP</Text>
                </View>
            </View>
        );
    };

    return (
        <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <BlurView intensity={70} tint="dark" style={styles.panel}>
                        
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ position: 'absolute', left: 0 }}>
                                <Ionicons name="menu" size={32} color={theme.colors.text} />
                            </TouchableOpacity>
                            <Ionicons name="trophy" size={32} color="#FBBF24" style={{ marginRight: 8 }} />
                            <Text style={styles.title}>Liderlik Tablosu</Text>
                        </View>
                        <Text style={styles.subtitle}>En Yüksek Odaklanma Başarıları</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 40 }} />
                        ) : (
                            <FlatList
                                data={topUsers}
                                keyExtractor={(item) => item.uid}
                                renderItem={renderItem}
                                ListEmptyComponent={renderEmpty}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                    </BlurView>

                    {/* Kendi statümü en alta sabitle (Eğer ilk 10'da değilsem veya olsam da ekstra vurgu olarak) */}
                    {!loading && currentUserRank && (
                        <BlurView intensity={90} tint="dark" style={styles.fixedMyRank}>
                            <Text style={styles.fixedMyRankLabel}>Sıralaman</Text>
                            <View style={styles.userRow}>
                                <View style={styles.rankWrapper}>
                                    <Text style={[styles.rankNumber, { color: '#6EE7B7' }]}>#{currentUserRank.rank}</Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, styles.myUserName]}>
                                        Sen
                                    </Text>
                                </View>
                                <View style={styles.xpWrapper}>
                                    <Text style={[styles.xpText, styles.myXpText]}>{currentUserRank.xp} XP</Text>
                                </View>
                            </View>
                        </BlurView>
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
        padding: theme.spacing.m,
    },
    panel: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.85)', 
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.m,
        marginBottom: theme.spacing.xs,
    },
    title: {
        ...theme.typography.h1,
        color: '#FFFFFF',
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
    },
    listContent: {
        paddingBottom: theme.spacing.l,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.s,
    },
    myRow: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Canlı mavi glow
        borderColor: '#3B82F6',
        borderWidth: 1,
    },
    rankWrapper: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    userInfo: {
        flex: 1,
        marginLeft: theme.spacing.s,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E5E7EB',
    },
    myUserName: {
        color: '#6EE7B7', // Nane yeşili
        fontWeight: 'bold',
    },
    xpWrapper: {
        alignItems: 'flex-end',
    },
    xpText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C084FC', // Lila
    },
    myXpText: {
        color: '#6EE7B7',
    },
    emptyContainer: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textSecondary,
    },
    fixedMyRank: {
        marginTop: theme.spacing.m,
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: '#3B82F6', // Canlı mavi sınır
        overflow: 'hidden',
    },
    fixedMyRankLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
    }
});
