import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { Theme } from '../theme';
import { useThemeContext } from '../context/ThemeContext';
import { City } from '../utils/flightLogic';

interface WheelSpinnerProps {
  title: string;
  subtitle: string;
  pool: City[]; 
  onSelected: (item: City) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.32; 
const RADIUS = WHEEL_SIZE / 2;

const SLICE_COLORS = [
  'rgba(251, 146, 60, 0.50)', // Soft Orange
  'rgba(59, 130, 246, 0.45)', // Blue
  'rgba(167, 139, 250, 0.50)', // Purple
  'rgba(14, 165, 233, 0.55)', // Cyan
  'rgba(52, 211, 153, 0.45)', // Emerald/Mint
  'rgba(99, 102, 241, 0.45)', // Indigo
];

const createPieSlice = (index: number, total: number, radius: number) => {
  const anglePerSlice = 360 / total;
  const startAngle = index * anglePerSlice;
  const endAngle = (index + 1) * anglePerSlice;

  const startX = radius + radius * Math.cos((Math.PI * startAngle) / 180);
  const startY = radius + radius * Math.sin((Math.PI * startAngle) / 180);
  const endX = radius + radius * Math.cos((Math.PI * endAngle) / 180);
  const endY = radius + radius * Math.sin((Math.PI * endAngle) / 180);

  const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

  return `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

export const WheelSpinner: React.FC<WheelSpinnerProps> = ({ title, subtitle, pool, onSelected, onCancel }) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinValue] = useState(new Animated.Value(0));

  let displayPool = pool;
  
  if (pool.length === 1) {
     displayPool = [pool[0], pool[0], pool[0], pool[0]];
  } else if (pool.length === 2 && pool.length < 4) {
     displayPool = [pool[0], pool[1], pool[0], pool[1]];
  } else if (pool.length === 3) {
     displayPool = [pool[0], pool[1], pool[2], pool[0], pool[1], pool[2]];
  }

  const spin = () => {
    if (pool.length === 0) return;
    
    setIsSpinning(true);
    spinValue.setValue(0);

    const randomIndex = Math.floor(Math.random() * displayPool.length);
    const chosen = displayPool[randomIndex];

    const anglePerSlice = 360 / displayPool.length;
    const centerOffset = randomIndex * anglePerSlice + (anglePerSlice / 2);
    const targetDegree = 1800 + (360 - centerOffset);

    Animated.timing(spinValue, {
      toValue: targetDegree,
      duration: 4000, 
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      onSelected(chosen);
    });
  };

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 3600], 
    outputRange: ['0deg', '3600deg'], 
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <View style={styles.wheelContainer}>
        <View style={styles.pointer} />

        <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate: spinAnimation }] }]}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <G rotation="-90" origin={`${RADIUS}, ${RADIUS}`}>
              {displayPool.map((city, index) => {
                const anglePerSlice = 360 / displayPool.length;
                const rotateText = index * anglePerSlice + anglePerSlice / 2;
                
                return (
                  <G key={index}>
                    <Path
                      d={createPieSlice(index, displayPool.length, RADIUS)}
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                      stroke="rgba(255, 255, 255, 0.7)" 
                      strokeWidth={2.5}
                    />
                    {displayPool.length <= 12 && (
                       <SvgText
                        fill="#FFFFFF"
                        fontSize="14"
                        fontWeight="bold"
                        x={RADIUS + RADIUS * 0.6 * Math.cos((Math.PI * rotateText) / 180)}
                        y={RADIUS + RADIUS * 0.6 * Math.sin((Math.PI * rotateText) / 180)}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${rotateText}, ${RADIUS + RADIUS * 0.6 * Math.cos((Math.PI * rotateText) / 180)}, ${RADIUS + RADIUS * 0.6 * Math.sin((Math.PI * rotateText) / 180)})`}
                      >
                        {city.code}
                      </SvgText>
                    )}
                  </G>
                );
              })}
            </G>
          </Svg>
          
          <View style={styles.wheelInner}>
              <Text style={styles.wheelInnerIcon}>✈️</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.spinBtn, isSpinning && styles.spinBtnDisabled]} 
          onPress={spin}
          disabled={isSpinning || pool.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.spinBtnText}>
            {isSpinning ? 'Aranıyor...' : 'Çarkı Çevir'}
          </Text>
        </TouchableOpacity>

        {!isSpinning && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>İptal Et</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text, 
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: WHEEL_SIZE / 2, 
    shadowColor: '#FFF', 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, 
    shadowRadius: 30, 
    elevation: 20, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)', 
  },
  pointer: {
    position: 'absolute',
    top: -30,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.primary, 
    zIndex: 20,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)', 
  },
  wheelInner: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.25,
    height: WHEEL_SIZE * 0.25,
    borderRadius: (WHEEL_SIZE * 0.25) / 2,
    backgroundColor: theme.colors.background, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)', 
  },
  wheelInnerIcon: {
    fontSize: 24,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  spinBtn: {
    backgroundColor: theme.colors.primary, 
    width: '100%',
    paddingVertical: 18,
    borderRadius: theme.borderRadius.round, 
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  spinBtnDisabled: {
    opacity: 0.5,
  },
  spinBtnText: {
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    paddingVertical: theme.spacing.m,
  },
  cancelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  }
});
