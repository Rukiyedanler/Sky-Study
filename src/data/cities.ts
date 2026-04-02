export interface City {
    id: string;
    name: string;
    code: string;
    lat: number;
    lon: number;
}

export const CITIES: City[] = [
    // Türkiye İçi
    { id: '1', name: 'İSTANBUL', code: 'IST', lat: 41.0082, lon: 28.9784 },
    { id: '2', name: 'ANKARA', code: 'ESB', lat: 39.9334, lon: 32.8597 },
    { id: '3', name: 'İZMİR', code: 'ADB', lat: 38.4237, lon: 27.1428 },
    { id: '11', name: 'ANTALYA', code: 'AYT', lat: 36.8969, lon: 30.7133 },
    { id: '12', name: 'ADANA', code: 'ADA', lat: 37.0000, lon: 35.3213 },
    { id: '13', name: 'TRABZON', code: 'TZX', lat: 41.0027, lon: 39.7168 },
    { id: '14', name: 'GAZİANTEP', code: 'GZT', lat: 37.0662, lon: 37.3833 },
    { id: '15', name: 'DİYARBAKIR', code: 'DIY', lat: 37.9144, lon: 40.2306 },
    { id: '16', name: 'ERZURUM', code: 'ERZ', lat: 39.9000, lon: 41.2700 },
    { id: '17', name: 'VAN', code: 'VAN', lat: 38.4891, lon: 43.3897 },
    { id: '18', name: 'BODRUM', code: 'BJV', lat: 37.0344, lon: 27.4296 },
    { id: '19', name: 'KAYSERİ', code: 'ASR', lat: 38.7312, lon: 35.4787 },
    { id: '20', name: 'SAMSUN', code: 'SZF', lat: 41.2867, lon: 36.3300 },

    // Global Uluslararası
    { id: '4', name: 'PARİS', code: 'CDG', lat: 48.8566, lon: 2.3522 },
    { id: '5', name: 'LONDRA', code: 'LHR', lat: 51.5074, lon: -0.1278 },
    { id: '6', name: 'TOKYO', code: 'HND', lat: 35.6762, lon: 139.6503 },
    { id: '7', name: 'NEW YORK', code: 'JFK', lat: 40.7128, lon: -74.0060 },
    { id: '8', name: 'BERLİN', code: 'BER', lat: 52.5200, lon: 13.4050 },
    { id: '9', name: 'ROMA', code: 'FCO', lat: 41.9028, lon: 12.4964 },
    { id: '10', name: 'AMSTERDAM', code: 'AMS', lat: 52.3676, lon: 4.9041 },
    { id: '21', name: 'DUBAİ', code: 'DXB', lat: 25.2048, lon: 55.2708 },
    { id: '22', name: 'MOSKOVA', code: 'SVO', lat: 55.7558, lon: 37.6173 },
    { id: '23', name: 'BAKÜ', code: 'GYD', lat: 40.4093, lon: 49.8671 },
    { id: '24', name: 'SEUL', code: 'ICN', lat: 37.5665, lon: 126.9780 },
    { id: '25', name: 'BARSELONA', code: 'BCN', lat: 41.3851, lon: 2.1734 }
];
