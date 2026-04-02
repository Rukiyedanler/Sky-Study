export { CITIES } from '../data/cities';
export type { City } from '../data/cities';
import { CITIES } from '../data/cities';

// Haversine formülü ile iki koordinat (Enlem/Boylam) arası kuş uçuşu mesafeyi bulur (km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Dünyanın yarıçapı (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export const getFlightDuration = (originId: string, destId: string): number => {
  if (originId === destId) return 0;
  
  const origin = CITIES.find(c => c.id === originId);
  const dest = CITIES.find(c => c.id === destId);

  if (!origin || !dest) return 120; // Bulunamazsa standart 2 saat

  const distKm = getDistanceFromLatLonInKm(origin.lat, origin.lon, dest.lat, dest.lon);

  // Ticari yolcu uçağı ortalama sürat: 700 km/s (Kalkış, Tırmanma ve İniş kaybı dahil block hızı)
  // Ekstra olarak kalkış/iniş taksisi (Rötar vb. operasyonlar) için 35 dakika ekliyoruz.
  const durationMin = (distKm / 700) * 60 + 35;
  
  // Bulunan sonucu 5 dakikanın katlarına yuvarlıyoruz ki bilette "57 dk" gibi küsürat göze batmasın (Örn: 60, 65, 70...)
  return Math.round(durationMin / 5) * 5;
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
  
  // Kullanıcının kuralı: Hedeflenen süreye en fazla 30 dakika eklenebilir, veya 20 dakika çıkarılabilir
  // Yani: hedeften 20 dk az veya 30 dk çok olabilir
  const matching = allDestinations.filter(d => 
     d.duration >= targetDuration - 20 && d.duration <= targetDuration + 30
  );
  
  // Bulunamama durumu `HomeScreen` içerisinde kontrol ediliyor.
  return matching;
};

export const calculateXP = (duration: number): number => {
  return Math.floor(duration * 1.5);
};
