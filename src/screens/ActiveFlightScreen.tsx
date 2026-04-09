import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'ActiveFlight'>;

// Web için iframe
const WebIframe = 'iframe' as any;
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

  const { route: flightRoute, duration } = route.params;

  const totalSeconds = duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  // Müzik state'leri (Sadece Web için kullanılacak)
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);

  // İlerleme yüzdesi hesaplama
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    // 0 olduğunda dur
    if (timeLeft <= 0) {
      console.log('Uçuş Bitti!');
      setIsPlaying(false);
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
  }, [timeLeft, isModalVisible]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleEmergencyClick = () => {
    setIsModalVisible(true);
    // Müzik iframe'ini duraklatamıyoruz ancak sayacı durdurduk.
  };

  const handleCancelEmergency = () => {
    setIsModalVisible(false);
  };

  const handleConfirmEmergency = () => {
    setIsModalVisible(false);
    setIsPlaying(false); // İframe kapanır
    navigation.navigate('Home'); // Ana Ekrana (Home) geri dön
  };

  return (
    <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
        
        {/* Gizli Youtube Oynatıcı - Yalnızca Web */}
        {isWeb && isPlaying && (
          <View style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} pointerEvents="none">
            <WebIframe
              src={`https://www.youtube.com/embed/videoseries?list=PLMAyoLwiBNFQzGjg4qyLauq98A7YOCU1I&autoplay=1&mute=${isMuted ? 1 : 0}`}
              style={{ width: 0, height: 0, border: 0 }}
              allow="autoplay"
            />
          </View>
        )}

        <BlurView intensity={60} tint="dark" style={styles.panel}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Aktif Uçuş</Text>
            {isWeb && (
              <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={24} color={theme.colors.accent} />
              </TouchableOpacity>
            )}
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
                  <Text style={styles.modalButtonText}>Hayır, Devam Et</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirmEmergency}>
                  <Text style={styles.modalButtonText}>Evet, Acil İniş Yap</Text>
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
    backgroundColor: theme.colors.primary, 
  },
  confirmButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444', 
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
