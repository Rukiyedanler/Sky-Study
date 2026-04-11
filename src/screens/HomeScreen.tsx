import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ImageBackground
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../theme';
import { useThemeContext } from '../context/ThemeContext';
import { CITIES, filterDestinations, calculateXP, City } from '../utils/flightLogic';
import { Ticket } from '../components/Ticket';
import { WheelSpinner } from '../components/WheelSpinner';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const { theme, isNightMode, toggleNightMode } = useThemeContext();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Time Parameter
  const [targetDuration, setTargetDuration] = useState<string>('');
  
  // Phase States (0: Input, 1: OriginSpin, 2: DestSpin, 3: Ticket)
  const [phase, setPhase] = useState<number>(0);

  // Flight Selections
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [availableDests, setAvailableDests] = useState<{city: City, duration: number}[]>([]);
  const [activeFlight, setActiveFlight] = useState<{ origin: City, dest: City, duration: number, xp: number } | null>(null);

  // Modals
  const [isRefundModalVisible, setRefundModalVisible] = useState(false);

  // Recent Flights
  const [recentFlights, setRecentFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchFlights = async () => {
        if (!user) return;
        setLoadingFlights(true);
        try {
          const q = query(
            collection(db, 'flights'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const flights: any[] = [];
          querySnapshot.forEach((doc) => {
            flights.push({ id: doc.id, ...doc.data() });
          });
          if (isActive) {
            setRecentFlights(flights);
          }
        } catch (error) {
          console.error("Uçuşlar çekilirken hata:", error);
        } finally {
          if (isActive) setLoadingFlights(false);
        }
      };

      fetchFlights();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const showTicket = () => {
    Keyboard.dismiss();
    const durationNum = parseInt(targetDuration) || 0;
    if (durationNum < 15) {
      Alert.alert('Geçersiz Süre', 'Hedef süre en az 15 dakika olmalıdır.');
      return;
    }
    if (!originCity || !activeFlight) {
      Alert.alert('Rotalar Eksik', 'Lütfen kalkış ve varış şehirlerinizi şans çarkı ile belirleyin.');
      return;
    }
    setPhase(3); // Show ticket
  };

  const handleOriginSelected = (selectedCity: City) => {
    const durationNum = parseInt(targetDuration) || 0;
    const dests = filterDestinations(selectedCity.id, durationNum);
    
    setTimeout(() => {
        // Her halükarda kullanıcının kazandığı kalkış şehrini ekrana yaz.
        setOriginCity(selectedCity);
        setAvailableDests(dests);
        setPhase(0); 
        
        // Eğer seçilen şehre uygun bir uçuş yoksa bilgi ver ama kalkış şehrini "SİLME"!
        if (dests.length === 0) {
            setTimeout(() => {
                Alert.alert(
                    'Uçuş Bulunamadı', 
                    `Kalkış noktanız ${selectedCity.name} olarak belirlendi, ancak ${durationNum} dakika (+30/-20 dk) civarında buraya bağlı bir rota yok.\n\nLütfen Varış Şehri çarkını çevirmeden önce süre alanını büyütüp küçülterek rotanızı araştırın.`
                );
            }, 600); // UI renderlandıktan sonra uyarı çıksın
        }
    }, 1500); // Let user see the wheel result for 1.5s
  };

  const handleDestinationSelected = (result: any) => {
    if (originCity && result) {
      setActiveFlight({
        origin: originCity,
        dest: result.city,
        duration: result.duration,
        xp: calculateXP(result.duration)
      });
      
      setTimeout(() => {
         setPhase(0); // Return to planning card
      }, 1500); // Let user see the wheel result for 1.5s
    }
  };

  const resetFlow = () => {
      setPhase(0);
      setOriginCity(null);
      setAvailableDests([]);
      setActiveFlight(null);
      setRefundModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
       console.log(error);
    }
  };

  return (
    <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
              
              <View style={styles.headerRow}>
                <Text style={styles.welcomeText}>Sky Study Kulesi</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={toggleNightMode} style={styles.themeToggleBtn} activeOpacity={0.7}>
                     <Text style={styles.themeToggleText}>{isNightMode ? '☀️' : '🌙'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                     <Text style={styles.logoutText}>Çıkış</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {phase === 0 && (
                <BlurView intensity={50} tint="dark" style={styles.planningCard}>
                  <Text style={styles.sectionTitle}>Uçuş Planı</Text>
                  <Text style={styles.hintText}>Süreyi belirle, rotaları şansa bırak!</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hedeflenen Odaklanma Süresi</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={targetDuration}
                      onChangeText={setTargetDuration}
                      placeholder="Süre (DK)"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kalkış Şehri</Text>
                    <TouchableOpacity style={styles.selectorBtn} onPress={() => {
                        const durationNum = parseInt(targetDuration) || 0;
                        if (durationNum < 15) {
                            Alert.alert('Geçersiz Süre', 'Çarkı çevirmeden önce en az 15 dakikalık bir odaklanma süresi belirlemelisiniz.');
                            return;
                        }
                        setPhase(1); // origin wheel
                    }}>
                       <Text style={originCity ? styles.selectorValue : styles.selectorPlaceholder}>
                         {originCity ? originCity.name : "Şans çarkını çevir..."}
                       </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Varış Şehri</Text>
                    <TouchableOpacity 
                       style={[styles.selectorBtn, !originCity && { opacity: 0.5 }]} 
                       onPress={() => {
                          if (!originCity) {
                              Alert.alert('Hata', 'Önce Kalkış Noktasını belirleyin.');
                              return;
                          }
                          // Güncel süreyi anlık olarak oku ve destinasyonları filtrele! 
                          // (Kullanıcı kalkış şehrinden sonra süreyi değiştirmiş olabilir)
                          const durationNum = parseInt(targetDuration) || 0;
                          const freshDests = filterDestinations(originCity.id, durationNum);
                          
                          if (freshDests.length === 0) {
                              Alert.alert('Hedef Bulunamadı', `${originCity.name} kalkışlı ${durationNum} dk süreli uçuş yok. Kutucuktaki süreyi uçuş bulana dek değiştirip tekrar tıklayın.`);
                              return;
                          }
                          setAvailableDests(freshDests);
                          setPhase(2);
                       }}
                    >
                       <Text style={activeFlight ? styles.selectorValue : styles.selectorPlaceholder}>
                         {activeFlight ? activeFlight.dest.name : "Rastgele seç..."}
                       </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.planBtn} 
                    onPress={showTicket}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.planBtnText}>Yolculuğu Planla</Text>
                  </TouchableOpacity>
                </BlurView>
              )}

              {/* Son Uçuşlarınız Bölümü */}
              {phase === 0 && (
                <View style={styles.recentFlightsSection}>
                  <Text style={styles.recentFlightsTitle}>Son Uçuşlarınız</Text>
                  
                  {loadingFlights ? (
                    <Text style={styles.emptyFlightsText}>Uçuşlar yükleniyor...</Text>
                  ) : recentFlights.length === 0 ? (
                    <BlurView intensity={30} tint="dark" style={styles.emptyFlightsCard}>
                      <Text style={styles.emptyFlightsText}>Henüz bir uçuş yapmadınız, hemen planla!</Text>
                    </BlurView>
                  ) : (
                    recentFlights.map((flight) => (
                      <BlurView intensity={40} tint="dark" style={styles.flightCard} key={flight.id}>
                        <View style={styles.flightCardHeader}>
                          <Text style={styles.flightRoute}>{flight.departure} -> {flight.arrival}</Text>
                          <Text style={styles.flightDate}>
                            {new Date(flight.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </Text>
                        </View>
                        <Text style={styles.flightDuration}>Süre: {flight.duration} Dk / +{flight.xp} XP</Text>
                      </BlurView>
                    ))
                  )}
                </View>
              )}

              {phase === 3 && activeFlight && (
                <View style={styles.ticketWrapper}>
                    <Ticket
                      passengerName={user?.email?.split('@')[0] || 'Pilot'}
                      originName={activeFlight.origin.name}
                      destName={activeFlight.dest.name}
                      duration={activeFlight.duration}
                      xp={activeFlight.xp}
                      onConfirm={() => {
                          navigation.navigate('ActiveFlight', {
                              route: `${activeFlight.origin.name} - ${activeFlight.dest.name}`,
                              duration: activeFlight.duration
                          });
                      }}
                      onRefund={() => setRefundModalVisible(true)}
                    />
                </View>
              )}

              {/* FULL SCREEN ORIGIN WHEEL MODAL */}
              <Modal
                visible={phase === 1}
                animationType="slide"
                transparent={false}
                onRequestClose={resetFlow}
              >
                 <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
                   <WheelSpinner 
                      title="Kalkış Noktası"
                      subtitle="Yolculuk Nereden Başlayacak?"
                      pool={CITIES}
                      onCancel={resetFlow}
                      onSelected={handleOriginSelected}
                   />
                 </ImageBackground>
              </Modal>

              {/* FULL SCREEN DESTINATION WHEEL MODAL */}
              <Modal
                visible={phase === 2}
                animationType="slide"
                transparent={false}
                onRequestClose={resetFlow}
              >
                 <ImageBackground source={{ uri: theme.images.background }} style={styles.backgroundImage} resizeMode="cover">
                   <WheelSpinner 
                      title="Varış Noktası"
                      subtitle={`${originCity?.name} kalkışlı ${parseInt(targetDuration)} dk uçuş aranıyor...`}
                      pool={availableDests.map(d => d.city)} // Çarkın arayüzü yalnızca "City" nesnesini bekler
                      onCancel={resetFlow}
                      onSelected={(selectedCity: City) => {
                          // Seçilen salt şehri, listedeki süresiyle tekrar eşleştirip gönderiyoruz
                          const matchedDest = availableDests.find(d => d.city.id === selectedCity.id);
                          handleDestinationSelected(matchedDest);
                      }}
                   />
                 </ImageBackground>
              </Modal>

              {/* Refund Ticket Modal */}
              <Modal
                visible={isRefundModalVisible}
                transparent
                animationType="fade"
                onRequestClose={resetFlow}
              >
                <View style={styles.modalOverlay}>
                  <BlurView intensity={50} tint="dark" style={styles.modalContent}>
                    <Text style={styles.modalText}>
                      Uçuş süresini değiştirmek için bileti iptal etmek istiyor musunuz?
                    </Text>
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: theme.colors.secondary }]} 
                        onPress={resetFlow}
                      >
                        <Text style={[styles.modalBtnText, { color: '#0F172A' }]}>Evet, İade Et</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]} 
                        onPress={() => setRefundModalVisible(false)}
                      >
                        <Text style={styles.modalBtnText}>Hayır, Devam</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </View>
              </Modal>

            </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: 'transparent',
  },
  flex1: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.xl, // Daha fazla kenar boşluğu
    alignItems: 'center',
    width: '100%',
    maxWidth: 700, // Büyük ekranlarda/Web'de gereksiz uzamayı engelleyip ortalar
    alignSelf: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  themeToggleBtn: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeToggleText: {
    fontSize: 18,
  },
  logoutBtn: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  planningCard: {
    width: '100%',
    backgroundColor: theme.colors.surface, // BlurView tint
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.s,
    overflow: 'hidden', // Forces BlurView to respect border radius
  },
  sectionTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  hintText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: theme.spacing.l,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    height: 56,
    paddingHorizontal: theme.spacing.m,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  selectorBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m, 
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.m,
  },
  selectorPlaceholder: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 16,
  },
  selectorValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  planBtn: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: theme.borderRadius.round, // Pill shaped like in the image
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  planBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  ticketWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Deep dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: theme.spacing.m,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recentFlightsSection: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  recentFlightsTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  emptyFlightsCard: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  emptyFlightsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  flightCard: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  flightRoute: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  flightDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  flightDuration: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
});
