export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
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
const TIMEOUT_MS = 8000; // 8 seconds timeout to prevent hanging

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

  // Videolardan rastgele birini seç ki hep aynı videoyu göstermesin (per_page=3)
  const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  
  if (!randomVideo.video_files || randomVideo.video_files.length === 0) return null;

  // mp4 olanları filtrele
  const mp4Files = randomVideo.video_files.filter(f => f.file_type === 'video/mp4');
  if (mp4Files.length === 0) return null;

  // Öncelik HD, yoksa SD
  const hdVideo = mp4Files.find(f => f.quality === 'hd');
  if (hdVideo) return hdVideo.link;

  const sdVideo = mp4Files.find(f => f.quality === 'sd');
  if (sdVideo) return sdVideo.link;

  return mp4Files[0].link;
};

export const fetchCityVideo = async (cityName: string): Promise<string | null> => {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

  if (!apiKey) {
    console.warn('PEXELS API KEY is missing. Returning fallback video directly.');
    return getFallbackVideo();
  }

  try {
    const query = `${cityName} city aerial`;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=3`;

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
const getFallbackVideo = async (): Promise<string | null> => {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(FALLBACK_QUERY)}&orientation=portrait&size=medium&per_page=3`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) return null;

    const data: PexelsResponse = await response.json();
    return extractBestVideoUrl(data.videos);
  } catch (error) {
    console.error('Fallback video also failed:', error);
    return null;
  }
};
