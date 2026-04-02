// Ortak paylaşılan aralıklar ve stiller
const sharedSpacing = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
};

const sharedBorderRadius = {
    s: 6,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999, 
};

const sharedTypography = {
    h1: { fontSize: 32, fontWeight: 'bold' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.5 },
    body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0 },
    caption: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0 },
};

export const lightTheme = {
    colors: {
        primary: '#3B82F6', // Canlı orta mavi
        secondary: '#A7F3D0', // Pastel Nane Yeşili
        accent: '#8B5CF6', 
        background: '#0F172A', 
        surface: 'rgba(31, 41, 55, 0.8)', // Koyu füme gri cam
        text: '#FFFFFF', // Tam beyaz
        textSecondary: '#D1D5DB', // Açık gri
        border: 'rgba(255, 255, 255, 0.15)',
        error: '#EF4444', 
        success: '#10B981', 
    },
    spacing: sharedSpacing,
    borderRadius: sharedBorderRadius,
    typography: sharedTypography,
    images: {
        // Gündüz Modu: Aydınlık, bulutlu, mavi bir gökyüzü (yüksek çözünürlük)
        background: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?ixlib=rb-4.0.3&auto=format&fit=crop&w=3000&q=100',
    }
};

export const darkTheme = {
    colors: {
        primary: '#818CF8', // Göz yormayan, yumuşak indigo
        secondary: '#6EE7B7', // Geceye uygun zengin nane yeşili
        accent: '#C084FC', // Lila vurgu
        background: '#030712', // Neredeyse tamamen siyah uzay zemin
        surface: 'rgba(17, 24, 39, 0.85)', // Ekstra koyu, opak füme/gece camı
        text: '#F9FAFB', // En parlak beyazımsı gri
        textSecondary: '#9CA3AF', // Daha loş gri
        border: 'rgba(255, 255, 255, 0.10)', // Daha hafif çizgiler
        error: '#F87171', 
        success: '#34D399', 
    },
    spacing: sharedSpacing,
    borderRadius: sharedBorderRadius,
    typography: sharedTypography,
    images: {
        // Gece Modu: Göz alıcı, sonsuz yıldızlı galaksi/gece gökyüzü (Karasal objeler olmadan yüksek çözünürlüklü)
        background: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=3000&q=100',
    }
};

export type Theme = typeof lightTheme;
