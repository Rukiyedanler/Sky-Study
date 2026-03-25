export { CITIES } from '../data/cities';
export type { City } from '../data/cities';
import { CITIES } from '../data/cities';

// Gerçekçi Uçuş Süreleri Matrisi (Dakika Cinsinden)
// 1: IST (İstanbul), 2: ESB (Ankara), 3: ADB (İzmir), 4: CDG (Paris), 5: LHR (Londra)
// 6: HND (Tokyo), 7: JFK (New York), 8: BER (Berlin), 9: FCO (Roma), 10: AMS (Amsterdam)
const REAL_FLIGHT_DURATIONS: Record<string, Record<string, number>> = {
  '1': { '2': 60, '3': 70, '4': 225, '5': 250, '6': 660, '7': 650, '8': 170, '9': 150, '10': 210 }, // İstanbul'dan...
  '2': { '3': 75, '4': 240, '5': 260, '6': 670, '7': 680, '8': 185, '9': 165, '10': 225 }, // Ankara'dan...
  '3': { '4': 210, '5': 235, '6': 685, '7': 650, '8': 165, '9': 145, '10': 200 }, // İzmir'den...
  '4': { '5': 75, '6': 800, '7': 480, '8': 105, '9': 125, '10': 75 }, // Paris'ten...
  '5': { '6': 820, '7': 420, '8': 110, '9': 150, '10': 65 }, // Londra'dan...
  '6': { '7': 840, '8': 850, '9': 870, '10': 840 }, // Tokyo'dan...
  '7': { '8': 490, '9': 520, '10': 430 }, // New York'tan...
  '8': { '9': 130, '10': 80 }, // Berlin'den...
  '9': { '10': 150 }, // Roma'dan Amsterdam'a 2.5 saat
};

export const getFlightDuration = (originId: string, destId: string): number => {
  if (originId === destId) return 0;
  
  // Kombinasyonun Matrix'te bulunabilmesi için küçük ID olanı başa alıyoruz.
  const minId = Math.min(parseInt(originId), parseInt(destId)).toString();
  const maxId = Math.max(parseInt(originId), parseInt(destId)).toString();
  
  return REAL_FLIGHT_DURATIONS[minId]?.[maxId] || 120; // Veri yoksa standart 2 saat dön
};

export const filterDestinations = (originId: string, targetDuration: number) => {
  const allDestinations = [];
  
  // Tüm şehirlerin süresini çıkarıyoruz
  for (const city of CITIES) {
    if (city.id === originId) continue;
    
    const duration = getFlightDuration(originId, city.id);
    allDestinations.push({ city, duration });
  }
  
  // Hedef süreye matematiksel olarak en yakın olanları öne alıyoruz
  allDestinations.sort((a, b) => Math.abs(a.duration - targetDuration) - Math.abs(b.duration - targetDuration));
  
  // Süreyi biraz esnettik (±20 dakika kuralı)
  const matching = allDestinations.filter(d => Math.abs(d.duration - targetDuration) <= 20);
  
  // Kritik Nokta: Eğer havuzda hedefe tam uyan az şehir çıktıysa (Çark yarım/boş veya sıkıcı durmasın diye)
  // her durumda en yakın *minimum 8 şehri* ekranda gösteriyoruz!
  if (matching.length < 8) {
    return allDestinations.slice(0, 8); // En yakın ilk 8 şehri al
  }
  
  return matching;
};

export const calculateXP = (duration: number): number => {
  return Math.floor(duration * 1.5);
};
