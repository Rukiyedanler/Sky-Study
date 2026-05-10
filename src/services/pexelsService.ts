export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  video_files: PexelsVideoFile[];
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  videos: PexelsVideo[];
}

const FALLBACK_QUERY = 'beautiful clouds sky';
const TIMEOUT_MS = 8000;
const ULTIMATE_FALLBACK_VIDEO = "https://videos.pexels.com/video-files/3121459/3121459-hd_1080_1920_24fps.mp4"; // Harika bir gökyüzü videosu (sabit link)
const ISTANBUL_VIP_VIDEO = "https://videos.pexels.com/video-files/34234127/14508448_1080_1920_60fps.mp4"; // Webtekno kalitesinde Istanbul Boğazı havadan çekim

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal as any,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const extractBestVideoUrl = (videos: PexelsVideo[]): string | null => {
  if (!videos || videos.length === 0) return null;

  // Rastgele sıraya diz (hep aynı videoyu göstermemek için)
  const shuffledVideos = [...videos].sort(() => 0.5 - Math.random());

  for (const video of shuffledVideos) {
    if (!video.video_files || video.video_files.length === 0) continue;

    const mp4Files = video.video_files.filter(f => f.file_type === 'video/mp4' && f.height);
    if (mp4Files.length === 0) continue;

    // Çözünürlüğe (height) göre sırala (Büyükten küçüğe)
    const sortedMp4s = mp4Files.sort((a, b) => b.height - a.height);

    // 4K (UHD) videolar Web tarayıcılarında veya eski cihazlarda kasma/siyah ekran yapar.
    // Bu yüzden yüksekliği 960px ile 1920px (1080p/720p) arasında olan en iyi videoyu buluyoruz.
    const optimalVideo = sortedMp4s.find(f => f.height <= 1920 && f.height >= 960);
    if (optimalVideo) return optimalVideo.link;

    // Eğer optimal çözünürlük yoksa, eldeki en iyi (en yüksek çözünürlüklü) mp4'ü döndür
    return sortedMp4s[0].link;
  }

  return null; // Hiçbir videoda geçerli mp4 yoksa
};

export const fetchCityVideo = async (cityName: string): Promise<string | null> => {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

  if (!apiKey) {
    console.warn('PEXELS API KEY is missing. Returning fallback video directly.');
    return getFallbackVideo();
  }

  try {
    // Şehir ismini temizle (ör. "İSTANBUL (SAW)" -> "ISTANBUL")
    const cleanCityName = cityName.replace(' (SAW)', '').trim();
    
    // İSTANBUL İÇİN VIP KONTROLÜ (Kusursuz, sabitlenmiş video)
    if (cleanCityName === 'İSTANBUL' || cleanCityName === 'ISTANBUL') {
      return ISTANBUL_VIP_VIDEO;
    }

    // city aerial araması bazı küçük şehirlerde sonuç vermeyebiliyor, bu yüzden daha genel bir arama yapıyoruz.
    const query = `${cleanCityName} city`;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=5`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    const data: PexelsResponse = await response.json();
    const videoUrl = extractBestVideoUrl(data.videos);

    if (videoUrl) {
      return videoUrl;
    }

    // Videolar boş döndüyse fallback at
    throw new Error('No videos found for city');
  } catch (error) {
    console.warn(`Failed to fetch video for ${cityName}, falling back to clouds:`, error);
    return getFallbackVideo();
  }
};

// Fallback (Yedek) video çağıran fonksiyon
const getFallbackVideo = async (): Promise<string> => {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
  if (!apiKey) return ULTIMATE_FALLBACK_VIDEO;

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(FALLBACK_QUERY)}&orientation=portrait&size=medium&per_page=5`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      console.warn('Pexels API Fallback Failed (Rate Limit vb.), using static fallback link.');
      return ULTIMATE_FALLBACK_VIDEO;
    }

    const data: PexelsResponse = await response.json();
    const bestUrl = extractBestVideoUrl(data.videos);
    return bestUrl || ULTIMATE_FALLBACK_VIDEO;
  } catch (error) {
    console.error('Fallback video also failed, using static fallback link:', error);
    return ULTIMATE_FALLBACK_VIDEO;
  }
};
