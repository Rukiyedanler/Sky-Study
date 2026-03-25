export interface City {
  id: string;
  name: string;
  code: string;
}

// 40 Adet Dünyaca Ünlü Şehir (Daha Zengin Bir Havuz İçin)
export const CITIES: City[] = [
  { id: '1', name: 'İstanbul', code: 'IST' },
  { id: '2', name: 'Tokyo', code: 'HND' },
  { id: '3', name: 'New York', code: 'JFK' },
  { id: '4', name: 'Londra', code: 'LHR' },
  { id: '5', name: 'Paris', code: 'CDG' },
  { id: '6', name: 'Berlin', code: 'BER' },
  { id: '7', name: 'Dubai', code: 'DXB' },
  { id: '8', name: 'Singapur', code: 'SIN' },
  { id: '9', name: 'Roma', code: 'FCO' },
  { id: '10', name: 'Los Angeles', code: 'LAX' },
  { id: '11', name: 'Seul', code: 'ICN' },
  { id: '12', name: 'Amsterdam', code: 'AMS' },
  { id: '13', name: 'Barselona', code: 'BCN' },
  { id: '14', name: 'Madrid', code: 'MAD' },
  { id: '15', name: 'Moskova', code: 'SVO' },
  { id: '16', name: 'Pekin', code: 'PEK' },
  { id: '17', name: 'Sidney', code: 'SYD' },
  { id: '18', name: 'Toronto', code: 'YYZ' },
  { id: '19', name: 'Sao Paulo', code: 'GRU' },
  { id: '20', name: 'Kahire', code: 'CAI' },
  { id: '21', name: 'Delhi', code: 'DEL' },
  { id: '22', name: 'Bangkok', code: 'BKK' },
  { id: '23', name: 'Kuala Lumpur', code: 'KUL' },
  { id: '24', name: 'Hong Kong', code: 'HKG' },
  { id: '25', name: 'Viyana', code: 'VIE' },
  { id: '26', name: 'Zürih', code: 'ZRH' },
  { id: '27', name: 'Atina', code: 'ATH' },
  { id: '28', name: 'Lizbon', code: 'LIS' },
  { id: '29', name: 'Stockholm', code: 'ARN' },
  { id: '30', name: 'Oslo', code: 'OSL' },
  { id: '31', name: 'Kopenhag', code: 'CPH' },
  { id: '32', name: 'Helsinki', code: 'HEL' },
  { id: '33', name: 'Dublin', code: 'DUB' },
  { id: '34', name: 'Brüksel', code: 'BRU' },
  { id: '35', name: 'Prag', code: 'PRG' },
  { id: '36', name: 'Varşova', code: 'WAW' },
  { id: '37', name: 'Budapeşte', code: 'BUD' },
  { id: '38', name: 'Miami', code: 'MIA' },
  { id: '39', name: 'Chicago', code: 'ORD' },
  { id: '40', name: 'San Francisco', code: 'SFO' },
];

// Belirli iki şehir arasında her zaman aynı süreyi veren pseudo-random bir hesaplama
export const getFlightDuration = (originId: string, destId: string): number => {
  if (originId === destId) return 0;
  
  const id1 = parseInt(originId);
  const id2 = parseInt(destId);
  
  // Kombinasyonun sıradan bağımsız aynı sonucu vermesi için min/max alıyoruz
  const minId = Math.min(id1, id2);
  const maxId = Math.max(id1, id2);
  
  // Hash algoritması
  const hash = (minId * 73) + (maxId * 37) + (minId * maxId * 11);
  
  // Önemli: Pomodoro kullanıcıları genelde 20-60 dk seçer. Bu yüzden sürelerin
  // büyük bir kısmını (örneğin %70'ini) 20 - 75 dakika arasına yığacak bir normalizasyon yapıyoruz.
  const baseRandom = hash % 100; // 0-99 arası
  
  if (baseRandom < 60) {
     // %60 ihtimalle kısa/orta odaklanma menzili (20 - 65 dk)
     return 20 + (hash % 46); 
  } else if (baseRandom < 85) {
     // %25 ihtimalle standart/uzun odaklanma menzili (65 - 100 dk)
     return 65 + (hash % 36);
  } else {
     // %15 ihtimalle ekstrem menzil (100 - 180 dk)
     return 100 + (hash % 81);
  }
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
