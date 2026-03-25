import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';

interface TicketProps {
  passengerName: string;
  originName: string;
  destName: string;
  duration: number;
  xp: number;
  onConfirm: () => void;
  onRefund: () => void;
}

export const Ticket: React.FC<TicketProps> = ({ 
  passengerName, 
  originName, 
  destName, 
  duration, 
  xp, 
  onConfirm, 
  onRefund 
}) => {
  return (
    <BlurView intensity={50} tint="dark" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>BİNİŞ KARTI</Text>
      </View>
      
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Yolcu</Text>
          <Text style={styles.value}>{passengerName}</Text>
        </View>

        <View style={styles.routeContainer}>
          <Text style={styles.city}>{originName?.toUpperCase()}</Text>
          <Text style={styles.arrow}>➔</Text>
          <Text style={styles.city}>{destName?.toUpperCase()}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.label}>Süre</Text>
            <Text style={styles.value}>{duration} DK</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.label}>Ödül</Text>
            <Text style={styles.xpValue}>+{xp} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmText}>Bileti Kes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.refundBtn} onPress={onRefund} activeOpacity={0.8}>
          <Text style={styles.refundText}>İade Et</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface, // Bu rgba rengi BlurView'a extra karartma verir
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: theme.spacing.l,
    width: '100%',
    overflow: 'hidden', // BlurView'un köşelerinin yuvarlak olması için şart
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
    paddingBottom: theme.spacing.s,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  body: {
    paddingHorizontal: theme.spacing.s,
  },
  row: {
    marginBottom: theme.spacing.m,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.m,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
  },
  city: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.secondary,
    marginHorizontal: theme.spacing.m,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
  },
  detailBox: {
    flex: 1,
    alignItems: 'center',
  },
  xpValue: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary, // Canlı Mavi
    paddingVertical: 14,
    borderRadius: theme.borderRadius.round, // Pill-shaped
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  refundBtn: {
    backgroundColor: theme.colors.secondary, // Pastel Nane Yeşili
    paddingVertical: 14,
    borderRadius: theme.borderRadius.round, // Pill-shaped
    alignItems: 'center',
  },
  refundText: {
    color: '#0F172A', // Nane yeşili üzerinde okunabilmesi için koyu metin
    fontWeight: 'bold',
    fontSize: 16,
  },
});
