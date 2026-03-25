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
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';
import { CITIES, filterDestinations, calculateXP, City } from '../utils/flightLogic';
import { Ticket } from '../components/Ticket';
import { WheelSpinner } from '../components/WheelSpinner';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);

  // Time Parameter
  const [targetDuration, setTargetDuration] = useState<string>('60');
  
  // Phase States (0: Input, 1: OriginSpin, 2: DestSpin, 3: Ticket)
  const [phase, setPhase] = useState<number>(0);

  // Flight Selections
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [availableDests, setAvailableDests] = useState<{city: City, duration: number}[]>([]);
  const [activeFlight, setActiveFlight] = useState<{ origin: City, dest: City, duration: number, xp: number } | null>(null);

  // Modals
  const [isRefundModalVisible, setRefundModalVisible] = useState(false);

  const startPlanning = () => {
    Keyboard.dismiss();
    const durationNum = parseInt(targetDuration) || 0;
    if (durationNum < 15) {
      Alert.alert('Geçersiz Süre', 'Hedef süre en az 15 dakika olmalıdır.');
      return;
    }
    setPhase(1); // Move to Origin Selection Phase
  };

  const handleOriginSelected = (selectedCity: City) => {
    setOriginCity(selectedCity);
    const durationNum = parseInt(targetDuration) || 0;
    
    // Calculate possible destinations from this random origin
    const dests = filterDestinations(selectedCity.id, durationNum);
    
    // Slight delay to let wheel animation finish
    setTimeout(() => {
        if (dests.length === 0) {
            Alert.alert('Uyarı', `Seçilen ${selectedCity.name} noktasından ${durationNum} dakikalık uçuş bulamadık. Yeni bir kalkış noktası için çarkı tekrar çevir.`);
            // Remain in phase 1 so they can spin again
        } else {
            setAvailableDests(dests);
            setPhase(2); // Move to Destination Phase
        }
    }, 500);
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
         setPhase(3); // Move to Ticket Phase
      }, 500);
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
              
              <View style={styles.headerRow}>
                <Text style={styles.welcomeText}>Sky Study Kulesi</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                   <Text style={styles.logoutText}>Çıkış</Text>
                </TouchableOpacity>
              </View>

              {phase === 0 && (
                <View style={styles.planningCard}>
                  <Text style={styles.sectionTitle}>Uçuş Süresi</Text>
                  <Text style={styles.hintText}>Önce ne kadar süre odaklanmak istediğinizi belirleyin. Geri kalanı kaderinize kalmış!</Text>

                  <View style={styles.inputGroup}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={targetDuration}
                      onChangeText={setTargetDuration}
                      placeholder="Süre girin (Örn: 45)"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.planBtn} 
                    onPress={startPlanning}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.planBtnText}>Şans Çarklarını Başlat</Text>
                  </TouchableOpacity>
                </View>
              )}

              {phase === 3 && activeFlight && (
                <View style={styles.ticketWrapper}>
                    <Ticket
                      passengerName={user?.email?.split('@')[0] || 'Pilot'}
                      originName={activeFlight.origin.name}
                      originCode={activeFlight.origin.code}
                      destName={activeFlight.dest.name}
                      destCode={activeFlight.dest.code}
                      duration={activeFlight.duration}
                      xp={activeFlight.xp}
                      onConfirm={() => {
                          Alert.alert('Başarılı', 'Bilet Kesildi! İyi Uçuşlar.'); 
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
                      subtitle={`${originCity?.name} kalkışlı ${parseInt(targetDuration)} dk menzilli uçuş aranıyor...`}
                      pool={availableDests} // Important trick to make the type system happy without rewriting logic
                      onCancel={resetFlow}
                      onSelected={(item: any) => handleDestinationSelected(item)}
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
                  <View style={styles.modalContent}>
                    <Text style={styles.modalText}>
                      Uçuş rotasını değiştirmek için bileti iptal etmek istiyor musunuz?
                    </Text>
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: theme.colors.accent }]} 
                        onPress={resetFlow}
                      >
                        <Text style={[styles.modalBtnText, { color: theme.colors.text }]}>Evet, İade Et</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: theme.colors.secondary }]} 
                        onPress={() => setRefundModalVisible(false)}
                      >
                        <Text style={styles.modalBtnText}>Hayır, Devam</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

            </ScrollView>
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
    backgroundColor: theme.colors.surface, // This is now rgba(30, 41, 59, 0.7)
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xl,
    alignItems: 'center'
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
    marginBottom: theme.spacing.xl,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    height: 80,
    paddingHorizontal: theme.spacing.l,
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
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
});
