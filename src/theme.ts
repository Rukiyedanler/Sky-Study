export const theme = {
    colors: {
        primary: '#3B82F6', // Mavi vurgu (Butonlar ve aktif öğeler)
        secondary: '#6366F1', // İndigo / Mor vurgu
        accent: '#8B5CF6', // Ekstra vurgu
        background: '#0F172A', // Çok derin lacivert/siyah (Uzay/Gece hissi)
        surface: 'rgba(30, 41, 59, 0.7)', // Yarı şeffaf koyu gri (Glassmorphism için)
        text: '#F8FAFC', // Saf tama yakın beyaz (Net okunabilirlik)
        textSecondary: '#94A3B8', // Açık gri (Alt metinler, ikonlar)
        border: 'rgba(255, 255, 255, 0.1)', // İnce, şeffaf sınır çizgileri
        error: '#EF4444', 
        success: '#10B981', 
    },
    spacing: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        s: 6,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999, // Tam yuvarlak butonlar için (pill shape)
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: 'bold' as const,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
            letterSpacing: -0.5,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            letterSpacing: 0,
        },
        caption: {
            fontSize: 14,
            fontWeight: '500' as const, // Küçük yazılarda biraz daha kalınlık (okunabilirlik)
            letterSpacing: 0,
        },
    },
    images: {
        // Yıldızlı Gökyüzü (Kullanıcı İsteği: Dağsız, sadece gökyüzü)
        background: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=100',
    }
};
