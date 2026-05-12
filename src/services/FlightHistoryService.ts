import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface FlightRecord {
  id?: string;
  userId: string;
  city: string; // Örn: "İstanbul", "Ankara"
  plannedDurationMinutes: number; // Hedeflenen süre (Örn: 45)
  actualDurationMinutes: number; // Gerçekleşen süre
  status: 'completed' | 'aborted'; // Başarılı mı, acil iniş mi?
  abortReason?: string; // Acil iniş yapıldıysa sebebi (Örn: "Sosyal medya", "Sıkıldım")
  timestamp: Date | Timestamp | any; // Firebase Timestamp
}

const COLLECTION_NAME = 'flight_history';

/**
 * Uçuş bittiğinde (başarılı veya acil iniş) veriyi kaydeder.
 */
export const saveFlightRecord = async (record: FlightRecord): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...record,
      timestamp: record.timestamp instanceof Date ? Timestamp.fromDate(record.timestamp) : record.timestamp || Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Uçuş kaydedilirken hata oluştu:", error);
    throw error;
  }
};

/**
 * Yapay zekaya göndermek üzere kullanıcının son X uçuşunu tarihe göre azalan şekilde çeker.
 * NOT: Firebase'de 'userId' ve 'timestamp' üzerinde Composite Index (Bileşik Dizin) gerekebilir.
 * Eğer composite index hatası alırsanız, orderBy'ı kaldırıp JavaScript ile sıralama yapabilirsiniz.
 */
export const getUserRecentFlights = async (userId: string, limitCount: number = 10): Promise<FlightRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const flights: FlightRecord[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      flights.push({
        id: doc.id,
        ...data,
      } as FlightRecord);
    });
    
    return flights;
  } catch (error) {
    console.error("Geçmiş uçuşlar çekilirken hata oluştu:", error);
    throw error;
  }
};


