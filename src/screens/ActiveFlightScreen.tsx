import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ActiveFlight'>;

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function ActiveFlightScreen({ route }: Props) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { route: flightRoute, duration } = route.params;

  // Toplam saniyeyi State olarak tut
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    // 0 olduğunda dur
    if (timeLeft <= 0) {
      console.log('Uçuş Bitti!');
      return;
    }

    // Her saniye azalt
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Unmount olduğunda veya yeniden render edildiğinde temizle
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return (
    <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
        <BlurView intensity={60} tint="dark" style={styles.panel}>
          <Text style={styles.title}>Aktif Uçuş</Text>
          <Text style={styles.routeText}>{flightRoute}</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
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
    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
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
});
