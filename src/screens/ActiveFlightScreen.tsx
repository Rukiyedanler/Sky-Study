import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av';

type Props = NativeStackScreenProps<MainStackParamList, 'ActiveFlight'>;

const isWeb = Platform.OS === 'web';

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function ActiveFlightScreen({ route, navigation }: Props) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useContext(AuthContext);
  const hasSavedRef = useRef(false);

  const { route: flightRoute, duration } = route.params;

  const totalSeconds = duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  // Müzik state ve referansı
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);

  // İlerleme yüzdesi hesaplama
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    // 0 olduğunda dur
    if (timeLeft <= 0) {
      if (hasSavedRef.current) return;
      hasSavedRef.current = true;

      console.log('Uçuş Bitti!');
      setIsPlaying(false);

      const saveFlightAndNavigate = async () => {
        if (user) {
          try {
            const [departure, arrival] = flightRoute.split('->').map(s => s.trim());
            const xpEarned = duration * 10;
            
            await addDoc(collection(db, 'flights'), {
              userId: user.uid,
              userEmail: user.email || 'Anonim',
              departure: departure || 'Bilinmiyor',
              arrival: arrival || 'Bilinmiyor',
              duration: duration,
              xp: xpEarned,
              date: new Date().toISOString()
            });
            console.log('Uçuş başarıyla Firebase e kaydedildi.');
          } catch (error) {
            console.error('Uçuş kaydedilirken hata:', error);
          }
        }
        navigation.replace('LandingSuccess', { route: flightRoute, duration });
      };

      saveFlightAndNavigate();
      return;
    }

    // Modal açıksa sayacı duraklat
    if (isModalVisible) {
      return;
    }

    // Her saniye azalt
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Unmount olduğunda veya yeniden render edildiğinde temizle
    return () => clearInterval(intervalId);
  }, [timeLeft, isModalVisible, flightRoute, duration, user, navigation]);

  // Ses yükleme efekti
  useEffect(() => {
    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Rahatlatıcı / Lo-fi Royalty Free Müzik
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
          { shouldPlay: true, isLooping: true, volume: 0.4 }
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (error) {
        console.log('Müzik yüklenemedi', error);
      }
    }
    loadAudio();

    // Cleanup: Bileşen unmount olunca sesi belleğinden sil.
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const togglePlayback = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleEmergencyClick = () => {
    setIsModalVisible(true);
    // Müzik iframe'ini duraklatamıyoruz ancak sayacı durdurduk.
  };

  const handleCancelEmergency = () => {
    setIsModalVisible(false);
  };

  const handleConfirmEmergency = async () => {
    setIsModalVisible(false);
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
    navigation.navigate('MainTabs'); 
  };

  return (
    <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>

        <BlurView intensity={60} tint="dark" style={styles.panel}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Aktif Uçuş</Text>
            <TouchableOpacity onPress={togglePlayback} style={styles.muteButton}>
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={36} color="#93C5FD" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.routeText}>{flightRoute}</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>

          {/* İlerleme Çubuğu */}
          <View style={styles.progressWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <View style={[styles.airplaneIconContainer, { left: `${progressPercentage}%` }]}>
              <Text style={styles.airplaneIcon}>✈️</Text>
            </View>
          </View>
        </BlurView>

        {/* Acil İniş Butonu */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyClick}>
          <Text style={styles.emergencyButtonText}>Acil İniş (Uçuşu İptal Et)</Text>
        </TouchableOpacity>

        {/* Acil İniş Modalı */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} tint="dark" style={styles.modalContent}>
              <Text style={styles.modalText}>Odaklanmayı bozup uçuşu iptal ediyorsunuz. Emin misiniz?</Text>
              
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancelEmergency}>
                  <Text style={styles.cancelButtonText}>Hayır, Devam Et</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirmEmergency}>
                  <Text style={styles.confirmButtonText}>Evet, İptal Et</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>

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
    position: 'relative',
  },
  panel: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: theme.spacing.l,
  },
  title: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  muteButton: {
    position: 'absolute',
    right: 0,
    padding: theme.spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.round,
  },
  routeText: {
    ...theme.typography.h2,
    color: '#D1D5DB', // soft grey to look like subtitle
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  timerContainer: {
    marginVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'], // engellerin oynamaması için
  },
  progressWrapper: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    marginVertical: theme.spacing.m,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent, // Pastel Lila
    borderRadius: theme.borderRadius.round,
  },
  airplaneIconContainer: {
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -15 }], // Center the icon over the progress point
    width: 30,
    alignItems: 'center',
  },
  airplaneIcon: {
    fontSize: 24,
  },
  emergencyButton: {
    marginTop: theme.spacing.xxl,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#FCA5A5', 
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emergencyButtonText: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '40%', // İyice daraltıldı
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l, // İç boşluğu da genişlikle orantılı ufalttık
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.s,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 4, // Ekstra küçük padding
    paddingHorizontal: 4,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6EE7B7', 
  },
  cancelButtonText: {
    color: '#064E3B', // Koyu yeşil metin
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#F4A261', // Pastel Turuncu
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
