export interface City {
    id: string;
    name: string;
    code: string;
    lat: number;
    lon: number;
}

export const CITIES: City[] = [
    { id: '1', name: 'İSTANBUL', code: 'IST', lat: 41.275, lon: 28.751 },
    { id: '2', name: 'İSTANBUL (SAW)', code: 'SAW', lat: 40.903, lon: 29.317 },
    { id: '3', name: 'ANKARA', code: 'ESB', lat: 40.128, lon: 32.995 },
    { id: '4', name: 'İZMİR', code: 'ADB', lat: 38.289, lon: 27.156 },
    { id: '5', name: 'ANTALYA', code: 'AYT', lat: 36.898, lon: 30.800 },
    { id: '6', name: 'ADANA', code: 'ADA', lat: 36.982, lon: 35.280 },
    { id: '7', name: 'TRABZON', code: 'TZX', lat: 40.995, lon: 39.789 },
    { id: '8', name: 'GAZİANTEP', code: 'GZT', lat: 36.947, lon: 37.478 },
    { id: '9', name: 'DİYARBAKIR', code: 'DIY', lat: 37.893, lon: 40.201 },
    { id: '10', name: 'ERZURUM', code: 'ERZ', lat: 39.956, lon: 41.170 },
    { id: '11', name: 'VAN', code: 'VAN', lat: 38.468, lon: 43.332 },
    { id: '12', name: 'BODRUM', code: 'BJV', lat: 37.250, lon: 27.664 },
    { id: '13', name: 'KAYSERİ', code: 'ASR', lat: 38.770, lon: 35.495 },
    { id: '14', name: 'SAMSUN', code: 'SZF', lat: 41.258, lon: 36.546 },
    { id: '15', name: 'DALAMAN', code: 'DLM', lat: 36.713, lon: 28.792 },
    { id: '16', name: 'MALATYA', code: 'MLX', lat: 38.435, lon: 38.090 },
    { id: '17', name: 'KONYA', code: 'KYA', lat: 37.979, lon: 32.561 },
];
