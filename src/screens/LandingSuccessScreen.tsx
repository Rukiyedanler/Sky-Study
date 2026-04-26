import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'LandingSuccess'>;

export default function LandingSuccessScreen({ route, navigation }: Props) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { route: flightRoute, duration } = route.params;
  const targetCity = flightRoute.split('->').pop()?.trim() || "Hedef Nokta";

  const handleReturnHome = () => {
    navigation.popToTop(); // Ana Ekrana dönüş
  };

  return (
    <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
        <BlurView intensity={70} tint="dark" style={styles.panel}>
          
          <Text style={styles.successTitle}>İNİŞ BAŞARILI!</Text>
          
          <View style={styles.flightInfoContainer}>
            <Text style={styles.routeText}>{flightRoute}</Text>
            <Text style={styles.durationText}>{duration} Dakika Odaklanma Tamamlandı</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.insightsContainer}>
             <Text style={styles.insightsHeader}>{targetCity} hakkında bir bilgi:</Text>
             <Text style={styles.insightsText}>
               (Buraya yapay zeka tarafından sağlanan ilginç bir kültürel bilgi veya motivasyon cümlesi gelecek.)
             </Text>
          </View>

          <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
             <Text style={styles.homeButtonText}>Yeni Bir Yolculuk Planla</Text>
          </TouchableOpacity>

        </BlurView>
      </View>
    </ImageBackground>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  panel: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.85)', 
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  successTitle: {
    ...theme.typography.h1,
    color: '#34D399', // Başarı hissi için yeşilimtrak
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    textShadowColor: 'rgba(52, 211, 153, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  flightInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  routeText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  durationText: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.l,
  },
  insightsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  insightsHeader: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  insightsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  homeButton: {
    width: '100%',
    paddingVertical: theme.spacing.m,
    backgroundColor: '#3B82F6', 
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
