import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { saveFlightRecord, getUserRecentFlights, FlightRecord } from '../services/FlightHistoryService';
import { analyzeFlightHistory, AiAnalysisResult } from '../services/AiAnalysisService';

type Props = NativeStackScreenProps<MainStackParamList, 'EmergencySummary'>;

const SURVEY_OPTIONS = [
  "Sosyal Medya",
  "Sıkıldım",
  "Odaklanamadım",
  "Uykum Geldi / Yorgunum",
  "Konu çok zordu / Tıkandım",
  "Beklenmedik acil bir iş çıktı"
];

export default function EmergencySummaryScreen({ route, navigation }: Props) {
  const { theme } = useThemeContext();
  const { user } = useContext(AuthContext);

  const { originId, destId, route: flightRoute, plannedDuration, actualDuration } = route.params;

  const [phase, setPhase] = useState<'survey' | 'analyzing' | 'result'>('survey');
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);

  const handleSurveySelect = async (reason: string) => {
    if (!user) return;
    
    setPhase('analyzing');

    try {
      // 1. İptal edilen uçuşu kaydet
      const originName = flightRoute.split('-')[0].trim();
      const record: FlightRecord = {
        userId: user.uid,
        city: originName,
        plannedDurationMinutes: plannedDuration,
        actualDurationMinutes: actualDuration,
        status: 'aborted',
        abortReason: reason,
        timestamp: new Date()
      };
      await saveFlightRecord(record);

      // 2. Geçmiş uçuşları getir
      const recentFlights = await getUserRecentFlights(user.uid, 10);

      // 3. Yapay zekaya gönder
      const analysis = await analyzeFlightHistory(recentFlights);
      setAiResult(analysis);
    } catch (error) {
      console.error("AI Analiz Sürecinde Hata:", error);
      // Fallback
      setAiResult({
        tespit: "Kara Kutu verileri analiz edilemedi, ancak uçuşlarımıza devam edebiliriz.",
        oneri_sure_dk: 25,
        motivasyon_metni: "Türbülansa takıldık ama pes etmek yok! Bir sonraki uçuşa hazırlanın."
      });
    } finally {
      setPhase('result');
    }
  };

  const startRescueFlight = () => {
    const recommendedDuration = aiResult?.oneri_sure_dk || 25;
    
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainDrawer',
          params: {
            screen: 'HomeDrawer',
            params: { recommendedDuration }
          }
        }
      ]
    });
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center' }]}>
      <View style={styles.contentContainer}>
        
        {phase === 'survey' && (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={48} color="#EF4444" />
            </View>
            <Text style={styles.title}>Acil İniş Yapıldı!</Text>
            <Text style={styles.subtitle}>
              Kuleye rapor vermek zorundayız. Uçuşu neden iptal ettin?
            </Text>
            
            <View style={styles.optionsGrid}>
              {SURVEY_OPTIONS.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionButton}
                  onPress={() => handleSurveySelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {phase === 'analyzing' && (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Kara Kutu İnceleniyor...</Text>
            <Text style={styles.subtitle}>Yapay zeka uçuş verilerini analiz ediyor.</Text>
          </View>
        )}

        {phase === 'result' && aiResult && (
          <View style={styles.resultCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="analytics" size={48} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Kule Raporu</Text>
            
            <View style={styles.aiBox}>
              <Text style={styles.aiLabel}>Tespit:</Text>
              <Text style={styles.aiText}>{aiResult.tespit}</Text>
            </View>
            
            <View style={[styles.aiBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={[styles.aiLabel, { color: '#10B981' }]}>Kule Mesajı:</Text>
              <Text style={styles.aiText}>{aiResult.motivasyon_metni}</Text>
            </View>

            <TouchableOpacity 
              style={styles.rescueButton} 
              onPress={startRescueFlight}
            >
              <Ionicons name="airplane" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.rescueButtonText}>
                Önerilen {aiResult.oneri_sure_dk} Dakikalık Kurtarma Uçuşuna Başla
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  optionText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  aiBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aiLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiText: {
    color: '#F8FAFC',
    fontSize: 16,
    lineHeight: 24,
  },
  rescueButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  rescueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
