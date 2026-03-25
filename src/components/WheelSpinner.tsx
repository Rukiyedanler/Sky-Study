import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme';
import { City } from '../utils/flightLogic';

interface WheelSpinnerProps {
  title: string;
  subtitle: string;
  pool: City[]; 
  onSelected: (item: City) => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');
// %20 küçültme sonrasında, %10 daha küçültüldü: 0.36 * 0.9 = 0.324 (Yuvarlayarak 0.32)
const WHEEL_SIZE = width * 0.32; 
const RADIUS = WHEEL_SIZE / 2;

// Çarkı ön plana çıkarmak için opaklıkları arttırılmış, parlak camgöbeği ve beyaz tonlar
const SLICE_COLORS = [
  'rgba(255, 255, 255, 0.55)', // Parlak Beyaz Cam
  'rgba(59, 130, 246, 0.45)', // Parlak Mavi
  'rgba(167, 139, 250, 0.50)', // Parlak Mor
  'rgba(14, 165, 233, 0.55)', // Parlak Camgöbeği
  'rgba(255, 255, 255, 0.40)', // Klasik Beyaz Cam
  'rgba(99, 102, 241, 0.45)', // Parlak İndigo
];

// SVG dilim çizim fonksiyonu
const createPieSlice = (index: number, total: number, radius: number) => {
  const anglePerSlice = 360 / total;
  const startAngle = index * anglePerSlice;
  const endAngle = (index + 1) * anglePerSlice;

  const startX = radius + radius * Math.cos((Math.PI * startAngle) / 180);
  const startY = radius + radius * Math.sin((Math.PI * startAngle) / 180);
  const endX = radius + radius * Math.cos((Math.PI * endAngle) / 180);
  const endY = radius + radius * Math.sin((Math.PI * endAngle) / 180);

  const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

  // Çarkın dilimleri
  return `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

export const WheelSpinner: React.FC<WheelSpinnerProps> = ({ title, subtitle, pool, onSelected, onCancel }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinValue] = useState(new Animated.Value(0));

  let displayPool = pool;
  
  // Eğer havuzda 1 veya 2 şehir varsa, çark görsel olarak kötü (veya yarım) durmasın diye 
  // sadece *görsel amaçlı* bu elemanları çoğaltarak çarkı en az 4 veya daha fazla dilim yapıyoruz.
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

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 4000, // 4 saniye
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      // Rastgele bir öğe seç
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIndex];
      onSelected(chosen);
    });
  };

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'], // 5 Tur
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <View style={styles.wheelContainer}>
        {/* İşaretçi (Pointer) */}
        <View style={styles.pointer} />

        <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate: spinAnimation }] }]}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <G rotation="-90" origin={`${RADIUS}, ${RADIUS}`}>
              {displayPool.map((city, index) => {
                const anglePerSlice = 360 / displayPool.length;
                const rotateText = index * anglePerSlice + anglePerSlice / 2;
                
                return (
                  <G key={index}>
                    {/* Dilim */}
                    <Path
                      d={createPieSlice(index, displayPool.length, RADIUS)}
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                      stroke="rgba(255, 255, 255, 0.7)" // Çizgileri Daha belirgin beyaz yap
                      strokeWidth={2.5}
                    />
                    {/* Metin (Sadece çok fazla şehir yoksa kodunu yaz, yoksa sığmaz) */}
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
          
          {/* Çarkın Göbeği (Dark) */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Let the ImageBackground from HomeScreen shine through
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text, // Now White
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
    // Arkaplandan belirgin seviyede ayırmak için dairesel parlama (halo) efekti
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Hafif buzlu cam tabanı
    borderRadius: WHEEL_SIZE / 2, // Tam daire
    shadowColor: '#FFF', // Beyaz parlama
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, // Parlama yoğunluğu
    shadowRadius: 30, // Parlamanın yayılma alanı
    elevation: 20, // Android için
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)', // İnce zarif dış çerçevesi
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
    borderTopColor: theme.colors.primary, // Blue accent pointer
    zIndex: 20,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Glass border
  },
  wheelInner: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.25,
    height: WHEEL_SIZE * 0.25,
    borderRadius: (WHEEL_SIZE * 0.25) / 2,
    backgroundColor: theme.colors.background, // Dark hub
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Thin glassy border
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
    borderRadius: theme.borderRadius.round, // Pill button
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
