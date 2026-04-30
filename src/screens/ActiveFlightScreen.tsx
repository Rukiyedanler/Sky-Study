import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { Audio } from 'expo-av';
import { CITIES } from '../data/cities';
import MapComponent from '../components/MapComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

type Props = NativeStackScreenProps<MainStackParamList, 'ActiveFlight'>;

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const calculateHeading = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
};

export default function ActiveFlightScreen({ route, navigation }: Props) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useContext(AuthContext);
  const hasSavedRef = useRef(false);

  const { route: flightRoute, duration, originId, destId } = route.params;

  const origin = useMemo(() => CITIES.find(c => c.id === originId), [originId]);
  const dest = useMemo(() => CITIES.find(c => c.id === destId), [destId]);

  const totalSeconds = duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);

  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const progressFraction = progressPercentage / 100;

  const currentLat = origin && dest ? origin.lat + (dest.lat - origin.lat) * progressFraction : 0;
  const currentLon = origin && dest ? origin.lon + (dest.lon - origin.lon) * progressFraction : 0;
  const airplaneHeading = origin && dest ? calculateHeading(origin.lat, origin.lon, dest.lat, dest.lon) - 45 : 0;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (hasSavedRef.current) return;
      hasSavedRef.current = true;
      setIsPlaying(false);

      const saveFlightAndNavigate = async () => {
        // Hedefe ulaşıldığında bildirimi tetikle
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "✈️ İniş Başarılı!",
            body: "Hedefine ulaştın, tebrikler!",
            sound: true,
          },
          trigger: null,
        });

        if (user) {
          try {
            const [departure, arrival] = flightRoute.split('-').map(s => s.trim());
            const xpEarned = duration * 10;
            
            await addDoc(collection(db, 'flights'), {
              userId: user.uid,
              userEmail: user.email || 'Anonim',
              departure: departure || 'Bilinmiyor',
              arrival: arrival || 'Bilinmiyor',
              duration: duration,
              xp: xpEarned,
              status: 'completed',
              date: new Date().toISOString()
            });
          } catch (error) {
            console.error('Uçuş kaydedilirken hata:', error);
          }
        }
        navigation.replace('LandingSuccess', { route: flightRoute, duration });
      };

      saveFlightAndNavigate();
      return;
    }

    if (isModalVisible) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, isModalVisible, flightRoute, duration, user, navigation]);

  useEffect(() => {
    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
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
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
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

  const handleEmergencyClick = async () => {
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem('@cancel_limit');
      let cancelData = storedData ? JSON.parse(storedData) : { date: today, count: 0 };
      
      if (cancelData.date !== today) {
        cancelData = { date: today, count: 0 };
      }

      if (cancelData.count >= 2) {
        Alert.alert('İptal Limiti Doldu', 'Günde en fazla 2 kez uçuş iptal edebilirsiniz. Bu uçuşu tamamlamanız gerekiyor!');
        return;
      }
      
      setIsModalVisible(true);
    } catch (error) {
      console.error('Limit kontrol hatası', error);
      setIsModalVisible(true);
    }
  };
  const handleCancelEmergency = () => setIsModalVisible(false);

  const handleConfirmEmergency = async () => {
    setIsModalVisible(false);
    if (soundRef.current) await soundRef.current.stopAsync();
    
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem('@cancel_limit');
      let cancelData = storedData ? JSON.parse(storedData) : { date: today, count: 0 };
      if (cancelData.date !== today) cancelData = { date: today, count: 0 };
      cancelData.count += 1;
      await AsyncStorage.setItem('@cancel_limit', JSON.stringify(cancelData));
    } catch (e) {
      console.error('İptal sayısı kaydedilemedi', e);
    }
    
    if (user) {
      try {
        const [departure, arrival] = flightRoute.split('-').map(s => s.trim());
        await addDoc(collection(db, 'flights'), {
          userId: user.uid,
          userEmail: user.email || 'Anonim',
          departure: departure || 'Bilinmiyor',
          arrival: arrival || 'Bilinmiyor',
          duration: duration,
          xp: 0,
          status: 'failed',
          date: new Date().toISOString()
        });
      } catch (error) {
        console.error('İptal edilen uçuş kaydedilirken hata:', error);
      }
    }
    navigation.navigate('MainDrawer'); 
  };

  return (
    <View style={styles.mainContainer}>
      {origin && dest && (
        <MapComponent
          origin={origin}
          dest={dest}
          currentLat={currentLat}
          currentLon={currentLon}
          airplaneHeading={airplaneHeading}
          onAirplanePress={() => setIsInfoPanelVisible(true)}
        />
      )}

      {/* Floating Info Panel */}
      {isInfoPanelVisible && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <BlurView intensity={80} tint="dark" style={styles.panel}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Aktif Uçuş</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={togglePlayback} style={styles.iconButton}>
                  <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={36} color="#93C5FD" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsInfoPanelVisible(false)} style={styles.iconButton}>
                  <Ionicons name="close-circle" size={36} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.routeText}>{flightRoute}</Text>
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            <View style={styles.progressWrapper}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>
            
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyClick}>
              <Text style={styles.emergencyButtonText}>Acil İniş (Uçuşu İptal Et)</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Emergency Landing Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
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
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(31, 41, 55, 0.85)', 
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  headerActions: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  iconButton: {
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.round,
  },
  routeText: {
    ...theme.typography.h2,
    color: '#D1D5DB', 
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  timerContainer: {
    marginVertical: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'], 
  },
  progressWrapper: {
    width: '100%',
    height: 10,
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
    backgroundColor: theme.colors.accent, 
    borderRadius: theme.borderRadius.round,
  },
  emergencyButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#FCA5A5', 
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    width: '100%',
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 28,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.m,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12, 
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6EE7B7', 
  },
  cancelButtonText: {
    color: '#064E3B', 
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#F4A261', 
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
