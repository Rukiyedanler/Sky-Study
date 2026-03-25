import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.card}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.m,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginVertical: theme.spacing.l,
    width: '100%',
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
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  confirmText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  refundBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  refundText: {
    color: theme.colors.text, // Koyu lacivert text Nane üzerinde daha iyi durur
    fontWeight: 'bold',
    fontSize: 16,
  },
});
