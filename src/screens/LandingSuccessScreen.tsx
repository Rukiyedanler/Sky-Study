import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';
import { Video, ResizeMode } from 'expo-av';
import { fetchCityVideo } from '../services/pexelsService';
import { getRandomCityFact } from '../data/cityFacts';

type Props = NativeStackScreenProps<MainStackParamList, 'LandingSuccess'>;

export default function LandingSuccessScreen({ route, navigation }: Props) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { route: flightRoute, duration } = route.params;
  const targetCity = flightRoute.split('->').pop()?.trim() || "Hedef Nokta";

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const cityFact = useMemo(() => getRandomCityFact(targetCity), [targetCity]);

  useEffect(() => {
    let isMounted = true;
    
    const loadVideo = async () => {
      setIsLoading(true);
      const url = await fetchCityVideo(targetCity);
      if (isMounted) {
        setVideoUrl(url);
        setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
    };
  }, [targetCity]);

  const isWeb = Platform.OS === 'web';

  const handleReturnHome = () => {
    // Tüm uçuş ve başarı sayfalarını bellekten silip ana ekrana sıfırlar
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainDrawer' }],
    });
  };

  const renderContentPanel = () => (
    <>
      <BlurView intensity={70} tint="dark" style={styles.panel}>
      <Text style={styles.successTitle}>İNİŞ BAŞARILI!</Text>
      <View style={styles.flightInfoContainer}>
        <Text style={styles.routeText}>{flightRoute}</Text>
        <Text style={styles.durationText}>{duration} Dakika Odaklanma Tamamlandı</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.insightsContainer}>
         <Text style={styles.insightsHeader}>{targetCity} hakkında bir bilgi:</Text>
         <Text style={styles.insightsText}>{cityFact}</Text>
      </View>
    </BlurView>
    <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome} activeOpacity={0.7}>
       <Text style={styles.homeButtonText}>Yeni Bir Yolculuk Planla</Text>
    </TouchableOpacity>
  </>);

  const renderVideo = () => {
    if (videoUrl && !isLoading) {
      return (
        <Video
          source={
            Platform.OS === 'web' 
              ? { uri: videoUrl }
              : { 
                  uri: videoUrl,
                  headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://www.pexels.com/"
                  }
                }
          }
          style={styles.videoElement}
          isMuted={true}
          shouldPlay={true}
          isLooping={true}
          resizeMode={ResizeMode.COVER}
          onError={(error) => {
            console.warn("Video yüklenemedi (CORS veya bağlantı hatası):", error);
            setVideoUrl(null);
          }}
        />
      );
    }
    return (
      <ImageBackground source={{ uri: theme.images.background }} style={styles.videoElement} resizeMode="cover" />
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Arka plan konfetileri (Sabit kalması için ScrollView dışında) */}
      {!isLoading && (
        <LottieView
            source={require('../../assets/animations/confetti.json')}
            autoPlay={true}
            loop={false}
            style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}
            pointerEvents="none"
        />
      )}

      <ScrollView 
        style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Üst Kısım: Video */}
        <View style={styles.topSection}>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Gökyüzü manzarası yükleniyor...</Text>
            </View>
          ) : (
            renderVideo()
          )}
        </View>

        {/* Alt Kısım: Panel (Sayfayı aşağı kaydırınca görünür) */}
        <View style={styles.bottomSection}>
           {!isLoading && renderContentPanel()}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A', // Tüm platformlarda şık koyu lacivert arka plan
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  topSection: {
    width: '100%',
    maxWidth: 600,
    height: 450, // Videonun yüksekliği (Mobilde ekranın yarısı kadar yer kaplar)
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  videoElement: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    width: '100%',
    maxWidth: 600,
    zIndex: 2,
    paddingBottom: theme.spacing.xl,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    marginTop: theme.spacing.m,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    elevation: 6, // Mobilde tıklanabilirliği artırmak için gölge
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: theme.spacing.xl, // BlurView dışında olduğu için üstten boşluk
    zIndex: 100, // En üstte olması için
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
