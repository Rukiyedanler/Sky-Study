import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FlightRecord } from './FlightHistoryService';

// Ortam değişkeninden (env) API Anahtarını al
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("DİKKAT: EXPO_PUBLIC_GEMINI_API_KEY bulunamadı! Lütfen .env dosyanızı kontrol edin.");
}

// Gemini İstemcisini başlat
const genAI = new GoogleGenerativeAI(apiKey?.trim() || "");

export interface AiAnalysisResult {
  tespit: string;
  oneri_sure_dk: number;
  motivasyon_metni: string;
}

const SYSTEM_PROMPT = `Sen Sky Study havacılık ve odaklanma uygulamasının uzman 'Kara Kutu' analiz motorusun. Görevin, sana verilen uçuş (odaklanma) verilerini analiz edip kullanıcının zayıf noktasını bulmak ve ona dinamik bir sonraki görev atamak. Yanıtın SADECE ve SADECE aşağıdaki JSON formatında olmalıdır. Başka hiçbir metin veya markdown (\`\`\`json vb.) içermemelidir:
{"tespit": "Kullanıcının durum analizi (max 2 cümle)", "oneri_sure_dk": 25, "motivasyon_metni": "Kısa bir mesaj"}`;

/**
 * Kullanıcının geçmiş uçuş verilerini analiz edip JSON formatında bir kara kutu raporu döndürür.
 * 
 * @param flightData - Kullanıcının geçmiş uçuşlarını içeren dizi
 * @returns AiAnalysisResult nesnesi
 */
export const analyzeFlightHistory = async (flightData: FlightRecord[]): Promise<AiAnalysisResult> => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API anahtarı eksik.");
    }

    if (!flightData || flightData.length === 0) {
      return {
        tespit: "Henüz analiz edilecek yeterli uçuş verisi bulunmuyor.",
        oneri_sure_dk: 25,
        motivasyon_metni: "İlk odaklanma seansına (uçuşuna) çıkmak için mükemmel bir zaman! Hadi başlayalım."
      };
    }

    // Modeli çağır (2026 ve sonrası için en güncel flash modeli)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT 
    });

    // Gönderilecek veriyi hazırla (JSON string'e çevir)
    const prompt = `Lütfen aşağıdaki uçuş verilerini analiz et:\n\n${JSON.stringify(flightData, null, 2)}`;

    // Gemini'ye istek at
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // AI bazen gevezelik edebilir, JSON kısmını garantiye alalım:
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    // String'i JSON nesnesine çevir
    const parsedData = JSON.parse(cleanText) as AiAnalysisResult;

    return parsedData;

  } catch (error: any) {
    console.error("Yapay Zeka Kara Kutu Analiz Hatası:", error);
    // Hata durumunda uygulamanın çökmemesi için varsayılan (fallback) bir değer döndür
    // Hatayı UI'da görebilmek için tespiti değiştiriyoruz
    return {
      tespit: "Hata detayı: " + (error.message || "Bilinmeyen hata"),
      oneri_sure_dk: 30,
      motivasyon_metni: "Kısa bir türbülans! Lütfen odaklanmaya manuel devam et."
    };
  }
};
